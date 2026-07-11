---
title: '项目部署到Vercel'
category: '部署'
---

# 项目部署到Vercel

### 将项目代码提交到你自己的github私有仓库后，在 [Vercel](https://vercel.com/new) 创建一个新项目，连接上你的 Github 账户。选择上一步创建的代码仓库，导入代码开始部署

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765899106045-biaom2.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765899118356-leqgyh.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765899151861-28cev8.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765899174005-h1h6n3.jpg)

### 绑定自定义域名

![](https://img-doc.16781678.xyz/uploads/2026-04-13/1776087891298-zxoi2b.jpg)

下图输入自己的自定义domain  
![](https://img-doc.16781678.xyz/uploads/2026-04-13/1776087929358-i22s1s.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-13/1776087985441-vxjmd1.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-13/1776088432245-30plpp.jpg)

跳回来刷新片刻

![](https://img-doc.16781678.xyz/uploads/2026-04-13/1776088465501-cl6trr.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-13/1776088648993-bxrxcm.jpg)

> 2026-04-13 补充另一种情况，自动不好使，需要手动配置  
> ![](https://img-doc.16781678.xyz/uploads/2026-04-12/1776037833773-2tjna1.jpg)  
> 这个页面不要关闭，再打开一个Cloudflare页面（访问[https://dash.cloudflare.com/，进入你的域名domain）](https://dash.cloudflare.com/%EF%BC%8C%E8%BF%9B%E5%85%A5%E4%BD%A0%E7%9A%84%E5%9F%9F%E5%90%8Ddomain%EF%BC%89)  
> ![](https://img-doc.16781678.xyz/uploads/2026-04-12/1776037895257-vbqvn2.jpg)  
> 然后对应Vercel给的进行添加后保存  
> ![](https://img-doc.16781678.xyz/uploads/2026-04-12/1776037995461-rizym0.jpg)

等 DNS 解析生效（一般半小时内生效，最多可能需要 48 小时），Vercel 会为你添加的自定义域名生成 SSL 证书。  
访问你的自定义域名，就可以看到线上版本的网站了。
