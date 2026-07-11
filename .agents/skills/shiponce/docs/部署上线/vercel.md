---
title: '部署到 Vercel'
category: '部署上线'
---

# 部署到 Vercel

## [新项目部署流程](#%E6%96%B0%E9%A1%B9%E7%9B%AE%E9%83%A8%E7%BD%B2%E6%B5%81%E7%A8%8B)

基于 ShipAny 完成新项目的开发后，你可以参考下面的流程，将你的项目部署到 [Vercel](https://vercel.com/)，开始上线运营。

创建 Github 仓库

在 [Github](https://github.com/new) 选择一个组织，或者在你的个人账户下面，创建一个代码仓库，用于托管新项目的代码。

![](data:,)

> 请注意：一定要选择 `Private` 创建私有类型的代码仓库。不要公开发布基于 ShipAny 开发的项目代码。

推送项目代码

进入根据 [快速开始](https://shipany.ai/zh/docs/quick-start) 创建的项目，在项目根目录下执行以下命令，设置项目代码托管地址。

```
git remote set-url origin git@github.com:your-org/your-repo.git
```

把 `your-org/your-repo` 替换为你在上一步创建的代码仓库地址。

然后执行以下命令把代码推送到你的代码仓库。

```
git add .
git commit -m "first version"
git push origin main
```

部署项目

在 [Vercel](https://vercel.com/new) 创建一个新项目，连接上你的 Github 账户。选择上一步创建的代码仓库，导入代码开始部署。

![](data:,)

> 你可以在第一次部署的时候，设置线上使用的环境变量。也可以在项目部署之后，再修改环境变量。

在这里，我们先不设置环境变量，导入项目之后直接点击 `Deploy` 按钮，开始部署。第一次部署大约需要 2 分钟的时间。

等部署完成后，点击 `Continue to Dashboard` 按钮，进入项目管理页面。

查看项目

在项目管理页面，可以看到 Vercel 为你的项目分配的访问域名。点击域名，即可访问你的项目。

![](data:,)

至此，已通过 Vercel 成功部署你的项目。

接下来，可以通过 绑定自定义域名、设置环境变量、配置访问统计 等操作，让新项目正式上线运营。

## [绑定自定义域名](#%E7%BB%91%E5%AE%9A%E8%87%AA%E5%AE%9A%E4%B9%89%E5%9F%9F%E5%90%8D)

添加自定义域名

点击项目管理页面右上角的 `Domains` 按钮，进入域名管理页面。

输入你的自定义域名，点击 `Save` 按钮，添加自定义域名。

![](data:,)

这里你可以使用根域名，也可以使用子域名。

配置 DNS 解析

添加完域名后，点开刚添加的域名，查看 DNS 解析指引。这里可能提示你设置 CNAME 记录或者是 A 记录。

![](data:,)

打开你的域名注册商的 DNS 解析页面，按照上面的指引添加 DNS 解析。

访问项目

等 DNS 解析生效（一般半小时内生效，最多可能需要 48 小时），Vercel 会为你添加的自定义域名生成 SSL 证书。

访问你的自定义域名，就可以看到线上版本的网站了。

![](data:,)

## [设置环境变量](#%E8%AE%BE%E7%BD%AE%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F)

你可以在第一次创建 Vercel 部署时就设置环境变量，也可以在项目部署后，再修改环境变量。

填写环境变量内容

可以在本地项目根目录下创建一个 `.env.production` 文件，再填入项目的生产环境变量。

```
# app
NEXT_PUBLIC_APP_URL = "https://your-domain.com"
NEXT_PUBLIC_APP_NAME = "Your App Name"

# theme
NEXT_PUBLIC_THEME = "default"

# appearance
NEXT_PUBLIC_APPEARANCE = "dark"

# database
DATABASE_URL = "postgresql://user:password@domain:port/database"
DATABASE_PROVIDER = "postgresql"
DB_SINGLETON_ENABLED = "false"

# auth
AUTH_SECRET = "xxx"
```

记得根据你的项目信息，修改上面的环境变量值。

在 Vercel 设置环境变量

在 Vercel 项目管理的 `Setting -> Environment Variables` 页面，粘贴本地 `.env.production` 文件中的环境变量内容，点击 `Save` 按钮，设置环境变量。

![](data:,)

重新部署

每次设置完环境变量后，在项目管理的 `Deployments` 页面，选择最新的一次部署，点击 `Redeploy` 按钮，重新部署项目。

重新部署后，新设置的环境变量才会生效。

![](data:,)

## [配置访问统计](#%E9%85%8D%E7%BD%AE%E8%AE%BF%E9%97%AE%E7%BB%9F%E8%AE%A1)

你可以选择使用 Vercel 内置的访问统计，也可以使用第三方访问统计服务。

可以按以下步骤配置 Vercel 内置的访问统计：

开通 Web Analytics

在项目管理的 `Analytics` 页面，点击 `Enable` 按钮，开通 Vercel 的 `Web Analytics` 访问统计功能。

![](data:,)

> 注意：Vercel 内置的访问统计功能，是收费功能。请自行评估是否开通。

配置 Vercel 统计功能

进入项目管理后台，在 `Settings -> Analytics` 页面，划到 `Vercel Analytics` 面板，点击 `Enabled` 按钮开启，然后点 `Save` 按钮，保存配置。

![](data:,)

> 你需要先 [配置管理后台访问](https://shipany.ai/zh/docs/quick-start#%E9%85%8D%E7%BD%AE%E7%AE%A1%E7%90%86%E5%90%8E%E5%8F%B0%E8%AE%BF%E9%97%AE) ，才能进行上述配置。

[自定义多语言

Previous Page](https://shipany.ai/zh/docs/customize/locale)[部署到 Cloudflare Workers

Next Page](https://shipany.ai/zh/docs/deploy/cloudflare)
