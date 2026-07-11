---
title: '常见问题解答'
category: '使用指南'
---

# 常见问题解答

## [ShipAny Two 跟 ShipAny One 有什么区别？](#shipany-two-%E8%B7%9F-shipany-one-%E6%9C%89%E4%BB%80%E4%B9%88%E5%8C%BA%E5%88%AB)

ShipAny Two 是 ShipAny 的第二个版本，相比于 ShipAny One，在架构设计、功能丰富度、性能优化等方面都有很大提升。
包括以下几个方面：

- ShipAny Two 支持 `Next.js 16`，本地开发更快、内存占用更小。
- ShipAny Two 使用 `Better-Auth` 替换 `NextAuth`，支持更多认证方式。
- ShipAny Two 支持在管理后台可视化配置功能，更加灵活
- ShipAny Two 支持 RBAC 控制后台管理系统的访问
- ShipAny Two 支持可插拔扩展，包括支付、存储、邮件、数据统计、广告、联盟营销、客服等
- ShipAny Two 内置了大量 AI 功能，包括 AI 对话、AI 生成图片、AI 生成视频等

更多内容可以查阅 [ShipAny Two 系统架构](https://shipany.ai/zh/docs/guide/architecture)。

## [ShipAny Two 需要单独购买吗？](#shipany-two-%E9%9C%80%E8%A6%81%E5%8D%95%E7%8B%AC%E8%B4%AD%E4%B9%B0%E5%90%97)

在 [个人中心 -> 活动 -> 已购模板](https://shipany.ai/zh/activity/templates) 查看是否有 ShipAny Two 模板，如果没有，参考下面的流程购买。

- 原有 ShipAny 高级版用户在 [ShipAny Two 模板详情页](https://shipany.ai/zh/templates/shipany-template-two) 支付 0 元购买，再绑定 Github 用户名激活。
- 新用户在 [定价页面](https://shipany.ai/zh/pricing) 购买 ShipAny 高级版，自动获得 ShipAny Two 模板，再绑定 Github 用户名激活。

## [ShipAny 模板如何激活？](#shipany-%E6%A8%A1%E6%9D%BF%E5%A6%82%E4%BD%95%E6%BF%80%E6%B4%BB)

在 [个人中心 -> 活动 -> 已购模板](https://shipany.ai/zh/activity/templates) 查看已购买模板，如果是未激活状态，可以点击 "激活" 按钮，在激活页面输入你的 Github 用户名，提交激活。

> 请注意，一定要填写你的 Github 用户名，而不是邮箱。在浏览器访问：`github.com/your-github-username`，确保能进入你的 Github 个人主页，在激活页面填入 `your-github-username` 提交激活。

![](data:,)

> 如果模板已激活，但是 Github 邀请过期了。可以选择已购买模板右侧的下拉菜单，点击 `重新激活` 按钮，在激活页面重新提交激活。这种情况，不能修改 Github 用户名，只能重新发送 Github 邀请。

## [如何开始使用 ShipAny Two？](#%E5%A6%82%E4%BD%95%E5%BC%80%E5%A7%8B%E4%BD%BF%E7%94%A8-shipany-two)

参考 [获取 ShipAny](https://shipany.ai/zh/docs/guide/get-shipany) 获得 ShipAny Two 代码仓库访问权限。

参考 [快速开始](https://shipany.ai/zh/docs/quick-start) 使用 ShipAny Two 启动你的项目。

## [如何获得技术支持？](#%E5%A6%82%E4%BD%95%E8%8E%B7%E5%BE%97%E6%8A%80%E6%9C%AF%E6%94%AF%E6%8C%81)

你可以通过以下三种方式，获得技术支持：

- 在 [Github issues](https://github.com/shipanyai/shipany-template-two/issues) 提 issue。
- 加入 [ShipAny Discord 群](https://discord.com/invite/x9usYqTaaj) 提问。
- 发邮件给 [support@shipany.ai](mailto:support@shipany.ai) 获取帮助。

> 环境配置、Next.js、React 等常规问题，建议优先通过搜索 + AI 问答等方式自行解决。ShipAny 框架相关问题，可在代码仓库提 issue 或在 Discord 交流。

## [购买的模板可以退款吗？](#%E8%B4%AD%E4%B9%B0%E7%9A%84%E6%A8%A1%E6%9D%BF%E5%8F%AF%E4%BB%A5%E9%80%80%E6%AC%BE%E5%90%97)

在 [个人中心 -> 活动 -> 已购模板](https://shipany.ai/zh/activity/templates) 查看已购买模板，如果是未激活状态，可以申请退款。

复制订单号，通过技术支持渠道申请退款。

> 如果模板已激活，不支持退款。

## [ShipAny Two 代码仓库不能 fork 吗？](#shipany-two-%E4%BB%A3%E7%A0%81%E4%BB%93%E5%BA%93%E4%B8%8D%E8%83%BD-fork-%E5%90%97)

私有仓库，不支持 fork。你需要创建自己的 Github 私有仓库，保存你的项目代码。

## [如何同步 ShipAny Two 的更新？](#%E5%A6%82%E4%BD%95%E5%90%8C%E6%AD%A5-shipany-two-%E7%9A%84%E6%9B%B4%E6%96%B0)

1. 先克隆 ShipAny Two 代码仓库，初始化你自己的项目

```
git clone git@github.com:shipanyai/shipany-template-two my-shipany-project
```

2. 为你的项目创建私有 Github 仓库

比如，你在 Github 创建了一个私有仓库来保存你的项目代码，仓库地址是：`github.com/idoubi/my-shipany-project`

3. 把项目代码推送到你的私有 Github 仓库

```
# 进入项目根目录
cd my-shipany-project
# 修改代码托管地址
git remote set-url origin git@github.com:idoubi/my-shipany-project.git
# 推送代码
git push origin main
```

4. 把 ShipAny Two 代码仓库设置为你的项目上游仓库

```
git remote add upstream git@github.com:shipanyai/shipany-template-two.git
```

5. 同步 ShipAny Two 的更新

```
# 拉取上游仓库的更新
git fetch upstream
# 合并上游仓库的更新
git merge upstream/main
# 推送代码到你的私有 Github 仓库
git push origin main
```

你可以按需更新 ShipAny Two 最新代码，如果上游代码跟你的项目代码有冲突，你需要手动解决冲突。

更新完代码后，记得安装一下项目依赖。

```
pnpm install
```

> 如果上游代码改动较大，请谨慎同步。可以使用 [cherry-pick](https://git-scm.com/docs/git-cherry-pick) 命令，只同步你需要的变更。

## [如何更新数据库表结构？](#%E5%A6%82%E4%BD%95%E6%9B%B4%E6%96%B0%E6%95%B0%E6%8D%AE%E5%BA%93%E8%A1%A8%E7%BB%93%E6%9E%84)

每次同步完上游代码，记得更新一下数据表结构，确保你的项目能同步上游的数据表变更。

```
pnpm db:generate
pnpm db:migrate
```

[获取 ShipAny

Previous Page](https://shipany.ai/zh/docs/guide/get-shipany)[系统架构

Next Page](https://shipany.ai/zh/docs/guide/architecture)
