# Strategies Reference

超越"单条外链提交"的**上层策略**：

- 包管理器 Parasite SEO
- 卫星站部署
- Dev.to 链接枢纽
- 索引加速
- 竞品外链反查

每个策略给操作原则，不给具体脚本（脚本是项目层的事，详见 `SKILL.md` "Out of Scope"）。

## 包管理器 Parasite SEO

**原理**：主流开源包管理器（npm、PyPI、crates.io、RubyGems、Packagist 等）的每个包页都是高 DR 页面。在包的 README / description / homepage 字段放你的站点链接，就等于在 DR80+ 的页面获得一条外链。这叫 Parasite SEO（寄生 SEO）——借用他人高 DR 页面的权重。

**21 个包管理器清单**（非穷尽）：

- JS 生态：npmjs.com、yarnpkg.com、jsr.io、deno.land/x
- Python：pypi.org、anaconda.org
- Rust：crates.io、docs.rs
- Go：pkg.go.dev
- Ruby：rubygems.org
- PHP：packagist.org
- Java：mvnrepository.com、search.maven.org
- .NET：nuget.org
- Swift：swiftpackageindex.com
- Dart / Flutter：pub.dev
- Haskell：hackage.haskell.org
- Elixir：hex.pm
- Lua：luarocks.org
- Perl：metacpan.org
- R：cran.r-project.org
- OS 包：archlinux.org/packages、aur.archlinux.org

**操作原则**：

- **必须是真实可用的包**。发个空壳 "hello-world" 包然后塞外链，会被社区和平台双重清理。
- **一个品牌一个相关包即可**，不要同一个品牌发 20 个包（被识别为 spam 行为）。
- **链接放 homepage 字段 + README 内**，不要堆砌在 description。
- **包的 README 质量是长期关键**——决定包是否被搜索（"npm: xxx-sdk"）收录到靠前位置。
- **Dofollow 状态**：npmjs / PyPI / crates.io 的 homepage 字段长期 Dofollow（2026 实测）；README 内的链接依平台而定（npmjs 通过 @npm 渲染时部分 rel=nofollow，包页 homepage 字段是 Dofollow）。

## 卫星站部署

**原理**：在你控制的外部 DR > 主站的平台上，发布"内容卫星"（完整的文章/页面），从卫星指向主站。单个卫星不值钱，几十个卫星形成信号密度就有效。

**卫星站的候选**：

- dev.to 文章（详见下段）
- Medium 文章
- Substack newsletter（公开文章）
- Hashnode 博客
- telegra.ph 页面
- GitHub Pages 静态站（用 GitHub 组织账号 + 自定义 README）
- Notion 公开页（可建索引）

**操作原则**：

- **每个卫星必须是独立原创内容**——不要复制主站文章（Google 会判为 duplicate，主站 canonical 受损）
- **卫星之间可以互链**，形成小型内容图谱
- **卫星到主站的锚文本要多样化**——品牌名 40% / 裸 URL 20% / 相关关键词 40%，避免全锚点一致触发"unnatural pattern"
- **控制卫星增长速度**——每周 1-2 个新卫星比一周 20 个更自然

## Dev.to 链接枢纽模式

**为什么是 dev.to**：Dofollow（2026 实测），发文审核宽松，DR90+，开发者受众与 SaaS / 工具类品牌匹配度高。

**Hub 模式操作**：

1. 在 dev.to 发一篇"综合指南 / 对比分析 / 清单"类的长文（如："2026 年的 10 个 XXX 工具对比"）
2. 文章内自然引用其它卫星站内容（link to your Hashnode / telegra.ph / 主站博客）
3. 在文章底部"further reading"段再放一批主站链接
4. 这篇 dev.to 文章在 Google 对"XXX 工具对比"类查询有机会排名靠前——流量 + 外链双收

**不要做**：

- 不要把 dev.to 文章写成"卖广告"。社区会 report，文章会 unpublished，账号会降权。
- 不要在同一账号一周连发 5 篇都指向同一品牌——频率触发 shadow-ban。

## 索引加速（Ping 搜索引擎）

**原理**：新页面默认要等搜索引擎自然爬取——可能需要几天到几周。主动 ping 能把这个时间压到几小时甚至几分钟。

**可用的 Ping 端点**：

- Google Indexing API（需 OAuth + 对应 property 的 verified owner 身份）
- Bing Webmaster Submit URL API（需 API key）
- IndexNow（Bing/Yandex 联合标准，单个 endpoint 推送多个 URL）

**操作原则**：

- **只 ping 自己控制的主站和卫星站**。给别人的页面 ping 无意义（ping 只是通知"这里有更新"，对方站长的 robots.txt 和 sitemap 才是爬取决定因素）
- **Ping 密度**：每个新外链对应的卫星/主站页面 ping 一次即可，不要重复推送同一 URL
- **Ping 是上限控制**——不会让质量差的页面排名变好，只是让好页面更快被发现

## 竞品外链反查（对应源文 3.4 节）

核心发现：**同一个站的不同文章，评论审核策略不同**。不能看到"Ahrefs 报告说竞品在 example.com 有外链"就随便挑一篇文章发。

### 错误做法

- 从 Ahrefs / Semrush 拿到 `example.com` 有竞品外链
- 去 `example.com` 首页或最新博客发评论 → 被审核 / 被删
- 在跟踪系统里把 `example.com` 标为 "moderated"，整站放弃

### 正确做法

1. 从 Ahrefs / Semrush 拿到**竞品外链的精确 URL**（具体到哪篇文章，不是 domain）
2. 打开那篇文章，检查**竞品评论是否仍然存活**
3. 存活 → 在同一篇文章下发评论。这篇文章已被证明无人工审核，与你竞品发的时间间隔过了审核期也没被删——最安全的目标。
4. 不存活（评论被删或消失）→ 站长开始清理，整站跳过

### 选文章的 heuristics

这些 heuristic 指向"这篇文章的评论区站长不盯"：

- 评论数 > 50 且有明显 SEO 评论（带 URL 字段的评论）仍存活
- 老文章（发布超过 1 年）评论区仍有近 30 天新评论
- 评论区有明显 spam 残留但未清理

反面信号（这篇评论会被盯 / 被删）：

- 最近 30 天内发布的文章（站长在盯新发布）
- 评论区只有"admin 的官方回复"没有用户评论
- 文章下方有明显 "All comments are moderated" 提示

### 反查操作清单

1. 导出竞品的外链清单（精确 URL + 锚文本 + 首次发现日期）
2. 按"存活竞品评论数 > 0"过滤，只保留有证据的目标
3. 按文章的评论相关性排序（你要发的品牌类型 vs 文章话题匹配度）
4. 按 `wp-comments.md` SOP 发评论
5. 72h 后复查存活；被删的文章加入"moderated articles"黑名单（文章级，非域名级）
