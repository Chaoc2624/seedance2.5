---
title: '项目部署到 Cloudflare Workers（Windows）'
category: '部署'
---

# 项目部署到 Cloudflare Workers（Windows）

# 写在前面

按照作者提供的[Cloudflare部署文档](https://shipany.ai/docs/deploy/cloudflare)在Windows执行到`pnpm cf:deploy` 会先后遇到一些问题：

- OpenNext 在 Windows 上确实有兼容性问题 导致打包部署失败；
- Windows 符号链接权限问题 导致打包部署失败；
- 解决完后执行打包部署成功后，访问线上地址，页面展示Internal Server Error 或者500 错误

## 先说原因：

官方教程没考虑Windows这个系统，直接在本地执行`pnpm cf:deploy`就不行。

## 已知情况：

在Mac上本地执行`pnpm cf:deploy`成功部署Cloudflare；

在Windows上就是不行，除非用wsl、wrangler技术，但是操作成本有点高，还有失败率，考虑到后期解答时间成本高，此法不可取；

## 最终解决办法

参考Vercel创建项目部署法思路，因为Cloudflare、Vercel都是基于Linux（环境一致性：避免了 Windows 下文件路径（File Paths）或符号链接（Symlinks）导致的构建产物异常），那么咱们抛弃官方 `pnpm cf:deploy`方案。

### 前提：你的项目已经提交到github

> 而且，你已经在前面的教程做完了db数据库初始化、rbac、admin用户注册分配为super_admin

## 在项目中打开package.json

增加一行`"cf:build": "opennextjs-cloudflare build",`到 `"scripts": {}`中

例如：

```
"scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "build:fast": "NODE_OPTIONS='--max-old-space-size=4096' next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "db:generate": "npx drizzle-kit generate --config=src/core/db/config.ts",
    "db:migrate": "npx drizzle-kit migrate --config=src/core/db/config.ts",
    "db:push": "npx drizzle-kit push --config=src/core/db/config.ts",
    "db:studio": "npx drizzle-kit studio --config=src/core/db/config.ts",
    "auth:generate": "npx @better-auth/cli generate --config=src/core/auth/index.ts",
    "rbac:init": "npx tsx scripts/init/init-rbac.ts",
    "rbac:assign": "npx tsx scripts/db/assign-role.ts",
    "postinstall": "fumadocs-mdx",
    "cf:build": "opennextjs-cloudflare build",
    "cf:preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "cf:deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "cf:upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    "cf:typegen": "wrangler types --env-interface CloudflareEnv src/shared/types/cloudflare.d.ts"
  },

```

## 在项目根目录下新建wrangler.jsonc，复制下面内容后修改部分值（如果已有wrangler.jsonc，就复制下面内容覆盖其中内容）

```
{
	"$schema": "node_modules/wrangler/config-schema.json",
	"main": ".open-next/worker.js",
	"name": "shipany-template", // 这里需要修改成你的项目名称
	"compatibility_date": "2025-12-02",
	"compatibility_flags": ["nodejs_compat"],
	"assets": {
		"directory": ".open-next/assets",
		"binding": "ASSETS"
	},
	"r2_buckets": [
		// Use R2 incremental cache
		// See https://opennext.js.org/cloudflare/caching
		{
			"binding": "NEXT_INC_CACHE_R2_BUCKET",
			// Create the bucket before deploying
			// You can change the bucket name if you want
			// See https://developers.cloudflare.com/workers/wrangler/commands/#r2-bucket-create
			"bucket_name": "cache"
		}
	],
	//  ！！！这里是开启日志的配置 ！！！
	"observability": {
		"enabled": true,
		"head_sampling_rate": 1,
		"logs": {
			"enabled": true,
			"head_sampling_rate": 1,
			"invocation_logs": true
		}
	},
    //  ！！！这里是环境变量的配置 ！！！注意：这个会提交到git上，一定是自己的私有仓库，避免泄露，部分值做了xxx处理
	"vars": {
		"NEXT_PUBLIC_APP_URL": "https://your-domain.com",
		"NEXT_PUBLIC_APP_NAME":"Your App Name",
		"NEXT_PUBLIC_THEME": "default",
		"NEXT_PUBLIC_APPEARANCE": "system",
		"DATABASE_URL": "postgres://postgres.bobhcicyxxxxsdbvpf:[Your Password]@aws-1-us-west-1.pooler.supabase.com:5432/postgres",
		"DATABASE_PROVIDER": "postgresql",
		"DB_SINGLETON_ENABLED": "false",
        "DB_MAX_CONNECTIONS": "10",
		"AUTH_SECRET": "wGxL6wMsyxxxxDC0lfRzgl3PzHPMZDAN+s="
	}
}

```

### 访问Cloudflare › Workers & Pages，创建

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902581916-pus6l0.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902589079-r8625a.jpg)

