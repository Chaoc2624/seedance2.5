---
title: 'Paypal.cn国内身份+银行卡注册后如何接入使用'
category: '支付'
---

# Paypal.cn国内身份+银行卡注册后如何接入使用

按照 [Paypal.cn现在支持个人收款了](#/shipany-two/payment/paypal-cn-person)

咱们注册了Paypal.cn后需要后台配置才能正常使用，但是按照shipany官方的文档[https://shipany.ai/zh/docs/payment/paypal](https://shipany.ai/zh/docs/payment/paypal) ,他是基于（[paypal.com](http://paypal.com)）

并不完全适用于paypal.cn.下面基于我跑通的闭环给大家写下教程

## 配置 Paypal 支付

访问 [https://www.paypal.cn/sign-in](https://www.paypal.cn/sign-in) 登录成功 ，点击首页顶部导航的下图

![](https://img-doc.16781678.xyz/uploads/2026-04-15/1776297150286-vfzgjo.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776307867289-cbzp1j.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776307882178-j1ya34.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776307957145-a2ynq3.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776308011828-i3cw2c.jpg)

将沙箱的API密钥、密钥分别配置到对应项目admin配置中，对一个项目路由：admin/settings/payment

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776317245542-cwy8w1.jpg)

注意下图中选择环境：沙箱

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776317222061-4a0pju.jpg)

然后保存。

## 设置webhook

[https://developer.paypal.com/dashboard/applications/live](https://developer.paypal.com/dashboard/applications/live)

![](https://img-doc.16781678.xyz/uploads/2026-04-15/1776296740633-e0com2.jpg)

拉到页面最底部，点击下图按钮

![](https://img-doc.16781678.xyz/uploads/2026-04-15/1776296713373-i7skh8.jpg)

Webhook URL 输入接收通知的地址。必须是可以公网访问的 https 地址。格式为：

```
https://{your-domain.com}/api/payment/notify/paypal

```

把 `{your-domain.com}` 替换为你的项目域名，可以是根域名，也可以是子域名。

Event types 点击 `All Events` 选择全部事件

![](https://img-doc.16781678.xyz/uploads/2026-04-15/1776296691561-qbzh5j.jpg)

填写完配置后，点击 Save 按钮。

![](https://img-doc.16781678.xyz/uploads/2026-04-15/1776296923618-cb77c9.jpg)

创建完支付通知地址后，复制下图中`Webhook ID`，这是支付通知的签名密钥。

![](https://img-doc.16781678.xyz/uploads/2026-04-15/1776296955664-nr8x1b.jpg)

### 配置支付通知签名密钥

在项目管理后台，进入`Settings -> Payment -> Paypal`面板，在 `Paypal Webhook ID` 字段填入上一步复制的支付通知签名密钥。

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776317325143-sbdek5.jpg)

## 使用沙箱测试支付

访问： [https://developer.paypal.com/dashboard/](https://developer.paypal.com/dashboard/) （如果需要登录就使用注册paypal.cn的邮箱密码登录下）

获取沙箱下的测试用户（注意：非商家测试账号）

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776306675216-rzagqt.jpg)

点击后

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776306718930-83vh7b.jpg)

然后访问你项目的前台项目支付，跳转到Paypal后登录下上图（邮箱和密码）

然后跳转到下图

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776306786680-z4jy73.jpg)

![](https://img-doc.16781678.xyz/uploads/2026-04-16/1776306845222-t2o1l7.jpg)

稍等片刻就支付成功了，到这里就是沙箱的支付测试闭环
