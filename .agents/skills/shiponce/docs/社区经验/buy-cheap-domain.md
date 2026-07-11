---
title: '如何购买便宜的域名'
category: '其他'
---

# 如何购买便宜的域名

# 写在前面

如果你有更便宜的渠道和方法或者已经有域名了，可以略过此篇wiki

## 域名比价网

> 可以找到对应域名各个平台下的价格，我个人还是建议使用`Spaceship`

[zh-hans.tld-list.com](https://zh-hans.tld-list.com/)

![](https://img-doc.16781678.xyz/uploads/2025-12-24/1766588176473-h17l8x.jpg)

## Spaceship

[https://www.spaceship.com/](https://www.spaceship.com/)

### 优点：可以用支付宝支付，我个人感觉性价比比价可以

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902243643-nl6c1u.jpg)

### xyz的域名我感觉最便宜，下面用xyz做例子（[出海域名还是建议选用.ai](http://xn--79q73c25e6sjtujq3k6qn617bb3hdoa.ai)、.com等域名，自行决定）

#### 示例截图1、这个域名 带了高级标签，不能用优惠码；

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902256738-dnqdue.jpg)

#### 示例截图2、这个域名 没有高级标签，可以用优惠码；

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902267351-6d2wof.jpg)

加入购物车后，关掉VPN（魔法），要不然会在“添加促销代码”提交时提示检测到VPN或代理；

下图为《带了高级标签的域名》添加后选择订阅10年的价格（还是比较划算的）

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902280672-xkpyco.jpg)

下图为《没有高级标签的域名》添加后的价格（缺点：就第一年便宜）

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902291986-n8jsq3.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902304249-nx8kl4.jpg)

### 优先使用优惠码，挑选便宜后缀，可下单。

以下优惠码来自公开可查询渠道，效果随当期活动波动。

优惠码

适用内容

大致优惠/说明

**COM67**

.com 域名

~41% 折扣 (约 $5.67/年)

**NET19**

.net 域名

折扣 (~9% 或按最新优惠价)

**DOM80**

.us 域名

~70% 折扣 (~$1.95/年)

**XYZ52**

.xyz 域名

~94% 折扣 (~$0.78/年)

**IO85**

.io 域名

~68% 折扣 (~$14.98/年)

**SPSR86**

.top / 其他域名

~79% 折扣 (~$0.82/年)

注意：大部分优惠码一个账号只能使用一次。

## 2\. 域名后缀价格区间

按价格分三档：

超低价（约 $1）

- .xyz
- .online
- .site
- .shop

一般低价（约 $3–8）

- .co
- .info
- .top

偏贵（$10–15）

- .io
- .ai

如果是长期项目，建议选择 .COM。

## 3\. 60 天可转移策略

绝大多数便宜的首年注册商续费价格较高。注册后 60 天可自由转移到 Cloudflare 获得最低续费价。

策略：  
Spaceship（最低首年价） → 60 天后转至 Cloudflare（最低续费价）

## 4\. 大促期间价格更低

黑五（11 月）最容易出现全场最低价，例如：

- .COM 常见 $3-$5
- .xyz 常见 $0.5-$1
- .co 常见 $1-$3
- .io 也有折扣

# 以Spaceship为例，如何将域名和Cloudflare建立DNS

## Cloudflare设置

访问：[https://dash.cloudflare.com/](https://dash.cloudflare.com/)

![](https://img-doc.16781678.xyz/uploads/2026-04-05/1775352350451-01ihh2.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-05/1775352356640-yhhi13.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773573475770-4uq04g.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773572641513-0ysahs.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773572861435-9hsjet.jpg)

```
// 例如：
meilani.ns.cloudflare.com
ruben.ns.cloudflare.com

```

## Spaceship面板

[https://www.spaceship.com/application/domain-list-application/](https://www.spaceship.com/application/domain-list-application/)

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773572552527-yz6gx9.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773572592693-ws0o15.jpg)

将上面Cloudflare的内容按照下图复制粘贴过去 点击保存

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773572916929-x7kxzt.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773574388762-tnh866.jpg)

## 回到Cloudflare

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773574406750-f5d14z.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773574380499-v0tmtu.jpg)

一般等几个小时 就解析过来了，幸运的话几分钟，下图就是解析成功后Cloudflare主面板

![](https://img-doc.16781678.xyz/uploads/2026-03-15/1773574455817-ajx4x8.jpg)