// pnpm cf:build

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902600825-j6cnri.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902608836-543zbj.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902634871-g3zu35.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902646116-qesgz8.jpg)

成功后按照上面截图提供的地址访问看看能否正常访问

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902653381-b6g0nu.jpg)

## 后面怎么自动部署呢？

后续的 GitHub 提交（Push）会自动触发 Cloudflare 的自动部署。你不需要做额外操作

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902660143-ugwnnu.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902668374-v1ino2.jpg)

## git提交后，怎么查看部署过程和记录呢？

看下图，点击后再返回就能看到所有的build 记录：

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902676763-4c6z60.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902683363-52rqlz.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902690246-qm2d8r.jpg)

# 绑定自定义域名

> 如果你没有域名, 请阅读：[如何购买便宜的域名](https://nanobanana2.16781678.xyz/docs/others/buy-cheap-domain)

## 第一种：在 Cloudflare 添加自定义域名

如果你的域名是在其他域名服务商（Godaddy、Namecheap 等）注册的，你可以选择在 Cloudflare 添加自定义域名。

> 这一种主要存在新域名第一次在Cloudflare上配置。

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902728073-ho37m1.jpg)

然后去你的域名管理后台，把域名的 NAMESERVER 设置为 Cloudflare 提供的 Nameservers

```
graham.ns.cloudflare.com
ullis.ns.cloudflare.com

```

域名托管到 Cloudflare 后，可以使用 Cloudflare 提供的 DNS 解析、SSL 证书、CDN 加速等功能。

## 第二种：在 Cloudflare Workers 添加自定义域名

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902739055-mk3jiz.jpg)

进入部署在 Cloudflare Workers 的项目管理页面，进入 Settings -> Domains & Routers 页面，点击 Add 按钮，选择 Custom Domain，输入你的自定义域名（可以是托管在 Cloudflare 的根域名，或者子域名），点击 Add Domain 按钮，添加自定义域名。

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902751562-edly46.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902797778-eoo46h.jpg)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902763914-x5dh0b.jpg)

## 访问项目

上一步添加自定义域名后，Cloudflare 会自动为域名添加到 Cloudflare Workers 的 DNS 解析记录。等 DNS 解析生效（一般半小时内生效，最多可能需要 48 小时），就可以通过自定义域名访问你的项目了。

# 配置 Hyperdrive

[Hyperdrive](https://developers.cloudflare.com/hyperdrive/) 是一项由 Cloudflare 提供的，用于加速全球用户对现有数据库访问的服务。

通过以下步骤配置 Hyperdrive，加快 Cloudflare Workers 上部署的项目对外部数据库的访问速度。

## 2025-12-23 新问题记录

> 由于咱们使用的是非Cloudflare D1数据库（例如：Supabase），这时候必须配置 Hyperdrive，要不然会遇到：页面异常崩溃问题，在 Cloudflare Workers 环境中 postgres-js 驱动有点问题，

> **使用Hyperdrive（ Cloudflare 的数据库加速服务），可以解决 postgres-js 在 Workers 环境中的兼容性问题。**

## 配置 Hyperdrive

进入 Cloudflare 控制台，在 Storage & databases -> Hyperdrive 页面点击 Create configuration 按钮，创建 Hyperdrive 配置。

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902848331-r792q5.jpg)

在创建 Hyperdrive 配置页面，选择 Connect to public database，然后填入数据库配置信息。

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902859061-q48gyc.jpg)

- Configuration name ：是给你自己看的配置名称，填什么无所谓。
- Connection String ：要填写项目线上环境的数据库连接地址。例如：

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902867770-frhosa.jpg)

