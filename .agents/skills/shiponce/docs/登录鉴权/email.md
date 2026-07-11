---
title: '邮箱登录'
category: '登录鉴权'
---

# 邮箱登录

ShipAny 默认支持邮箱登录，简单配置即可启用。

## [快速开始](#%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B)

在启用邮箱登录功能前，你需要先配置好数据库和登录鉴权。

配置数据库

参考：[配置数据库](https://shipany.ai/zh/docs/quick-start#%E9%85%8D%E7%BD%AE%E6%95%B0%E6%8D%AE%E5%BA%93)。

配置登录鉴权

参考：[配置登录鉴权](https://shipany.ai/zh/docs/quick-start#%E9%85%8D%E7%BD%AE%E7%99%BB%E5%BD%95%E9%89%B4%E6%9D%83)。

配置邮箱登录

在完成数据库和鉴权配置后，访问网站首页，点击右上角的 `登录` 按钮，即可看到邮箱登录入口。

你可以使用邮箱注册一个新账户，并在此页面使用邮箱登录。

![](data:,)

配置管理后台

参考：[配置管理后台](https://shipany.ai/zh/docs/quick-start#%E9%85%8D%E7%BD%AE%E7%AE%A1%E7%90%86%E5%90%8E%E5%8F%B0%E8%AE%BF%E9%97%AE)，为使用邮箱注册的第一个账户配置超级管理员权限。

登录管理后台，可配置其他登录方式，可选择关闭邮箱登录。

## [关闭邮箱登录](#%E5%85%B3%E9%97%AD%E9%82%AE%E7%AE%B1%E7%99%BB%E5%BD%95)

在项目管理后台，进入 `Settings -> Auth -> Email Auth` 面板，点击 `Enabled` 开关，关闭邮箱登录。

![](data:,)

> 关闭邮箱登录后，用户在登录页面将看不到邮箱登录入口。请确保你已经配置了其他登录方式后再关闭邮箱登录。

其他登录方式配置参考：

- [Google 登录](https://shipany.ai/zh/docs/auth/google)
- [Github 登录](https://shipany.ai/zh/docs/auth/github)

## [邮箱验证](#%E9%82%AE%E7%AE%B1%E9%AA%8C%E8%AF%81)

在开启邮箱登录功能后，默认情况下，用户可以使用任意符合邮箱格式的邮箱地址注册新账户并登录。

用户使用的邮箱，格式虽然符合邮箱格式，但也许不能正常接收邮件。比如：`test@111.com`。

为了防止恶意注册，你可以选择开启邮箱验证功能。

> 邮箱验证依赖邮件服务。在开启邮箱验证功能前，请确保你已经配置了邮件服务。

邮件服务配置参考：

- [Resend 邮件服务](https://shipany.ai/zh/docs/email/resend)。

在项目管理后台，进入 `Settings -> Auth -> Email Auth` 面板，点击 `Email Verification Required` 开关，开启邮箱验证功能。

![](data:,)

开启邮箱验证后，用户使用邮箱注册或登录后，如果邮箱未验证，将会跳转到等待验证页面。

![](data:,)

用户邮箱会收到一封验证邮件，点击验证链接完成验证后，才能正常使用邮箱登录。

![](data:,)

[Cloudflare D1

Previous Page](https://shipany.ai/zh/docs/database/d1)[Google 登录

Next Page](https://shipany.ai/zh/docs/auth/google)
