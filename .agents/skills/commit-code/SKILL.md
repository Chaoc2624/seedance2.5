---
name: commit-code
description: Inspect, validate, commit, and optionally push git repository changes with detailed Chinese Conventional Commit messages. Use whenever the user asks to commit code, 提交代码, 提交全部, create a commit, commit all changes, 提交并推送, 提交到 GitHub, push, or otherwise wants pending repository changes committed or published.
---

# Commit Code

Use this workflow when the user wants repository changes committed. Push only when the user explicitly asks to push or publish the commit.

## Workflow

1. Verify repository context:
   - Run `git rev-parse --is-inside-work-tree`.
   - Run `git status --short --branch`.
   - Run `git branch --show-current`.
   - Run `git remote -v`.

2. Inspect all pending work before staging:
   - Run `git diff --stat` and `git diff`.
   - If anything is staged, also run `git diff --cached --stat` and `git diff --cached`.
   - Review untracked files from `git status --short`.
   - Read changed or untracked files when the diff is too large or unclear.

3. Decide the commit scope:
   - If the user says "全部", "all", "提交全部", or all visible changes clearly belong together, stage all visible changes with `git add -A`.
   - If unrelated or risky changes are present and the user did not explicitly ask for all changes, stage only the relevant paths and mention the excluded paths.
   - If the intended scope is ambiguous, ask before committing.
   - Never discard, reset, overwrite, amend, rebase, force-push, or otherwise rewrite history unless the user explicitly asks.

4. Validate before committing:
   - Run the repository's required checks before committing.
   - Read current workspace instructions such as `AGENTS.md`, `CLAUDE.md`, `package.json`, `Makefile`, task files, or repo docs to discover required commit gates.
   - If workspace instructions require specific checks, run those exact commands before committing.
   - For staged files outside the default formatter or linter scope, also run targeted checks on those paths when applicable.
   - If validation fails because of the current work, fix the issue and rerun the relevant checks.
   - If validation is blocked by unrelated existing issues, record the exact blocker and run narrower checks for the staged files when possible.

5. Write a Chinese Conventional Commit message:
   - Subject format: `<type>: <中文整体摘要>`.
   - Choose `type` from `feat`, `fix`, `build`, `chore`, `docs`, `refactor`, `style`, `test`, `perf`, `ci`, or `revert`, unless the current repository explicitly defines a different allowed set.
   - Use `feat` for new user-visible behavior, `fix` for bug fixes, `build` for build/dependency/tooling changes, `chore` for maintenance, `docs` for documentation or instruction-only changes, `refactor` for behavior-preserving code changes, `style` for formatting-only changes, `test` for tests, `perf` for performance improvements, `ci` for CI changes, and `revert` for reverting a previous commit.
   - The subject must describe the whole staged change set, not just one file.
   - Add a body when multiple files or logical areas changed.
   - For detailed commits, add one unordered-list item per committed file or logical file group.
   - Each body item must start with the exact file path, followed by a Chinese explanation of what changed or what that file is used for.

Example:

```text
fix: 优化生成记录预览和按钮交互

- src/components/features/ai-generator/create-workspace.tsx：重构生成记录列表，新增筛选、收藏、媒体操作和预览弹窗，并修正弹窗尺寸。
- src/config/style/global.css：新增全局按钮点击高亮抑制规则，取消按钮 ring、outline 和 tap highlight。
- content/dev-mocks/image-generation.json：新增本地 AI 生成 mock fixture，供开发环境复现图片生成历史。
```

6. Stage and commit:
   - Run `git add -A` for full-scope commits, or `git add <paths>` for selected-scope commits.
   - Run `git diff --cached --stat` and inspect the staged summary.
   - Commit with `git commit -m "<subject>"`, adding `-m "<body item>"` arguments for detailed body items when useful.
   - Use single quotes around shell arguments if paths include `$`, braces, or other shell-sensitive characters.
   - If there are no staged changes, do not create an empty commit unless the user explicitly requested it.

7. Push only when requested:
   - If the user only asked to commit, do not push.
   - If the branch already has an upstream, run `git push`.
   - If there is no upstream but `origin` exists, run `git push -u origin <current-branch>`.
   - If there is no remote or authentication fails, stop and report the exact blocker.

8. Final response:
   - Reply in Chinese.
   - Include the commit hash, branch name, and whether the commit was pushed.
   - Include the push target when pushed.
   - Include validation commands and pass/fail status.
   - Mention any files intentionally left uncommitted.
   - If push was not requested, explicitly say the commit was not pushed.
