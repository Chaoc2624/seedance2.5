# Reverse Engineering Reference

对应铁律 2（"前端不行先逆向"）。前端操作失败时，**第一反应不是跳过，是找后端 API 直接调用**。这份文件给 5 步 SOP 和 3 个真实案例。

## 为什么要逆向

目标站的前端可能有：

- Vue / React mount 竞态失败（SSR hydration 错位、路由守卫冲突）
- jQuery 事件与现代框架事件互相 stopPropagation
- 反自动化逻辑专门盯着 Playwright 的 WebDriver 标记
- 验证码组件 mount 失败，但提交逻辑其实不依赖验证码

而后端 API 几乎不会同时做这些防护——**只要拿到正确的 endpoint + session cookie + payload，直接 fetch 就能完成动作**。成本：3-5 分钟；回报：一条原本要跳过的外链。

## 5 步 SOP

### 步骤 1：抽取所有 inline script 和外部 script 的 URL

```js
// 在目标页控制台跑
const inline = [...document.querySelectorAll('script:not([src])')].map(s => s.textContent)
const external = [...document.querySelectorAll('script[src]')].map(s => s.src)
console.log({ inlineCount: inline.length, externalCount: external.length })
copy(JSON.stringify({ inline, external }))  // 复制到剪贴板
```

把结果粘贴到本地，用 grep 或 agent 阅读。注意混淆过的 bundle（`main.abc123.js`）也要下载：

```bash
curl -s 'https://site/static/js/main.abc123.js' -o /tmp/bundle.js
```

### 步骤 2：正则提取 API endpoint

在 inline 和外部 bundle 里找：

```
axios\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)
fetch\(\s*['"`]([^'"`]+)
\$\.(get|post|ajax)\(\s*[\{'"`]([^'"`]+)
XMLHttpRequest.*\.open\(\s*['"`][A-Z]+['"`],\s*['"`]([^'"`]+)
```

整理出一份 endpoint 清单：`/api/user/signup`、`/ajax/comment/post`、`/vote-post` 之类。

### 步骤 3：确定 base URL 前缀

API endpoint 可能是相对路径（`/api/v1/...`）或纯 path（`/vote-post`）。开发者网络面板抓一次 XHR，看实际请求的 host 和前缀：

- `/api/`
- `/api/v1/`
- `/api/v2/`
- `/ajax/`
- `/rest/`
- 独立子域（`api.domain.com`）

实在看不出来就暴力试：用当前页的 origin 拼所有常见前缀，看哪个返回 200 或 401（401 说明 endpoint 存在但要登录）。

### 步骤 4：带 session cookie 直接 fetch 调用

在目标站控制台里（已登录状态）：

```js
const res = await fetch('/api/v1/TARGET_ENDPOINT', {
  method: 'POST',
  credentials: 'include',        // 带上 cookie
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content,  // 如果有
  },
  body: JSON.stringify({
    // 从步骤 1-2 推出的 payload 结构
  }),
})
console.log(res.status, await res.text())
```

从控制台发的 fetch 自动带 cookie、自动满足 CORS same-origin、不触发前端的反自动化逻辑——**这是最稳的调用方式**。

### 步骤 5：实测效果 + 归档

调用成功后：

- 跑 `SKILL.md` Core Workflow 第 6 步的 `rel` 实测
- 把 endpoint + payload 结构追加到 `platforms.md` 对应平台段
- 如果是普遍可复用的模式（例如"某种 CMS 的注册 API"），追加到本文件底部"通用模式"段

## 真实案例

### 案例 1：SaaS 目录站的投票按钮点不动

- **现象**：投票按钮 `<button class="vote-btn">` 点了没任何反应。要求"访问 5 个产品页面赚积分才能提交自己的产品"，手动点 5 次估计 20 分钟。
- **逆向**：
  1. 抽 `/static/js/news.min.js`，grep `axios.post`
  2. 命中 `axios.post('/vote-post', { postId: id, voteType: 'up' })`
  3. 控制台直接 fetch 5 次 `/vote-post`，每次 id 换成一个产品 id
- **结果**：15 秒完成原本 20 分钟的刷积分流程。

### 案例 2：velog.io 的 6 位 OTP 注册

- **现象**：邮箱注册页有 6 个独立的单字符 input，收到邮件里的 6 位 OTP 后应该逐字符填。自动跳转下一个 input 的逻辑在 jQuery `onkeyup` 里。Playwright 的 `fill` / `type` / `pressSequentially` 全部失败——字符写进去了，但 onkeyup 没触发或触发时 input 已失焦。
- **逆向**：
  1. 抓提交注册时的网络请求，发现 `POST /signup` 带 `{ email, password, emailCode, username }`
  2. `emailCode` 就是 6 位 OTP
  3. 直接 fetch 这个 endpoint，跳过整个 OTP UI
- **结果**：注册成功。OTP UI 绕过。

### 案例 3：Vue mount 失败导致表单按钮灰色

- **现象**：某站的注册表单提交按钮始终灰色（disabled）。Vue devtools 显示根组件 mount 失败，`v-if` 绑定的 `isLoaded` 永远是 false。按钮 disabled 属性由 `isLoaded && !errors.length` 控制。
- **逆向**：
  1. 直接找 `axios.post('/auth/register'` 的 endpoint
  2. 在控制台手动 fetch，绕过整个 Vue 实例的 broken state
- **结果**：注册成功。

## 特殊失败模式

### Cloudflare Challenge 吃掉 FormData

**现象**：某站的表单用 `multipart/form-data` 提交。走浏览器页面提交时 CF challenge 触发，返回 5 秒等待页；等待页刷新后提交的 FormData 被吞（CF 不透传 multipart body 到源站）。

**对策**：

- 改用 `application/json` 或 `application/x-www-form-urlencoded` 提交相同的字段——CF 只吞 multipart，不吞这俩。
- 或者先访问任一页触发 CF challenge 通过，拿到 `cf_clearance` cookie，再用 fetch 带着该 cookie 提交——CF 对已通过 challenge 的会话放行。

### CSRF token 绑定会话

**现象**：API 返回 `403 CSRF mismatch`。

**对策**：token 必须从当前页面拿（`meta[name="csrf-token"]` 或某个 hidden input），不能跨页面 / 跨 session 复用。刷新页面后所有旧 token 作废。

### API 需要特定 `User-Agent`

**现象**：fetch 返回 200 但响应是"请使用官方客户端"。

**对策**：在 fetch 的 `headers` 里加 `User-Agent`（某些情况下）或 `X-Requested-With: XMLHttpRequest`（很多 Rails / Django 后端靠这个区分 AJAX）。

## 通用逆向技巧

- **先不登录**看看公开页面的 XHR 流量——能暴露一些不需要 auth 的 endpoint
- **React / Vue 的 bundle 里常有整个路由表**——grep `path:` / `route:` 能一次性拿到前端所有路由和对应的组件，反推后端 endpoint
- **开发者工具的 "Copy as fetch"**——Chrome devtools 右键网络请求可以直接复制成 fetch 调用代码，是最快的起点
- **注意浏览器扩展污染**——某些扩展会注入 XHR/fetch 的 wrapper，逆向分析时在无痕模式或纯净 Profile 操作
