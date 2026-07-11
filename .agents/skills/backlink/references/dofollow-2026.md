# Dofollow 2026 Reference

2026 年经过 100+ 平台实测，仍能稳定拿到 Dofollow 的三大类，以及一份"曾经 Dofollow、现已降级"的清单。每条都要用 `SKILL.md` Core Workflow 第 6 步的 JS 片段**再实测一次**——本文件是起点地图，不是终点答案。

## 第一类：开发者博客平台

特点：以 Markdown 文章为内容单位，注册门槛低，即发即收录，正文里的 `<a href>` 基本全部 Dofollow。

### velog.io

- **语种**：韩国（UI 韩文，支持英文内容发布）
- **注册**：GitHub / Google OAuth
- **发文**：Markdown，支持代码块、图片。文章内链接默认 Dofollow。
- **特殊坑点**：OTP 注册页的 6 位验证码输入框是 6 个独立的 Vue input，自动跳转逻辑在 jQuery `onkeyup` 里，Playwright 的 `fill` / `type` / `pressSequentially` 都无法正确触发跳转。对策：逆向 `POST /signup` API 直接带 `emailCode` 参数调用（详见 `reverse-eng.md` 案例）。
- **Dofollow 验证**：发完文章后在文章页控制台跑 Core Workflow 第 6 步的 JS。

### dev.to

- **注册**：GitHub OAuth 最稳。
- **发文**：Markdown，文章内链接 Dofollow。
- **建议策略**：不只是发一篇文章就完事。把 dev.to 当作"链接枢纽"—— 一篇高质量文章可以内链导向你的其它外链站点（velog / telegra.ph / medium），形成 PBN 形态但内容合规。详见 `strategies.md`。
- **审核**：新账号前几篇文章会被 shadow-ban（"published" 但不在公开 feed 里），仍然有 SEO 价值，搜索引擎可抓。

### telegra.ph

- **注册**：**不需要注册**。可直接 POST 到 Telegraph API 创建文章，无账号系统。
- **DR**：DR92（2026 实测）
- **创建方式**：用官方 API（`POST https://api.telegra.ph/createPage`），秒级完成。也可以用浏览器手动，但 API 快得多。
- **Dofollow**：文章正文内链接默认 Dofollow。
- **已知坑**：部分国家 ISP 屏蔽 telegra.ph 前端页面，但 API 端点不受影响。

### rentry.co

- **注册**：不需要。通过 `curl` POST 即可创建 paste。
- **创建方式**：`curl -X POST https://rentry.co/api/new -d "text=..."`
- **Dofollow**：paste 内链接默认 Dofollow。
- **寿命**：paste 默认永久保留。可以加编辑码以便后期更新。

## 第二类：SaaS 目录提交

特点：提交产品 URL → 系统自动生成 listing 页 → "Visit website" 按钮基本都是 Dofollow。

**识别特征**（判断一个站是不是 SaaS 目录）：

- 首页或 header 有 "Submit product" / "Submit tool" / "Add your product" 类入口
- 站点 URL 结构是 `/tools/品牌-slug` 或 `/products/品牌-slug`
- 提交表单极简：通常只要求 URL、标题、一句话描述、分类、logo

**获取成本**：最低的一类。填 1-3 个字段 + 等审核。

**Dofollow 率**：接近 100%（2026 实测），偶尔见到给 `sponsored` 标签的付费版位置。

**关键风险（2026）**：**大量目录站转付费**。免费提交的窗口正在关闭——2025 年底到 2026 年初一次大清洗，许多老牌目录把免费位改成付费或下线。优先提交还在开放免费位的目录，越早越好。

**操作提示**：

- 同一条产品描述/截图/logo 可以在多个目录复用，节省时间。
- 部分目录要求 "Submitter email 必须属于产品域名"（为了验证归属）—— 这时用品牌邮箱而不是 Gmail，和铁律 9 的 fallback 不矛盾（对象不同：铁律 9 说"普通站用干净 Gmail"）。

## 第三类：论坛 Profile 的 Website 字段

特点：注册论坛账号 → 编辑 Profile → 在 "Website" / "Homepage" 字段填你的站点 URL。

### phpBB（全球最常见的开源论坛引擎）

- **字段**：`pf_phpbb_website`（Profile 的 Website 字段）
- **Dofollow 率**：**100%**（本项目实测所有 phpBB 站都是 Dofollow）
- **操作**：`ucp.php?i=ucp_profile&mode=profile_info` → 填 Website → Submit
- **识别**：页脚有 "Powered by phpBB®"；URL 路径里有 `viewtopic.php` / `viewforum.php`
- **注意**：很多 phpBB 论坛要求发几个帖子才能编辑 Profile（防灌水）。先发 3-5 条版块相关主题或回复，再回去填 Website。

### Boardhost 免费论坛

- **特点**：**无需注册**的免费论坛服务
- **字段**：Link URL（在发帖表单里，不是 Profile 里）
- **Dofollow**：该字段默认 Dofollow
- **速度**：秒发

### Discuz（中文圈论坛引擎）

- **字段**：Site 字段（Profile）
- **关键坑**：编辑 Profile 的 URL 有两种，容易选错——
  - `home.php?mod=spacecp&ac=profile&op=base` → 基本资料（没有 Site 字段）
  - `home.php?mod=spacecp&ac=profile&op=info` → 扩展资料（**Site 字段在这里**）
- **Dofollow**：多数 Discuz 站 Site 字段是 Dofollow，少数站长自己加了 nofollow（仍然要实测）。

### 其它论坛引擎

- **vBulletin**：Profile 有 Homepage 字段，多数 nofollow。不作为 Dofollow 目标，仅作为多样化信号。
- **XenForo**：Profile 字段多数 nofollow，同上。
- **MyBB**：Profile Website 字段，Dofollow 率约 40%，逐站实测。

## 已确认降级（曾经 Dofollow，2026 已加 nofollow）

2026 年一轮大规模降级，平台集中响应 Google 政策给 UGC 内容加 `rel="ugc nofollow"`：

- `paragraph.com` — 文章内链接降级
- `hackmd.io` — 公开 note 链接降级
- `justpaste.it` — 链接降级
- `codepen.io` — pen 描述里的链接降级
- 多数"paste / note / pad" 类平台集体降级

**规律**：只要平台主要内容是 UGC（用户生成内容）、DR 又够高（容易被 SEO 圈注意到），就会被 Google 政策压力推着升 nofollow。2026 年起优先假设此类平台都已降级，实测后再决定用不用。

**降级后还值不值得做**：见 `SKILL.md` "Out of Scope" 上面的 Nofollow 讨论 —— 高 DR 站（GitHub DR96 / Medium DR94）的 Nofollow 仍有品牌信号价值，但不计入 Dofollow 指标。
