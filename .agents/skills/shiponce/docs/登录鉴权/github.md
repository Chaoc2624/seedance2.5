---
title: 'Github 登录'
category: '登录鉴权'
---

# Github 登录

## [快速开始](#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)

按照以下步骤为你的项目配置 Github 登录。

创建 Github 应用

访问 [Github Developer Settings](https://github.com/settings/developers) 页面，点击 `New OAuth App` 按钮，创建一个 Github 应用。

- `Application name` 填写你的项目名称。
- `Homepage URL` 填写你的项目域名。
- `Authorization callback URL` 填写你的项目回调地址，格式为：

```
https://{your-domain}/api/auth/callback/github
```

点击 `Register application` 按钮，完成 Github 应用创建。

![](data:,)

复制 Github 应用 ID 和密钥

在 Github 应用详情页，点击 `Generate a new client secret` 按钮，生成一个新的客户端密钥。

复制 `Client ID` 和 `Client secret`。

配置 Github 登录

在项目管理后台，进入 `Settings -> Auth -> Github Auth` 面板，填入上一步复制的 `Client ID` 和 `Client secret`。

打开 `Auth Enabled` 开关启用 Github 登录功能。

点击 `Save` 按钮，保存配置。

![](data:,)

验证 Github 登录

进入项目主页，刷新页面，点击右上角的 `登录` 按钮，即可看到 Github 登录入口。

![](data:,)

[Google 登录

Previous Page](https://shipany.ai/zh/docs/auth/google)[支付

Next Page](https://shipany.ai/zh/docs/payment)
