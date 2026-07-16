# Issue Ledger Format

Default root:

```text
tmp/seo-issues/<YYYY-MM-DD>/
```

One file per **issue type** (not per URL). Re-runs update the same slug file:
append new URLs, de-dupe, refresh evidence if worse.

## Filename

- Lowercase slug from the issue title
- Spaces → hyphens; keep `[a-z0-9-]` only
- Examples:
  - `missing-meta-description.md`
  - `hreflang-invents-missing-locale.md`
  - `ssr-missing-canonical.md`
  - `thin-non-en-body.md`

## Template

````markdown
# <Issue title>

- **严重级别**: 错误 | 警告 | 提示
- **规则**: seo-operating-standard § … / checklist <ID>
- **状态**: open | partial | resolved

## 摘要

<One or two sentences: what is wrong and why it hurts indexability or quality.>

## 受影响页面

- https://example.com/path-a
- https://example.com/de/path-a

## 证据

- HTTP: <status, final URL if redirected>
- Snippet or observation:
  ```html
  <!-- short relevant head/body excerpt -->
  ```
````

## 修复建议

1. <Shared root cause / code boundary>
2. <Concrete change>
3. <Re-check command or URL>

## 代码边界（ShipOnce）

- Routes / loaders:
- Locale / content:
- Head / SEO helper:
- Sitemap / robots / llms:

```

## Merge rules

1. If the file exists, read it first.
2. Add new affected URLs only if not already listed.
3. Keep the highest severity seen for that issue type.
4. When all URLs are fixed, set **状态** to `resolved` and leave a one-line note
   with the fix date — do not delete history unless the user asks.
5. Do not mix unrelated defects into one file (e.g. missing description ≠ thin body).

## Session summary (to user)

After the audit (and optional fix loop), report:

- Origin + mode + URL count
- New vs updated issue files
- Counts by 错误 / 警告 / 提示
- Top P0 root causes and suggested code boundaries
```
