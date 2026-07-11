---
title: '项目如何配置使用neon数据库'
category: '配置'
---

# 项目如何配置使用neon数据库

> 项目可使用 PostgreSQL 作为数据库系统，使用 Drizzle ORM 进行数据库访问和管理。

# 创建数据库

推荐使用托管的 PostgreSQL 数据库服务，它们提供简单的设置和管理，并且通常包含足够入门的免费套餐

> [Neon](https://neon.com/)（推荐）  
> [Neon](https://neon.com/) 是一个具有出色的开发者体验的 PostgreSQL 数据库服务，它是小型项目的绝佳选择。

## 设置步骤

### 1、在 [neon.tech](https://neon.com/) 创建账户

![](https://img-doc.16781678.xyz/uploads/2026-01-01/1767262472381-i1ttz7.jpg)

### 2、创建新项目

![](https://img-doc.16781678.xyz/uploads/2026-01-01/1767273010459-w6t3w3.jpg)

### 3、创建数据库

![](https://img-doc.16781678.xyz/uploads/2026-01-01/1767272930692-nmgcjg.jpg)

### 4、从仪表盘获取连接字符串

![](https://img-doc.16781678.xyz/uploads/2026-01-01/1767264116632-cqvmgx.jpg)

### 5、将连接字符串作为 DATABASE_URL 添加到项目根目录下 `.env` 或者 `.env.production` 或者 `.env.development` 文件中

#### （1）部署在Vercel的看下面

![](https://img-doc.16781678.xyz/uploads/2026-01-01/1767264180078-0l106m.jpg)

> Neon 连接字符串示例:

```
DATABASE_URL="postgresql://neondb_owner:xxxxx@ep-soft-credit-xxxxx-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

```

#### （2）部署在Cloudflare的看下面

需要将`Connection pooling`关闭掉，这样后面配置`Hyperdrive`才能加速成功

![](https://img-doc.16781678.xyz/uploads/2026-01-04/1767537951501-lpe3mc.jpg)

> Neon 连接字符串示例:

```
postgresql://neondb_owner:xxxxxxx@ep-rough-tooth-ahvvw9t5.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

```

### 然后再回到：[项目快速上手图文教程](#/shipany-two/getting-started/quick-start-guide#%E6%95%B0%E6%8D%AE%E5%BA%93) 进行数据库初始化等一系列操作

## 延伸：部署在Cloudflare的Hyperdrive配置（如果你是部署在Vercel的不需要看）

> 下面这块写的建立在你已经会用hyperdrive了，但你之前可能是配置Supabase的hyperdrive 成功了；这里专门说下基于Neon数据库怎么配置

### 以`根目录/wrangler.toml`为例

```
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "14ff0c07d67940139cd99d7673a952a8"
# 将上面的`Neon 连接字符串值`改写为下面格式（下面只是值参考，不能完全复制粘贴）
# 这个localConnectionString的值可以用于Cloudflare的Hyperdrive新建时录入的值
localConnectionString = "postgres://neondb_owner:xxxxx@ep-rough-tooth-ahvvw9t5.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

```

![](https://img-doc.16781678.xyz/uploads/2026-01-04/1767538504678-amgs0c.jpg)

创建成功后更新掉`wrangler.toml`中（也就是上面代码中）的\[\[hyperdrive\]\]的id值

![](https://img-doc.16781678.xyz/uploads/2026-01-04/1767538601894-fqmbrr.jpg)

然后执行`pnpm cf:deploy`部署成功后 稍等片刻就能看到加速成功了

![](https://img-doc.16781678.xyz/uploads/2026-01-04/1767538691239-0867ux.jpg)
