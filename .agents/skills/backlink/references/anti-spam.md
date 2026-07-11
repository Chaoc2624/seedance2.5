# Anti-Spam Reference

对应 WP 评论 / 表单站最常见的 6 种反垃圾系统的**识别特征 + 能否绕过 + 绕过组合**。识别入口见 `wp-comments.md`；本文件只谈对策。

## 六系统总览

| 系统 | 能否绕过 | 核心对策 |
| --- | --- | --- |
| Akismet | 能 | 邮箱信誉 + IP 信誉 + URL 位置组合 |
| Antispam Bee | 能 | Playwright 原生键盘输入（逐字符） |
| WPantispam Protect | 看配置 | 严格模式：纯文本 + URL 字段；宽松模式：直接过 |
| CleanTalk | 不能 | 403 硬拦，跳过 |
| hCaptcha Enterprise | 不能（评论场景） | 评论内容被服务端清洗 |
| Jetpack Highlander | 不能 | 评论在跨域 iframe，无法注入 |

## Akismet

**关键发现**：Akismet 判断垃圾评论**主要看邮箱信誉 + IP 信誉**，不是评论内容本身。品牌域名邮箱一旦被标记，后续所有评论都会被吞。

**100% 绕过组合**：

- **邮箱**：全新的、有真实使用痕迹的 Gmail（不是 catch-all，不是品牌域名）。名字用随机真实人名（不用 "Admin" / "Team" / 品牌名）。
- **IP**：住宅代理 / ISP 代理，不用数据中心 IP。IP 的"是否曾被多个网站报告为 spam 来源"比 IP 的地理位置更重要。
- **URL 位置**：外链**只放在 `url` 字段**，正文里不出现任何 http/https。正文出现 URL 是 Akismet 最强的垃圾信号之一。
- **评论内容**：对文章内容有具体回应（引用一句原文 + 补充观点 > 通用称赞）。

提交失败（评论进不了审核队列，直接消失）时，优先换邮箱而不是换 IP。

## Antispam Bee

**识别**：德语圈流行的 WP 插件，检测"真人是否在打字"。

**关键发现**：监听 textarea 的 `keydown` 事件。如果评论内容是 `element.value = '...'` 或 Playwright 的 `fill()` 一次塞入，**不触发键盘事件 → 被判为 bot → 403 或静默吞**。

**对策**：

- Playwright：`page.locator('#comment').pressSequentially(text, { delay: 50 })` — 逐字符输入，触发完整键盘事件链。
- claude-in-chrome：使用 `form_input` 类型字段操作时默认会模拟键盘；不要用 `javascript_tool` 注入赋值。
- computer-use：`type` 工具本身就是真键盘，默认就过。

附加要求：

- 在开始输入前先在 textarea 上点一次，让其获得 focus（Antispam Bee 有些版本还要求 `focus` 事件）。
- 不要粘贴（`Cmd+V`）——某些版本会对粘贴事件单独打分。

## WPantispam Protect

**识别**：hidden 字段名 `wpantispam-key`；页面 footer / form 附近有 "WPantispam" 字样。

**两种模式**：站长可以配置严格或宽松。严格模式与宽松模式外部看起来一样，只能靠试。

- **宽松模式**：正常填表即可通过。直接按 `wp-comments.md` SOP 操作。
- **严格模式**：要求"正文纯文本 + 外链只放 URL 字段"。违反任何一条静默吞。

**通用对策**（无论模式都成立）：正文绝对不放 URL，外链放 `url` 字段。严格模式下如果评论不过，换一篇文章试（不换站）—— 有些站 WPantispam 按文章启用。

## CleanTalk

**识别**：页面加载 `cleantalk-antispam` 脚本；hidden 字段 `ct_checkjs`。

**绕过可能性**：**不能**。CleanTalk 服务端用云端黑名单做 IP+内容+UA 的联合判断，提交返回 403 硬拦。

**对策**：识别到 CleanTalk 直接标记该站跳过，归档到 `dead-sites.md` "高强度反垃圾站" 段。不要反复重试——每次失败会加重 IP 的信誉惩罚。

## hCaptcha Enterprise

**识别**：评论按钮周围有 `<div class="h-captcha" data-sitekey="...">`。Enterprise 版与免费版外部不可区分，只能靠提交结果判断。

**现象**：验证码本身可以人工过（见下方"人机协作"段），但**提交后服务端会清洗评论内容**——URL 被 strip、HTML 被 escape、comment `url` 字段被置空。评论会发出来，但不带你的外链。

**对策**：发现提交后链接消失的站，归档为 hCaptcha Enterprise。后续遇到 hCaptcha 要先做一次 sacrificial submission 测试（用不重要的品牌测），确认不是 Enterprise 再正式发。

## Jetpack Highlander

**识别**：评论区被 `<iframe src="https://jetpack.wordpress.com/jetpack-comment/...">` 替换，表单不在主文档里。

**为什么不能绕过**：iframe 是跨域的（jetpack.wordpress.com），Playwright / 浏览器自动化工具无法直接操作跨域 frame 的 DOM（CORS）。且 Jetpack 要求使用 WordPress.com / Twitter / Facebook / Google 账号登录评论。

**对策**：归档跳过。Jetpack Highlander = 硬拦。

## 十种验证码 / 人机检查的处理分类

| 类型 | 谁来处理 | 说明 |
| --- | --- | --- |
| reCAPTCHA v3（不可见） | agent 自动 | 行为分打够就过，正常填表即可 |
| reCAPTCHA v2 checkbox "我不是机器人" | agent 自动 / 少数需人工 | 住宅 IP + 正常行为 → 打勾就过；高风险评分触发九宫格 → 叫人 |
| reCAPTCHA v2 九宫格图片题 | **人工** | agent 做不了 |
| hCaptcha 免费版 | **人工** | 含滑块/拼图 |
| hCaptcha Enterprise | 人工过验证，但内容被清洗 | 见上 Jetpack 段 |
| Cloudflare Turnstile | agent 自动 | 行为分打够自动过 |
| 文本算术题 / "what is 2+3" | agent 自动 | 直接读题回答 |
| 滑块拼图（Tencent / Geetest） | **人工** | |
| 图像旋转 / 方向题 | **人工** | |
| 邮件链接确认 | agent 自动（开新标签页） | 见铁律 5 |

## 人机协作协议（配合铁律 10）

agent 遇到"人工才能过"的验证码时，按以下顺序：

1. `browser_fill_form` 或 `pressSequentially` 填完表单**所有其他字段**，包括勾选 GDPR checkbox、下拉选择等。
2. 用 `browser_evaluate` 执行 `document.querySelector(CAPTCHA_SELECTOR).scrollIntoView({block:'center'})`，让验证码处于视口中心。
3. `browser_take_screenshot` 截一张当前状态图作为凭证。
4. 向用户发送一句话确认："所有字段已填完，只剩 [验证码类型]，请过验证码后告诉我"。**不要叫用户同时提交**，否则 agent 会失去对后续 `rel` 验证的控制。
5. 用户反馈过了以后，agent 立刻点 submit 按钮。
6. 继续 `SKILL.md` Core Workflow 第 6 步（`rel` 实测）。

**关键反面示例**：如果第 1 步只填了一半就叫人，用户过了验证码之后 agent 发现还有必填字段漏了，表单重置 → 验证码作废 → 消耗一次人工注意力。这就是铁律 10 存在的原因。