### 复制后改成下面这样：

```
// 这是复制的示例
postgresql://postgres:[YOUR_PASSWORD]@db.tsjbzbpzwilbxnrqkqzp.supabase.co:5432/postgres

// 下面是修改成的示例：
// 注意：[YOUR_PASSWORD]换成你的密码，
// 注意：db.qcddhntipeafhilqnilm.supabase.co 换成你的
组装示例：postgres://postgres:[YOUR_PASSWORD]@db.qcddhntipeafhilqnilm.supabase.co:5432/postgres

```

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902877512-599pvy.jpg)

Next创建成功

## 复制 Hyperdrive 配置 ID

在 Hyperdrive 配置管理页面，复制 Hyperdrive 配置 ID。

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902885186-sl1i97.jpg)

## 打开根目录下.gitignore

> 打开 `你项目根目录下/wrangler.jsonc`

```
{
	"$schema": "node_modules/wrangler/config-schema.json",
	"main": ".open-next/worker.js",
        // ！！！这个是你在 Cloudflare Dashboard 中看到 Workers & Pages 下当前项目的名称，要保持一致【要改一致】（不需要和文件夹名或 GitHub 项目名一致）！！！
	"name": "shipany-template",
	"compatibility_date": "2025-12-02",
	"compatibility_flags": ["nodejs_compat"],
	"assets": {
		"directory": ".open-next/assets",
		"binding": "ASSETS"
	},
	"r2_buckets": [
		// Use R2 incremental cache
		// See https://opennext.js.org/cloudflare/caching
		{
			"binding": "NEXT_INC_CACHE_R2_BUCKET",
			// Create the bucket before deploying
			// You can change the bucket name if you want
			// See https://developers.cloudflare.com/workers/wrangler/commands/#r2-bucket-create
			"bucket_name": "cache"
		}
	],
      // ！！！这里是新增hyperdrive配置！！！
	"hyperdrive": [
		{
			"binding": "HYPERDRIVE", // 固定值 不要改
			"id": "8e25228e46c54xxxxx064e89df2e", // 上面复制的Hyperdrive 配置 ID
			"localConnectionString": "postgres://postgres.bobhcicyxxxxsdbvpf:[Your Password]@aws-1-us-west-1.pooler.supabase.com:5432/postgres" // 这个是从Supabase复制过来的，注意格式和我的要一致，端口是5432，其中[Your Password]改成你的数据库密码
		}
	],
//  ！！！这里是开启日志的配置 ！！！
	"observability": {
		"enabled": true,
		"head_sampling_rate": 1,
		"logs": {
			"enabled": true,
			"head_sampling_rate": 1,
			"invocation_logs": true
		}
	},
    //  ！！！这里是环境变量的配置 ！！！注意：这个会提交到git上，一定是自己的私有仓库，避免泄露，部分值做了xxx处理
	"vars": {
		"NEXT_PUBLIC_APP_URL": "https://your-domain.com",
		"NEXT_PUBLIC_APP_NAME":"Your App Name",
		"NEXT_PUBLIC_THEME": "default",
		"NEXT_PUBLIC_APPEARANCE": "system",
		"DATABASE_URL": "postgres://postgres.bobhcicyxxxxsdbvpf:[Your Password]@aws-1-us-west-1.pooler.supabase.com:5432/postgres",
		"DATABASE_PROVIDER": "postgresql",
		"DB_SINGLETON_ENABLED": "false",
		"AUTH_SECRET": "wGxL6wMsyxxxxDC0lfRzgl3PzHPMZDAN+s="
	}
}

```

保存后，提交到git触发自动部署，然后再次访问项目，看下admin能不能正常进入，例如：[https://my-shipany.16781678.xyz/admin/users](https://my-shipany.16781678.xyz/admin/users)

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902907773-pd0a6e.jpg)

部署成功后，项目会使用 Hyperdrive 加速数据库访问。可以在 Hyperdrive 管理页面，看到数据查询请求的统计信息。

![](https://img-template-nano-banana.16781678.xyz/uploads/2025-12-16/1765902917866-mwcqvb.jpg)

个人建议配置上，我之前有个站配置后 查询返回明显快了很多
