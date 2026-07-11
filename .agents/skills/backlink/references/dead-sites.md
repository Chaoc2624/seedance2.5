# Dead Sites Reference

这份文件归档**"不值得再尝试"**的候选——死站、硬封站、付费墙、无 SEO 价值站、高强度反垃圾站。目的：让候选筛选阶段提前剔除，不浪费后续时间。

每个失败模式的结构：**识别特征 / 为什么归档 / 是否值得日后复查**。

## 归档分类

| 分类 | 是否 ever 复查 | 说明 |
| --- | --- | --- |
| 付费墙（pay-to-submit） | 一年一次 | 价格可能下调，免费位可能恢复 |
| 站已下线 | 半年一次 | 检查域名是否被回收、有新主 |
| Cloudflare 硬封 / 地区封锁 | 不复查 | 换代理后复查，但不在主流程内 |
| 无 SEO 价值（DR 低 + traffic 低 + nofollow） | 不复查 | 永久跳过 |
| 高强度反垃圾（CleanTalk / hCaptcha Enterprise / Jetpack） | 不复查 | 换策略也绕不过 |
| 内容语言 / 主题不匹配 | 不复查 | 相关性不足，发了也无意义 |

## 付费墙趋势（2026）

2025 年底到 2026 年初一次大规模转型：**大量老牌 SaaS / Tool 目录从免费提交转付费**。典型涨价路径：

- 原：免费提交 → 人工审核
- 现：$19-$99 提交费 → 24h 加急审核；或 $0 提交 + 6 个月排队 + 基本看不到

**应对**：

- 付费目录列入 `dead-sites.md` 归档，但标 "paywall"（不是 "dead"）。每年回访一次，看价格/政策是否变化。
- **不要花钱买外链**——Google 对付费链接有专门的检测和惩罚机制。

## 站已下线 / CF 硬封

**识别特征**：

- `curl -I URL` 返回 `522` / `523` / `530`（CF 回源失败）→ 源站挂了
- 返回 `403` 且 body 里有 `Attention Required! | Cloudflare` → CF WAF 硬封
- DNS 不解析、域名已进入 Google "Parked domains" → 域名回收
- 首页 404 + 子路径 404 → 站内容全删

**处理**：

- 源站挂：`dead:source-offline`，半年复查
- CF 硬封特定 IP：换代理后复查；全局封（不论 IP）：归档 `dead:cf-global`
- 域名回收：永久剔除。同域名下新主需重新评估为"新候选"

## 无 SEO 价值站归档

被这些指标组合命中的站，无论是否 Dofollow 都不做：

- `traffic < 100` 且 `is_spam=1`
- `traffic < 100` 且 `DR < 20` 且 `site_age < 1y`
- 全站外链都是 nofollow 且 DR < 50（见 `dofollow-2026.md`，Nofollow 仅高 DR 站值得作为品牌信号）
- 整个 domain 被 Google 手动惩罚（搜 `site:domain.com` 返回 0 结果，但站本身在线）

## 高强度反垃圾站

这些站**不是不能访问，而是绕不过反垃圾**。详见 `anti-spam.md`。

- CleanTalk 保护的站 — 403 硬拦，归档 `antispam:cleantalk`
- hCaptcha Enterprise 且发现评论内容被清洗 — 归档 `antispam:hcaptcha-enterprise`
- Jetpack Highlander iframe 评论 — 归档 `antispam:jetpack`

**不要做 sacrificial submission 以外的重试**——每次重试都会加重 IP/邮箱的信誉惩罚，影响同一批后续候选。

## 常见失败模式归档模板

新发现失败模式时，按此格式追加：

```
### [站名或模式名]
- **识别**：[如何从候选阶段识别]
- **失败表现**：[提交/注册/操作时的具体现象]
- **归类**：paywall / dead-source-offline / dead-cf / dead-domain-parked / antispam-cleantalk / antispam-hcaptcha-enterprise / antispam-jetpack / no-seo-value / content-mismatch
- **是否复查**：[年/半年/不复查]
- **首次发现日期**：YYYY-MM-DD
```

## 地区封锁归档

一些站对特定地区 IP 不开放：

- 部分欧盟站对非欧盟 IP 返回 451 / 强制要求 GDPR 同意 modal 无法关闭
- 部分美国法律相关站（.gov / .edu 的某些子路径）对非美国 IP 限制
- 俄罗斯 / 中国站点的访问限制

**处理**：换 ISP 代理到对应地区后复查。如果该地区不是品牌目标受众，直接归档 `dead:geo-blocked:region`，不花成本换代理。

## 内容语言 / 主题不匹配

**反面案例**：在园艺博客上发 SaaS 链接。即使 Dofollow 通过，Google 会识别相关性低，外链权重接近 0，且可能触发"unnatural link pattern"警告（批量发同类不相关外链）。

**归档条件**：

- 目标站核心主题与品牌主题完全无关（园艺 vs SaaS / 美食 vs 工具）
- 目标站核心受众语言与品牌受众语言不同（且品牌无本地化计划）

## 手动黑名单

偶尔会遇到明显黑帽 / 灰帽站点（链接农场 / PBN 网络中的一员 / 已被 Google 惩罚但还活着）。一旦识别出一个，**在候选筛选层的黑名单里加整个 IP 段或 CF 账户下的所有域名**，防止同一批操作被关联污染。

识别线索：

- 多个看起来无关的站点使用完全相同的 WordPress 主题、完全相同的 404 页面文案
- WHOIS 注册信息相同（或都用同一个隐私保护服务）
- 站点间有大量循环内链（A 链 B，B 链 C，C 链 A）
- `site:domain.com` 返回的页面标题都是高度模板化的"[Keyword] - [City]"组合
