---
title: '项目快速上手图文教程'
category: '快速开始'
---

# 项目快速上手图文教程

# 写在前面

> 下面是我按照官方文档一步步走过程的记录（如果有哪个环节有点不一样，可能是当时写教程的时候Shipany版本导致的目录或者文件不一致，实际开发请以[✨ShipanyTwo官方文档](https://shipany.ai/zh/docs)为准）

> 教程中截图部分是使用了ShipanyNanoBanana模板文档截图，但是不影响你使用，还请理解。

# 前置要求

[为确保你能顺利使用 ShipAny 开发项目，请确保完成前置要求,点击我确认是否以满足要求](https://shipany.ai/zh/docs/guide/prerequisites)

# ShipanyOne 用户

请移步 [✨ShipanyOne官方文档](https://docs.shipany.ai/zh)

# ShipanyTwo用户

## 初始化项目

### 方式1：通过仓库提供的`Use this template`Clone到你自己的仓库（推荐）

![](https://img-doc.16781678.xyz/uploads/2026-04-05/1775380152399-5e0pzp.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-05/1775380237597-sggkmy.jpg)

成功后，自动进入新仓库

![](https://img-doc.16781678.xyz/uploads/2026-04-05/1775380678293-d83nb6.jpg)

执行clone到你本地, 例如：

```
// 不可复制执行，仅为Clone示例
git clone git@github.com:xxx/xxx.git

```

### 方式2：通过仓库源码创建项目

下面命令中的`my-shipany-project`是你新项目名字，注意改下

#### 基于dev/main分支clone

默认拉取的是 dev 分支的代码（开发分支，更新迭代快，包含最新的功能特性。），基于 [Next.js 16](https://nextjs.org/blog/next-16)，可部署在 Vercel，或通过 VPS + Dokploy 部署。

```
git clone git@github.com:template-code-team/shipany-template my-shipany-project

```

> 注意：如果你追求版本稳定性，可以选择拉取 main 分支的代码（就是下面命令）

```
git clone -b main git@github.com:template-code-team/shipany-template my-shipany-project

```

#### 基于cf分支clone

> 此分支基于 [Next.js 15.5.5](https://nextjs.org/docs/15/app/getting-started/project-structure)，暂不支持 Next.js 16。

```
git clone -b cf git@github.com:template-code-team/shipany-template my-shipany-project

```

clone完毕后进入项目

```
cd my-shipany-project

```

### 安装依赖

```
pnpm install

```

### 启动开发服务器

```
pnpm dev

```

点击输出的 Local 地址，在浏览器打开网页：[http://localhost:3000](http://localhost:3000) ，即可预览项目

> 你要将新项目提交到自己github需要做下面动作，上面的Clone会把源代码的.git远程仓库也Clone下来了，需要按照下面执行下命令，要不然你提不上去

```
rm -rf .git

```

```
git init

```

```
git add -A

```

```
git commit -m "feat: first commit"

```

> 下面的xxx/xxxxx 指 gitub username/you project name，例如：git remote add origin [https://github.com/boomer1678/nano-banana-pro.git](https://github.com/boomer1678/nano-banana-pro.git)

```
git remote add origin git@github.com:xxx/xxxxx.git

```

```
git branch -M main

```

```
git push -u origin main

```

## 修改网站配色

### 选择 shadcn 主题调试器

打开 [https://tweakcn.com/editor/theme](https://tweakcn.com/editor/theme) 可以修改字体颜色等等。

为你的项目挑一款主题配色：

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765632917509-image.png)

> Shipany 使用 tailwindcss4，请使用 oklch 颜色格式，复制主题样式

粘贴主题样式到项目文件：`src/config/style/theme.css`

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765632934311-image.png)

重新进入项目预览页面，即可看到你定制的主题

## 配置环境变量

```
cp .env.example .env.development

```

### 修改环境变量值

> ！！！！注意！！！！！：1.8.2版本后作者将 `.env.example`修改了下，按照这个教程走的话，就需要将下面的配置复制粘贴覆盖下 `.env.development`;  
> 同时也需要将`shipany-template/src/config/db/schema.ts`下改成`export * from './schema.postgres';`

> 注意：登录、AI等配置不在这里，那些在管理后台页面，后面会有介绍

```
# app
NEXT_PUBLIC_APP_URL = "http://localhost:3000"
NEXT_PUBLIC_APP_NAME = "Your App Name"

# theme
NEXT_PUBLIC_THEME = "default"

# appearance
NEXT_PUBLIC_APPEARANCE = "system"

# database
DATABASE_URL = ""
DATABASE_PROVIDER = "postgresql"
DB_SINGLETON_ENABLED = "true"
DB_MAX_CONNECTIONS = "1"

# auth secret
# openssl rand -base64 32
AUTH_SECRET = ""

```

### 下图为使用Supabase获取DATABASE_URL值截图

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633008390-image.png)

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633016529-image.png)

> 注意：复制粘贴内容中\[YOUR-PASSWORD\] 是你要替换的内容，把\[\]要删除了，要不然连不上

> DATABASE_URL 示例

```
DATABASE_URL="postgresql://postgres.tsjbzbpzwilbxnrqkqzp:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

```

### 下图为使用Neon获取DATABASE_URL值截图

[项目如何配置使用neon数据库](#/shipany-two/configuration/how-use-db-neon)

![](https://img-doc.16781678.xyz/uploads/2026-01-01/1767265111674-2484k3.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-01-01/1767265182627-q306wr.jpg)

> 粘贴到上面的.env.development中

> DATABASE_URL 示例（部分值做了xxx处理）

```
DATABASE_URL="postgresql://neondb_owner:xxx@ep-soft-credit-xxxx-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require ”

```

## 数据库

### 按照上面环境变量配置好后，迁移数据表

#### 项目下终端运行下面命令：

##### 第一步：

```
pnpm db:generate

```

##### 第二步：

```
pnpm db:migrate

```

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633034200-image.png)

## 配置登录鉴权

### 管理后台RBAC初始化

```
pnpm rbac:init

```

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633064241-image.png)

### 注册管理员账户

访问 `http://localhost:3000/admin` 进入后台管理系统，由于没有登录会遇到登录拦截，重定向到 /sign-in 登录页面。

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633073039-image.png)

你需要先注册一个账户，比如 `admin@xxx.com`。

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633085376-image.png)

### 分配超级管理员权限

注册成功后，在终端执行

> 注意：admin@xxx.com 更换成你注册的账户邮箱

```
pnpm rbac:assign -- --email=admin@xxx.com --role=super_admin

```

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633094027-image.png)

### 访问管理后台

再次访问 `http://localhost:3000/admin`，即可进入管理后台。

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633101764-image.png)

### 配置google登录

访问[https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633125057-image.png)

#### 注意：如果没有Project的，先创建个Project！

##### 下图为创建Project截图，要选择外部！

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633136470-image.png)

#### 创建客户端

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-17/1765979138059-txjnzj.jpg)

