# Platforms Reference

按外链类型分类的活跃平台操作速查。每个平台记录：注册方式 / 关键表单字段 / 验证码类型 / 已知坑点。每次接到新平台，先在这里 grep 一遍；完工后如有新发现，**追加到对应段**。

类型清单：Profile 类 / 文章类 / 论坛类 / 目录站类 / Guest Post 类 / WP 评论类 / 短链类 / 日本 CGI 类。

## Profile 类

这一类做的是"注册账号 → 编辑个人 Profile → 填 Website 字段"。单条时间 3-8 分钟，主要成本在注册和 Profile 完善。

- **phpBB 论坛（通用模式）** — 全球最常见的开源论坛。Website 字段 100% Dofollow（见 `dofollow-2026.md`）。多数站要求先发 3-5 个帖子才能编辑 Profile。
- **Discuz 站点** — Profile 编辑页要走 `op=info` 路径，不是 `op=base`。
- **Boardhost 免费论坛** — 无需注册，Link URL 在发帖表单里。
- **MyBB / vBulletin / XenForo** — Profile Website 字段多数 nofollow，仅作多样化外链。
- **BuddyPress（WP 社群插件）** — Profile 有 Website 字段，Dofollow 依主题而定。
- **各类 SaaS 社区站** — Discord.com 的 Profile、Product Hunt Maker profile、Dribbble、Behance — 均 nofollow，仅品牌信号。

## 文章类

注册账号后发文章，文章里嵌锚文本外链。

### 开发者博客

- **velog.io** — Markdown 文章，文章内链接 Dofollow。OTP 注册坑见 `reverse-eng.md`。
- **dev.to** — GitHub OAuth 注册最稳，文章内链接 Dofollow。新号头几篇会 shadow-ban，仍可爬。
- **Hashnode** — Dofollow 降级中，2026 年部分文章的外链已改为 nofollow，逐篇实测。
- **Medium** — 文章内链接 Nofollow（DR94 品牌信号价值）。
- **Substack** — 文章内链接 Nofollow（品牌信号）。

### Paste / Note（多数 2026 已降级）

- **telegra.ph** — 无需注册，API 创建，Dofollow。详见 `dofollow-2026.md`。
- **rentry.co** — 无需注册，curl API。Dofollow。
- **hackmd.io** — 已降级，nofollow。仅品牌信号。
- **justpaste.it** — 已降级。
- **paragraph.com** — 已降级。
- **pastebin.com** — 一直都是 nofollow，不在 Dofollow 目标内。

### 问答 / 知识站

- **Quora** — 答案里的链接 nofollow。品牌信号 + 流量双重价值，流量价值 > SEO 价值。
- **Reddit** — 多数 subreddit 对新账号限链接，老账号或相关性高的帖子可发。nofollow（2026 确认）。
- **Stack Exchange 系列** — 答案链接 nofollow，品牌信号。

## 论坛类

除 Profile 外，在帖子内容里嵌入链接。

- **各类 phpBB / Discuz 主题讨论区** — 帖子正文内的链接**普遍 Dofollow**。但发帖门槛高：需要站长批准 + 注册后等待期 + 发帖相关性审核。不作为批量目标，针对高价值相关站单点操作。
- **Boardhost** — 发帖即得 Dofollow 链接，无需相关性审核。最快的论坛类外链。
- **专业领域论坛**（Webmaster World、BlackHatWorld、SitePoint 等）— 发帖限制严格，但外链质量高。非批量场景考虑。

## 目录站类（SaaS Directory）

2026 最高性价比的 Dofollow 来源。识别特征与风险见 `dofollow-2026.md` 第二类。

**通用提交模板**（准备一次复用）：

- 产品 URL
- 产品标题（≤ 60 字符，包含 1 个核心关键词）
- Tagline / 一句话描述（≤ 160 字符）
- 详细描述（300-500 字）
- 分类（按目录站 tag 系统选 1-2 个）
- Logo（1:1 方图，PNG 透明底或纯白底，512×512 够用）
- 主截图（1200×630 或 1600×900）
- 视频 URL（选填，YouTube Unlisted 视频最灵活）
- Submitter 邮箱（见下）

