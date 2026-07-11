---
title: '自定义主题'
category: '定制化'
---

# 自定义主题

## [设置主题样式](#%E8%AE%BE%E7%BD%AE%E4%B8%BB%E9%A2%98%E6%A0%B7%E5%BC%8F)

在 [快速开始](https://shipany.ai/zh/docs/quick-start) 文档中，初始化项目并启动开发服务器，在浏览器打开预览地址，可以看到默认的主题页面。

![](data:,)

ShipAny 基于 [shadcn/ui](https://ui.shadcn.com/themes) 实现主题样式切换功能，你可以选择任何一个 shadcn 样式生成器来生成主题样式，自定义 `主题配色` 和 `字体效果`，让你的网站项目更加个性化。

推荐使用 [tweakcn](https://tweakcn.com/) 作为主题样式生成器。

1. 在 [tweakcn 样式设计面板](https://tweakcn.com/editor/theme?p=dashboard) 左上角切换预览，选择一套自己喜欢的主题样式。点击右上角的 `Code` 按钮，打开 `Theme Code` 面板。

![](data:,)

2. 在 `Theme Code` 面板，选择 `Tailwind v4` + `oklcn`，点击右侧的 `Copy` 按钮，复制主题样式代码。

![](data:,)

3. 将主题样式代码，粘贴到 ShipAny 项目的 `src/config/style/theme.css` 文件中，替换掉默认的样式代码。
4. 再次打开项目预览地址，可以看到新的样式效果。

![](data:,)

管理后台的主题样式也同步更新了。

![](data:,)

## [设置外观](#%E8%AE%BE%E7%BD%AE%E5%A4%96%E8%A7%82)

ShipAny 项目通过 `.env*` 文件中的 `NEXT_PUBLIC_APPEARANCE` 变量，控制项目默认显示的外观。此变量的默认值是 `system`，会根据用户电脑设置的系统主题自动切换 `light` 或 `dark` 模式。

如果你希望默认显示暗色主题，可以设置

```
NEXT_PUBLIC_APPEARANCE = "dark"
```

这样，用户初次访问你的网站时，看到的就是暗色主题了。

![](data:,)

## [设置主题文件夹](#%E8%AE%BE%E7%BD%AE%E4%B8%BB%E9%A2%98%E6%96%87%E4%BB%B6%E5%A4%B9)

ShipAny 支持多主题系统。基于此，你可以自定义自己的主题，实现更加个性化的页面效果。

默认的主题基于 [shadcn](https://ui.shadcn.com/) + [tailark](https://tailark.com/) 实现，对应的主题文件夹是 `src/themes/default`。

以 [ShipAny 官网](https://shipany.ai/) 为例，演示如何设置主题文件夹，实现自定义主题效果。

1. 先修改配置文件，启用自定义的主题

```
NEXT_PUBLIC_THEME = "shipany"
```

2. 创建主题文件夹

在 `src/themes` 文件夹，根据配置的自定义主题名称，创建主题文件夹。

比如，这里需要创建的主题文件夹是 `src/themes/shipany`

3. 实现主题内容

参考 `src/themes/default` 文件夹的主题文件内容，实现自定义的主题文件内容。

你无需完全复制默认的主题文件夹，只需在自定义主题文件夹中，创建跟默认主题文件夹同名的文件，即可实现对默认主题文件的增量覆盖。

自定义主题 `shipany` 的文件结构示例。

![](data:,)

4. 预览自定义主题

访问 [ShipAny 官网](https://shipany.ai/) ，可以看到自定义主题的效果。

light 模式：

![](data:,)

dark 模式：

![](data:,)

参考上述自定义主题的流程，你可以选择任意你喜欢的 UI 组件库，根据你的业务特点，定制自己的项目主题，让你的项目更加地高端大气。

流行的组件库推荐：

- [Shadcn UI](https://ui.shadcn.com/)
- [TailLark](https://tailark.com/hero-section)
- [ShadcnBlocks](https://www.shadcnblocks.com/)
- [Magic UI](https://magicui.design/)
- [Hero UI](https://www.heroui.com/)
- [Page UI](https://pageui.shipixen.com/)

[自定义页面展示

Previous Page](https://shipany.ai/zh/docs/customize/page)[自定义多语言

Next Page](https://shipany.ai/zh/docs/customize/locale)