#### 配置用到的（注意：生产环境的话，还得单独重新再配一个）：

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-17/1765979255102-yalhxi.jpg)

1、[http://localhost:3000](http://localhost:3000)

2、[http://localhost:3000/api/auth/callback/google](http://localhost:3000/api/auth/callback/google)

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633144336-image.png)

下图为生产配置时截图（仅供参考）：

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633152482-image.png)

#### 然后访问：[http://localhost:3000/zh/admin/settings/auth](http://localhost:3000/zh/admin/settings/auth)

##### 将google给你的复制粘贴到下图：

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633175201-image.png)

#### 然后回到项目首页：[http://localhost:3000](http://localhost:3000)

##### 下图为第1种登录方式：OneTap生效

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633186890-image.png)

##### 下图为第2中登录方式：Auth生效

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633205480-image.png)

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633214057-image.png)

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633221747-image.png)

##### google成功后跳回首页：

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633230136-image.png)

##### 最后如果配完生产后是下面这样（2个）

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633240497-image.png)

### github登录太简单了，就不写过程了，

我把文档放这里了,需要的自己点击去看下：[github登录](https://shipany.ai/zh/docs/auth/github)

![](https://cdn.jsdelivr.net/gh/ai-boomer/PicCDN/2025-12-13/1765633252325-image.png)

## 配置AI功能

![](https://img-doc.16781678.xyz/uploads/2025-12-25/1766704730097-b5btaf.jpg)

## 先确定你的登录账户是admin角色

访问[http://localhost:3000/zh/admin/settings/ai](http://localhost:3000/zh/admin/settings/ai)

### 进行AI配置:

![](https://img-doc.16781678.xyz/uploads/2025-12-25/1766704750544-ra2n01.jpg)

下面以[https://replicate.com/](https://replicate.com/)为例，进行记录

### 在成功登录后：

![](https://img-doc.16781678.xyz/uploads/2025-12-25/1766704765148-d8vmoh.jpg)

### 选择模型：

![](https://img-doc.16781678.xyz/uploads/2025-12-25/1766704789396-3yl6f8.jpg)

### 将key复制（先不考虑费用问题，这里只写教程）：

![](https://img-doc.16781678.xyz/uploads/2025-12-25/1766704799898-eg3hp1.jpg)

### 将key粘贴到admin：

![](https://img-doc.16781678.xyz/uploads/2025-12-25/1766704811543-uim99u.jpg)

### 保存后去前台页面[http://localhost:3000/zh/ai-image-generator](http://localhost:3000/zh/ai-image-generator)测试：

![](https://img-doc.16781678.xyz/uploads/2025-12-25/1766704832039-8qk3fg.jpg)

### AI生图平台+费用比对

平台

模型版本

定价详情

备注

官网链接

**[Kie.ai](http://Kie.ai)（Kie）**

Nano Banana Pro

约 $0.09（1K/2K）– $0.12（4K）  
（18 credits ≈ $0.09；24 credits ≈ $0.12）

使用 credits 计费，有不同兑换率和批量折扣

[kie.ai](https://kie.ai/nano-banana-pro?utm_source=chatgpt.com)

**Replicate**

Nano Banana / Nano Banana Pro

标准分辨率：≈ $0.14–$0.15 / 张  
4K：常在 $0.24 左右 / 张

按运行时间或硬件计费，部分模型按输入/输出计费

[replicate.com](http://replicate.com)

**[Fal.ai](http://Fal.ai)（Fal）**

Nano Banana（非 Pro）

约 $0.039 / 张（1MP 标准化）

平台托管不同版本，需区分普通版与 Pro 版

\-

**[Fal.ai](http://Fal.ai)（Fal）**

Nano Banana Pro / Gemini 3 Pro

约 $0.15 / 张（标准）  
4K 为双倍费率

\-

\-

**Google / Gemini 官方**

Nano Banana Pro

标准：~$0.13–$0.14 / 张  
4K：~ $0.24 / 张

有免费配额、学生或促销渠道，价格会有变动

\-

## 字体图标使用

项目中使用了[lucide-react](https://lucide.dev/icons/)、react-icons 中的 [Remix Icon](https://react-icons.github.io/react-icons/icons/ri/)。如果有需要图标，可在这里查找

## 页面构建器

[静态页面构建](https://shipany.ai/zh/docs/page-builder/static-page)

[动态页面构建](https://shipany.ai/zh/docs/page-builder/dynamic-page)

# Stripe支付

点击查看：  
[✨项目中关于Stripe支付相关配置](#/shipany-two/payment/stripe-configuration)

# Creem支付

[项目中关于Creem支付相关配置](#/shipany-two/payment/use-pay-by-creem)

# 部署

## 部署到 Vercel

点击查看：  
[项目部署到Vercel](#/shipany-two/deployment/deploy-to-vercel)

## 部署到Cloudflare

点击查看：  
[项目部署到 Cloudflare Workers](#/shipany-two/deployment/deploy-to-cloudflare-mac)

## 部署到Dokploy

这个部署我没有做，大家可以看[部署到Dokploy-官方文档](https://shipany.ai/zh/docs/deploy/dokploy)

# Vercel和Cloudflare的区别：

对比维度

Vercel

Cloudflare

核心定位

主打前端开发部署，聚焦开发者体验，是Next.js官方适配平台

定位“边缘操作系统”，以全球CDN和边缘计算为核心，兼顾部署与网络安全

框架适配

原生支持Next.js所有功能，包括实验性功能，适配无需额外配置

支持多语言框架，但对Next.js等框架需手动配置适配器，适配灵活性稍弱

免费额度

100次/天构建，100GB/月带宽，源文件大小限100MB

500次/月构建，带宽不限，D1数据库免费版限500MB存储

计算与存储

基于AWS Lambda的Serverless Functions，按流量计费，存储单独计费

Workers边缘计算（无冷启动），R2对象存储免费，云函数按请求次数计费

开发体验

集成度高，部署流程顺滑，Git提交自动构建预览，新手友好

配置稍复杂，免费版不支持并发构建，适合需控制细节的开发者

网络性能

国内访问时延较低，无需担心域名禁用等问题

全球节点多，但国内访问时延高，请求常回源至美国节点

特色功能

预览部署功能完善，适配Next.js的增量静态再生等专属能力

强大的DDoS防护、WAF等安全功能，支持Workers无缝拓展动态功能

#### Cloudflare Workers 的费用分为免费计划、付费标准计划，企业账户则按合同约定计费，且付费计划还涵盖其关联的KV、Durable Objects等配套功能的收费规则，具体如下：

计费项目

免费计划

付费标准计划

基础费用

0美元

每月最低5美元

核心请求量

每天10万次请求，每次调用含10毫秒CPU时间

每月包含1000万次请求，超出部分每100万次收费0.3美元；每月含3000万CPU毫秒，超出部分每1000万CPU毫秒收费0.02美元

Workers KV

每天10万次读请求，1000次写/删除请求，存储1GB

每月1000万次读请求、100万次写/删除请求，超出部分每100万次收费0.5美元；存储1GB，超出部分每1GB收费0.5美元

Durable Objects

不可用

每月包含100万次请求，超出部分每100万次收费0.15美元

队列操作

每月100万次操作

每月100万次操作，超出部分每100万次收费0.4美元

D1数据库

每天500万次读行、10万次写行，存储5GB

每月前25亿次读行、50万次写行，超出读行部分每100万次收费0.001美元，超出写行部分每100万次收费1美元；存储5GB

Workers Trace Events Logpush

不可用

每月1.1亿次请求量，超出部分每100万次收费0.05美元

此外，企业账户的计费不遵循上述标准计划规则，而是依据合同中约定的使用模式计费，若需切换使用模式，需联系专属客户成功经理协调。

#### Vercel 付费分Pro和Enterprise两类计划，采用信用额度+按需计费结合的模式；Cloudflare 付费分Pro、Business、Enterprise三类固定套餐，还可额外选购增值服务，
