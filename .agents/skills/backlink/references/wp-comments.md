# WordPress Comments Reference

WordPress 评论是单位成本最低、覆盖面最广的外链类型（一条评论 30 秒），但也是踩坑最多、反垃圾最密集的战场。这份文件覆盖表单结构、标准 SOP、反垃圾系统识别入口、常见表单冲突处理。

## WP 评论表单的标准结构

任何标准 WP 评论区至少包含以下字段（字段 name 相对稳定，CSS 类名各主题不同）：

- `author` — 评论者姓名
- `email` — 评论者邮箱（多数站要求，且对外不可见）
- `url` — **外链字段**。这就是 Dofollow / Nofollow 的那个链接所在位置
- `comment` — 评论正文
- 隐藏字段（重要，不要手动动）：
  - `comment_post_ID` — 文章 ID
  - `comment_parent` — 回复哪条评论，默认 `0`
  - `_wp_unfiltered_html_comment` — 反 HTML 注入 token
  - 各反垃圾插件注入的 honeypot 字段（见下）

## 标准提交 SOP（顺序不能换）

1. 打开目标文章页，先 `browser_snapshot` 或读取 DOM，确认评论区存在且未关闭（很多老文章 `comments_open` 为 false，翻到底就能看出来）。
2. **向下滚动到评论区**，让表单进入视口。很多反垃圾插件只在表单被真正滚动到时才初始化 token。
3. 按字段顺序填（**真实键盘输入**，不要 `element.value=`）：
   - `author` → 使用品牌相关的真实姓名风格（不用 "Admin"、"Support"、品牌名全写）
   - `email` → 参考 `accounts.md` 的邮箱策略，默认用干净 Gmail。绝不用同站域名邮箱
   - `url` → **你唯一要放外链的地方**。正文里不要放 URL
   - `comment` → 纯文本，对文章内容有实质回应，至少 2-3 句
4. 勾选 GDPR / 记住信息之类的 checkbox（如果有）。
5. 触发任何 hCaptcha / Akismet challenge（正常页面滚动 + 键入行为已经触发了多数反垃圾的 "真人判定"）。
6. 提交。提交后**不要关闭页面**：等页面返回（通常是同页锚点跳转到 `#comment-NNN`，或整页刷新且评论以 "待审核" 状态出现）。
7. 执行 `rel` 实测 JS（见 `SKILL.md` Core Workflow 第 6 步）。
8. 截图留证 + 记录评论的永久链接 `#comment-NNN`（后续 72h 复查是否被删）。

## 反垃圾插件识别入口（决定能否成功）

在开始填表前，先识别站点挂了哪些反垃圾插件。识别方法是读页面 HTML：

- `wp-content/plugins/akismet` 出现在任何 script 或注释里 → **Akismet**
- `name="bee_spam"` / `antispam_bee` hidden field，或 `</form>` 之前有 `<script>` 声明 `Bee_Spam` → **Antispam Bee**
- `name="wpantispam-key"` / 页面 footer 有 `WPantispam Protect` 字样 → **WPantispam Protect**
- `name="ct_checkjs"` / `<script src=".../cleantalk-">` → **CleanTalk**
- 评论区被 `<iframe src="https://jetpack.wordpress.com/...">` 替换 → **Jetpack Highlander**（在跨域 iframe 中，无法注入）
- 评论按钮周围出现 hCaptcha widget（`<div class="h-captcha">`）→ **hCaptcha**，且 **Enterprise 版服务端会清洗评论内容**

识别完成后，直接跳到 `anti-spam.md` 对应小节，照那里的对策执行。

## 常见表单冲突与处理

### Honeypot 字段（不要填）

很多反垃圾插件用 CSS 隐藏一个"垃圾机器人会自动填"的字段，字段名经常是：

- `url2`, `website`, `hp`, `honeypot`, `zip`, `comment_author_url_2`

识别方法：读 form 的所有 input，看哪些被 `display:none` / `position:absolute;left:-9999px` 隐藏。**碰都不要碰**。

### `comment_parent` 冲突

如果文章里已有 "Reply" 链接被触发过（例如你不小心点了一下），`comment_parent` 会变成目标评论 ID，你发的内容会成为**嵌套回复**。想做顶级评论必须确认 `comment_parent=0`。

### nonce 刷新

WP 评论表单带 `_wp_unfiltered_html_comment` nonce。如果你在页面停留超过 1 小时，nonce 可能过期。对策：提交失败后刷新页面重新填（这也是为什么规则 5 说"查邮件开新标签页"——不要让主表单页失焦过久）。

### 已审核过的评论者 cookie

WP 会给已通过审核的评论者写 cookie（`comment_author_*`）。同一浏览器 Profile 在多个站混用 cookie 会出现 author 名字串台。对策：不同品牌项目使用不同 Chrome Profile（见 `accounts.md`）。

### 主题自定义字段

一些主题（GeneratePress、Astra 定制版）加了"公司名"、"网站类型"之类的非标字段。没标 required 就不填；标了 required 就填成与文章话题相关的中性值。

## 评论被删的复查流程

72 小时后应该复查链接是否仍存活：

1. 打开原文章 URL。
2. 搜索自己的 `author` 名字或 `url` 字段域名。
3. 搜不到 → 评论被删 → 在跟踪系统里把**这篇文章** URL 标为 moderated。**注意：不要整站拉黑**，同一站的其他文章评论策略可能完全不同。这一点在 `strategies.md` 的 "竞品外链反查" 段有详细论证。

## 选择哪篇文章发的 heuristics

来自竞品反查经验（详见 `strategies.md`）：

- 评论数 > 50 且有明显 SEO 评论（带 URL 字段）存活 → 站长不管这篇，可以发
- 文章发布超过 1 年且评论区有近期新评论 → 仍活跃但无审核，最佳目标
- 最近 30 天内发布的文章 → 站长多半还在盯，审核概率高，避开
- 评论区只有"admin 的官方回复"没有用户评论 → 审核严格，跳过
