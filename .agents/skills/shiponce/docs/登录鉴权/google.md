---
title: 'Google 登录'
category: '登录鉴权'
---

# Google 登录

## [快速开始](#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)

按照以下步骤为你的项目配置 Google 登录。

选择 Google Cloud 项目

进入 Google Cloud 控制台，进入 [API & Services -> Credentials](https://console.cloud.google.com/apis/credentials) 页面。

点击左上角的项目选择器，选择一个项目，或者新建一个项目。

创建 OAuth 客户端

在 [API & Services -> Credentials](https://console.cloud.google.com/apis/credentials) 页面，点击 `Create Credentials` 按钮，选择 `OAuth client ID`，开始创建 OAuth 客户端。

- `Application type` 选择 `Web application`。
- `Name` 填写你的项目名称。

在 `Authorized javascript origins` 下面添加你的项目域名，比如：

```
https://your-domain.com
```

在 `Authorized redirect URIs` 下面添加你的项目回调地址，格式为：

```
https://your-domain.com/api/auth/callback/google
```

![](data:,)

点击 `Create` 按钮，在弹出的窗口中，复制 `Client ID` 和 `Client secret`。

> 注意：如果是新项目创建 OAuth 客户端，需要先完成 `OAuth consent screen` 配置，按照提示一步步操作即可。记得不要上传 `App logo`，否则会触发验证。

配置 Google 登录

在项目管理后台，进入 `Settings -> Auth -> Google Auth` 面板，填入上一步复制的 `Client ID` 和 `Client secret`。

打开 `Auth Enabled` 开关启用谷歌跳转登录功能，打开 `OneTap Enabled` 开关启用谷歌快捷登录功能。

![](data:,)

验证谷歌登录

进入项目主页，刷新页面，可以看到右上角弹出 `谷歌快捷登录` 弹窗，用户可以使用谷歌账号一键登录你的网站。

![](data:,)

在页面右上角点击 `Sign In` 按钮，显示登录弹窗，底部包含 `谷歌登录` 按钮，用户点击跳转 `谷歌 OAuth 登录`。

![](data:,)

[邮箱登录

Previous Page](https://shipany.ai/zh/docs/auth/email)[Github 登录

Next Page](https://shipany.ai/zh/docs/auth/github)
