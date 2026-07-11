---
title: '部署到 Cloudflare Workers'
category: '部署上线'
---

# 部署到 Cloudflare Workers

基于 ShipAny 开发的项目支持部署到 [Cloudflare Workers](https://workers.cloudflare.com/)。利用 Cloudflare Workers 的 Serverless 特性，可以实现高可用、低成本的部署。

按照以下步骤完成 Cloudflare Workers 的适配与部署。

## [项目适配](#%E9%A1%B9%E7%9B%AE%E9%80%82%E9%85%8D)

让你的项目能正常运行在 Cloudflare Workers 上，需要做项目适配，一般有三种情况。

新项目，用适配好的分支创建

在参考 [快速开始](https://shipany.ai/zh/docs/quick-start) 初始化项目时，选择拉取 `cf` 分支的代码。此分支代码已适配 Cloudflare Workers，在此基础上开发的项目，可一键部署到 Cloudflare Workers。

```
git clone -b cf git@github.com:shipanyai/shipany-template-two my-shipany-project
```

已有项目，合并适配好的分支代码

如果你的项目是基于 `main` 分支或 `dev` 分支创建的，一开始是部署到 `Vercel` 等平台，后来需要重新部署到 Cloudflare Workers，你可以选择合并适配好的分支代码，完成项目适配。

```
# 为你的项目创建新分支
git checkout -b cf
# 把 ShipAny 仓库代码设为上游
git remote add upstream git@github.com:shipanyai/shipany-template-two.git
# 拉取上游仓库的更新
git fetch upstream
# 合并上游仓库指定分支的更新
git merge upstream/cf
```

> 请注意：直接合并上游分支代码可能会遇到冲突，需要手动解决冲突。

已有项目，自行适配

如果你的已有项目，相较于上游项目，有较大的改动，不适合直接合并上游仓库代码。你可以参考 [OpenNext 文档](https://opennext.js.org/cloudflare/get-started#existing-nextjs-apps)，自行适配。

按照文档示例的步骤一步步操作，完成项目适配。

> 请注意：OpenNext 目前不支持 `Next.js 16`，在适配前请先把项目降级到 `Next.js 15.5.5`。

## [项目部署](#%E9%A1%B9%E7%9B%AE%E9%83%A8%E7%BD%B2)

在完成上述的项目适配流程后，就可以按照下面的步骤，将你的项目部署到 Cloudflare Workers 了。

设置线上环境变量

在项目根目录创建一个 `.env.production` 文件。可以手动创建，也可以通过下面的命令创建。

```
cp .env.example .env.production
```

把 `.env.production` 文件中的环境变量值，改成线上环境配置。

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

# auth secret
# openssl rand -base64 32
AUTH_SECRET = "your-secret-key"
```

设置部署文件

在项目根目录创建一个 `wrangler.toml` 文件。可以手动创建，也可以通过下面的命令创建。

```
cp wrangler.toml.example wrangler.toml
```

然后修改 `wrangler.toml` 文件中的内容，根据你的项目在线上部署的情况，修改对应的变量值。

复制上一步设置的 `.env.production` 文件中的内容，替换掉 `wrangler.toml` 文件中 `[vars]` 下面的内容。

```
name = "your-app-name"
main = ".open-next/worker.js"
compatibility_date = "2025-03-01"
compatibility_flags = ["nodejs_compat"]

[assets]
binding = "ASSETS"
directory = ".open-next/assets"

# [[hyperdrive]]
# binding = "HYPERDRIVE"
# id = ""
# localConnectionString = ""

[observability]
enabled = true

[vars]
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

# auth secret
# openssl rand -base64 32
AUTH_SECRET = "your-secret-key"
```

> 注意：第一次部署时，我们先注释掉 `wrangler.toml` 文件中的 `[[hyperdrive]]` 配置，等部署完成后再来设置。Cloudflare Workers 是 Serverless 平台，不支持数据库单例模式，确保设置 `DB_SINGLETON_ENABLED = "false"`

通过命令行部署项目

在项目根目录下执行以下命令，安装项目依赖。

```
pnpm install
```

依赖安装完后，会自动安装 `wrangler` 命令行工具。

然后在项目根目录下执行以下命令，部署项目到 Cloudflare Workers。

```
pnpm cf:deploy
```

如果是第一次部署项目到 Cloudflare Workers，命令行会输出 Cloudflare 的授权地址。你需要点击打开链接，在浏览器登录你的 Cloudflare 账户，完成对项目的授权。

授权完成后，部署命令会继续执行，编译项目代码，上传部署文件，最终把你的项目发布到 Cloudflare Workers，并输出预览地址。

![](data:,)

至此，项目已经成功部署到 Cloudflare Workers。打开输出的预览地址，就可以看到项目页面了。

接下来，你可以通过 绑定自定义域名、配置 Hyperdrive 等操作，让项目正式上线运营。

## [绑定自定义域名](#%E7%BB%91%E5%AE%9A%E8%87%AA%E5%AE%9A%E4%B9%89%E5%9F%9F%E5%90%8D)

在 Cloudflare 添加自定义域名

如果你的域名是在其他域名服务商（Godaddy、Namecheap 等）注册的，你可以选择在 Cloudflare 添加自定义域名。

![](data:,)

然后去你的域名管理后台，把域名的 NAMESERVER 设置为 Cloudflare 提供的 Nameservers

```
graham.ns.cloudflare.com
ullis.ns.cloudflare.com
```

域名托管到 Cloudflare 后，可以使用 Cloudflare 提供的 DNS 解析、SSL 证书、CDN 加速等功能。

在 Cloudflare Workers 添加自定义域名

进入部署在 Cloudflare Workers 的项目管理页面，进入 `Settings -> Domains & Routers` 页面，点击 `Add` 按钮，选择 `Custom Domain`，输入你的自定义域名（可以是托管在 Cloudflare 的根域名，或者子域名），点击 `Add Domain` 按钮，添加自定义域名。

![](data:,)

访问项目

上一步添加自定义域名后，Cloudflare 会自动为域名添加到 Cloudflare Workers 的 DNS 解析记录。等 DNS 解析生效（一般半小时内生效，最多可能需要 48 小时），就可以通过自定义域名访问你的项目了。

![](data:,)

## [配置 Hyperdrive](#%E9%85%8D%E7%BD%AE-hyperdrive)

[Hyperdrive](https://developers.cloudflare.com/hyperdrive/) 是一项由 Cloudflare 提供的，用于加速全球用户对现有数据库访问的服务。

通过以下步骤配置 Hyperdrive，加快 Cloudflare Workers 上部署的项目对外部数据库的访问速度。

配置 Hyperdrive

进入 Cloudflare 控制台，在 `Storage & databases -> Hyperdrive` 页面点击 `Create configuration` 按钮，创建 Hyperdrive 配置。

在创建 Hyperdrive 配置页面，选择 `Connect to public database`，然后填入数据库配置信息。

![](data:,)

`Configuration name` 是给你自己看的配置名称，填什么无所谓。

`Connection String` 要填写项目线上环境的数据库连接地址。

复制 Hyperdrive 配置 ID

在 Hyperdrive 配置管理页面，复制 Hyperdrive 配置 ID。

![](data:,)

修改项目配置文件

修改项目根目录下的 `wrangler.toml` 文件，开启 `[[hyperdrive]]` 配置，填入 Hyperdrive 配置 ID 和线上环境的数据库连接地址。

```
[[hyperdrive]]
binding = "HYPERDRIVE" # 固定值，不要修改
id = "your-hyperdrive-config-id" # 填入上一步复制的 Hyperdrive 配置 ID
localConnectionString = "postgresql://user:password@domain:port/database" # 填入线上环境的数据库连接地址
```

重新部署项目

在项目根目录下执行以下命令，重新部署项目。

```
pnpm cf:deploy
```

重新部署项目后，项目会自动使用 Hyperdrive 加速数据库访问。可以在 Hyperdrive 管理页面，看到数据查询请求的统计信息。

## [查看项目运行日志](#%E6%9F%A5%E7%9C%8B%E9%A1%B9%E7%9B%AE%E8%BF%90%E8%A1%8C%E6%97%A5%E5%BF%97)

在 Cloudflare 控制台，进入 `Workers & Pages` 页面，选择部署在 Cloudflare Workers 的项目，进入项目管理页面。

点击 `Observability` 标签进入项目运行日志页面。可以在此处查看项目运行过程中输出的系统日志和调试内容。

![](data:,)

如果你希望通过日志排查问题，可以在项目代码里面通过 `console.log` 打印调试日志，重新部署上线。

然后在 `Observability` 页面点击 `Live` 按钮，监听实时输出的日志内容。刷新线上访问地址，查看日志输出，根据日志内容定位具体问题。

[部署到 Vercel

Previous Page](https://shipany.ai/zh/docs/deploy/vercel)[使用 Dokploy 部署

Next Page](https://shipany.ai/zh/docs/deploy/dokploy)
