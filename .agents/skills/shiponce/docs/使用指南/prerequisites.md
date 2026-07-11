---
title: '前置要求'
category: '使用指南'
---

# 前置要求

为确保你能顺利使用 ShipAny 开发项目，请确保完成以下前置要求。

## [网络环境畅通](#%E7%BD%91%E7%BB%9C%E7%8E%AF%E5%A2%83%E7%95%85%E9%80%9A)

请确保你的网络环境可以正常访问 [Github](https://github.com/)、[Google](https://www.google.com/) 等第三方服务。

可以在终端执行以下命令，查看你的网络出口 ip：

```
curl https://ipinfo.io
```

通过以下命令测试网络连通性：

```
curl https://google.com
```

如果网络环境不佳，可能会导致无法正常安装项目必须的 `npm` 依赖，无法连接云数据库、无法使用 AI 生成图片等功能。

## [搭建本地开发环境](#%E6%90%AD%E5%BB%BA%E6%9C%AC%E5%9C%B0%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83)

请根据你的操作系统，搭建本地开发环境，安装必要的开发工具。以 `Mac OS` 为例：

1. 安装 [fnm](https://github.com/Schniz/fnm) 进行 NodeJS 版本管理

推荐使用以下或更高版本的 `NodeJS` 和 `npm`：

```
$ node -v
v22.2.0

$ npm -v
10.7.0
```

2. 安装 [pnpm](https://pnpm.io/installation) 进行包管理

全局安装 `pnpm`：

```
$ npm install -g pnpm
```

推荐使用以下或更高版本的 `pnpm`：

```
$ pnpm -v
9.15.0
```

3. 安装 [git](https://git-scm.com/downloads) 进行版本管理

推荐使用以下或更高版本的 `git`：

```
$ git --version
git version 2.39.3 (Apple Git-146)
```

4. 配置 [ssh key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)，确保能访问你的 Github 仓库

```
$ ssh -T git@github.com
```

## [AI 辅助编程工具](#ai-%E8%BE%85%E5%8A%A9%E7%BC%96%E7%A8%8B%E5%B7%A5%E5%85%B7)

为了更好地理解 ShipAny 框架，更高效地开发项目，推荐使用以下 AI 工具辅助开发

|                  |     |     |     |     |     |     |     |     |     |
| ---------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ------------------------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---------------------------------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --------------------------------------------------------------------------- | --- | --- | --- | --- | --- | --- | ---------------------------------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Name Description |     |     |     |     |     |     |     |     |     | --- | --- | --- | --- | --- | --- | --- | --- |     | [Cursor](https://www.cursor.com/) AI 编辑器 |     |     |     |     |     |     |     | --- | --- | --- | --- | --- | --- |     | [Antigravity](https://antigravity.google/) AI 编辑器 |     |     |     |     |     | --- | --- | --- | --- |     | [Claude Code](https://www.claude.com/product/claude-code) AI 编程命令行工具 |     |     |     | --- | --- |     | [CodeX](https://openai.com/codex/) AI 编程命令行工具 |     |     |     |     |     |     |     |     |     |

在 AI 编辑器中安装以下插件，可以更好地辅助开发：

- [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) 接口调试
- [Prettier - Code formatter](https://marketplace.cursorapi.com/items?itemName=esbenp.prettier-vscode) 代码格式化

## [其他工具](#%E5%85%B6%E4%BB%96%E5%B7%A5%E5%85%B7)

- [使用 Nano Banana Pro 生成图片](https://aistudio.google.com/prompts/new_chat?model=models%2Fgemini-3-pro-image-preview)
- [使用 v0 生成 UI 组件](https://v0.dev/)

[系统架构

Previous Page](https://shipany.ai/zh/docs/guide/architecture)[视频教程

Next Page](https://shipany.ai/zh/docs/guide/tutorial)