**邮箱策略**：要求归属验证的目录（`support@品牌.com` 验证）→ 用品牌邮箱；纯提交不验证的目录 → 干净 Gmail 即可。

**常见目录站例子**（逐站实测 Dofollow 仍有效）：

- Product Hunt — Dofollow（launch 页），但仅 launch 当天流量。
- AlternativeTo — Dofollow，需维护者审核。
- G2 / Capterra — 付费主导，免费位少。
- SaaSHub / BetaList / Launching Next — 仍开放免费位（2026 Q1 实测）。
- Indie Hackers Products — Dofollow，社区导向。
- Tools 聚合站：toolify / futurepedia / theresanaiforthat（AI 类）— Dofollow，提交门槛低。

## Guest Post 类

写一篇完整的文章投稿到其它博客。单条成本最高（800-2000 字），回报也最高。

- **识别目标**：博客有 "Write for us" / "Contribute" / "Guest Post" 页面。
- **步骤**：读对方投稿指南 → 发 pitch（主题 + 大纲）→ 获批后写全文 → 内嵌 1-2 条外链 → 作者简介再加 1 条。
- **锚文本**：作者简介里的"品牌链接"基本 Dofollow；正文里的链接看编辑标准。
- **风险**：部分博客收"审稿费"或"发布费"—— 这属于付费链接，Google 明确反对，**不要做**。合规的 Guest Post 是：用高质量内容换一个自然链接，不涉及金钱。
- **已知友好目标**：小众垂直博客（100-500 订阅级别）最愿意接 guest post。大站（TechCrunch 级）接纳率接近 0，不值得投入时间。

## WP 评论类

详见独立文件 `wp-comments.md`。这里只列类别特征：

- 单条时间最短（30 秒），成功率取决于反垃圾插件
- Dofollow 率 20-40%（2026 实测，大量站已给评论 url 字段加 nofollow）
- 审核延迟是常态，72h 后复查存活

## 短链类

- **各种短链服务的 redirect 链接** — 几乎全部 nofollow + redirect，不传递权重。**不作为 SEO 目标**。
- 例外：少数短链服务（如部分 `.gl` 系列）给自定义 slug 页一个公开索引页，该索引页上链接可 Dofollow—— 但 DR 低，基本无价值。

**结论**：短链类不列为正式外链。本 skill 不为该类型分配时间预算。

## 日本 CGI 类

日本互联网保留了大量 90 年代末 / 00 年代初的 CGI 驱动的留言板、日记系统、Profile 服务。

- **特征**：URL 带 `.cgi`；UI 是 HTML 3.x / 4.0 风格；无 JS 或极少 JS；表单字段命名多为日文拼音（`namae`, `mail`, `url`, `honbun`）。
- **Dofollow 率**：**高**（古老系统，无现代反垃圾逻辑）。
- **障碍**：
  - 语言：表单字段和提交按钮全日文，需 OCR / 翻译识别 `url` / `送信` / `投稿`
  - 编码：多数是 Shift-JIS / EUC-JP，Playwright 正常处理，但 `browser_type` 输入的非 ASCII 字符偶有编码异常 —— 遇到问题用 `browser_evaluate` 配合 `document.querySelector(...).value` 直接赋值（这里不怕反垃圾，系统太老）
  - 验证码：部分站有简单图像验证码（4-6 位英数字），可 OCR 或人工
- **流量价值低**（日本本地小众），但**DR 经常不低**（老域名长期存活）。作为多样化外链源有用。

## 扩展规则

**发现新平台时**：

1. 做 sacrificial submission（用非主品牌测），确认提交流程 + 反垃圾 + rel。
2. 在本文件对应类型段落下追加一条，保持字段一致：**入口 URL / 注册方式 / 关键字段 / 验证码类型 / 已知坑 / Dofollow 状态（带测试日期）**。
3. 如果是完全新类型，在文件顶部的类型清单里加一行。
