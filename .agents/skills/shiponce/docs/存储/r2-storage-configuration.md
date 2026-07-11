---
title: '项目中关于R2存储相关配置'
category: '配置'
---

# 项目中关于R2存储相关配置

# 写在前面

使用R2之前，你最好有个VISA卡：例如 `招商全币种信用卡`（后来了解到`去闲鱼搜索”代绑“”虚拟卡“也可以成功通过`），因为用存储虽然有免费额度，但是Cloudflare担心你可能用超，所以需要录入下支付方式才能使用R2；

![](https://img-doc.16781678.xyz/uploads/2026-04-05/1775352532757-ql987g.jpg)

# 项目使用Cloudflare R2支撑图片生成的存储

## Cloudflare R2 亮点：免费量大

![](https://img-doc.16781678.xyz/uploads/2026-04-05/1775352508222-5we13d.jpg)

项目

每月免费额度

**标准存储容量**

**10 GB-month**（等于每月最高可存 10 GB）

**Class A 操作（如写入/列出对象）**

**1,000,000 次/月**

**Class B 操作（如读取对象）**

**10,000,000 次/月**

**出站流量（Egress）**

**始终免费**（无论使用多少）

## 项目中需要先使用Admin权限账户去/admin/settings/storage更新R2配置，要不然会像下面报错

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901230641-8lhkcp.jpg)

## 访问下面链接

[https://www.cloudflare.com/zh-cn/](https://www.cloudflare.com/zh-cn/)

### 登录后，按照下图点击创建bucket

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901325968-y4dkak.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901338507-i4l2ba.jpg)

> 在本地记录下你创建的bucket name

### 配置Custom domain

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901374665-5oo6ek.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901383051-im99d5.jpg)

注意：如果你没有域名，需要先买域名：[购买便宜域名](#/shipany-two/others/buy-cheap-domain)

> 在本地记录下你创建的 domain

### 配置R2_ACCESS_KEY_ID、R2_SECRET_ACCESS_KEY

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901416637-mnwjup.jpg)

选择Create User API token

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901452434-sa0cb3.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901468939-46g33i.jpg)

点击”Create User API Token“

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901480086-x7zor1.jpg)

然后访问`http://localhost:3000/admin/settings/storage`将其配置进去

> 下图中  
> Cloudflare Access Key：对应上面的`Access Key ID`  
> Cloudflare Secret Key： 对应上面的`Secret Access Key`  
> Bucket Name： 对应上面新建的`bucket name`  
> Endpoint： 对应上面的 `Use jurisdiction-specific endpoints for S3 clients:`下的`Default`  
> Domain: 对应上面你设置的`Custom domain`

![](https://img-doc.16781678.xyz/uploads/2026-03-05/1772700165840-dejhpn.jpg)

保存后，此时重启服务 `pnpm run dev`，可以在[http://localhost:3000/admin/settings/general](http://localhost:3000/admin/settings/general) 测试图片文件上传，提示上传成功后可以即时的看到图片，当然也可以去CloudflareR2上去看下这张图是否已经上传到

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765901510391-csy3mq.jpg)
