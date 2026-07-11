---
name: backlink
description: SEO backlink submission and link-building playbook for Claude Code sessions that drive a browser (Playwright MCP, claude-in-chrome, or computer use) to register, fill forms, post comments, claim profiles, and submit SaaS directory listings at scale. Use when the task involves backlinks, external links, off-page SEO, outreach, WordPress comment posting, forum profile creation, SaaS directory submission, Dofollow / Nofollow auditing, anti-spam bypass (Akismet, Antispam Bee, WPantispam Protect, CleanTalk, hCaptcha, Jetpack), reverse-engineering a site's frontend to call its backend API directly, competitor backlink analysis, dead-site triage, or multi-site parallel submission.
---

# backlink

## Core Workflow

Every submission task follows the same nine steps. Do them in order, skip none.

1. Read `references/iron-rules.md` first. Ten rules, each breaks a link if violated. Every task, every time.
2. Confirm the **current target site's** brand name, homepage URL, and approved anchor-text whitelist before touching any form. Switching sites without re-confirming is how anchor text ends up pointing the wrong way (see iron rule 8).
3. Look up the target platform in `references/platforms.md`. If it's a WordPress comment target also read `references/wp-comments.md`; if it smells like a Dofollow candidate cross-check `references/dofollow-2026.md`; if it looks dead or CF-walled check `references/dead-sites.md`.
4. Open the target page with your browser tool and snapshot / read the DOM before typing anything. Verify the form still matches the reference notes — platforms mutate.
5. Execute the platform SOP: register / fill fields / post comment / create profile. Use real keyboard input (not JS `.value =`) when anti-spam is in play — see `references/anti-spam.md`.
6. After submission, **measure the `rel` attribute yourself**. Never trust a stored "Dofollow" label. Run in the browser console:
   ```js
   document.querySelectorAll('a[href*="YOUR_DOMAIN"]')
     .forEach(a => console.log(a.rel || 'EMPTY'))
   // EMPTY = Dofollow; contains "nofollow" / "ugc" / "sponsored" = not Dofollow
   ```
7. Record the result in whatever tracking system you use (DB row, spreadsheet, markdown log). Capture: final URL, rel, date, platform, anchor text used, and any gotcha hit.
8. Ping the search engine(s) you care about so the new page gets crawled. Don't rely on the host platform to ping for you.
9. If you discovered anything new — a new platform, a new anti-spam variant, a new dead site, a new reverse-engineering trick — append it to the correct reference file before ending the session. Knowledge that stays in one session dies in one session.

## Non-Negotiables

One-line summary of `references/iron-rules.md`. Read the full rules file before acting; this list exists only so the agent recognizes violations at a glance.

- **No shortcuts.** 800-word guest post, 20-field registration, email verification — do all of it. Only legitimate skip reasons: hard paywall, dead site, Cloudflare hard-block.
- **Frontend broken → reverse-engineer first.** A button that won't fire is an invitation to read `references/reverse-eng.md`, not a reason to mark the target skipped.
- **Filter candidates by spam flag + real traffic.** Domain Rating is a vanity metric; traffic is ground truth.
- **Deduplicate by domain, not by template ID.** One domain can appear under many templates.
- **To read email, open a new tab.** Never navigate away from a page that has an in-progress form.
- **Measure `rel` every single submission.** Stored labels lie.
- **Read references before querying the DB.** Known API snippets, hidden field names, and `rel` corrections already live in the knowledge base.
- **Re-confirm product identity on every site switch.** Mismatched anchors are unrecoverable.
- **Custom-domain email silently rejected → fall back to Gmail plus-addressing immediately.** Don't retry three times.
- **CAPTCHA collaboration rule: fill every other field first, then hand off.** See `references/anti-spam.md` for the protocol.

## Common Entry Points

- WordPress comment submission → `references/wp-comments.md`, then `references/anti-spam.md` to identify the plugin stack.
- New platform audit (never seen before) → `references/platforms.md` for type-based triage, then `references/reverse-eng.md` if the frontend fights back.
- Hunting Dofollow in 2026 → `references/dofollow-2026.md` for live categories and `references/platforms.md` for platform-specific steps.
- Competitor backlink reverse analysis → `references/strategies.md` ("精确 URL → 检查竞品评论存活" section).
- Forum profile work (phpBB, Discuz, Boardhost) → `references/platforms.md` forum section, cross-ref `references/dofollow-2026.md` for field-level Dofollow status.
- SaaS directory submission → `references/platforms.md` directory section, cross-ref `references/dofollow-2026.md`.
- Developer-blog posting (velog, dev.to, telegra.ph, rentry) → `references/dofollow-2026.md` class 1, cross-ref `references/accounts.md` for OAuth strategy.
- Account / email setup decisions → `references/accounts.md`.
- Package-manager Parasite SEO, satellite sites, Dev.to hub → `references/strategies.md`.
- Candidate triage, skipping dead or low-value targets → `references/dead-sites.md`.

## Verification Defaults

- **`rel` check (mandatory after every submission)** — the JS snippet in Core Workflow step 6. Anything other than `EMPTY`, `ugc` alone accepted by context, or the absence of `nofollow` must be logged as Nofollow.
- **Candidate traffic floor** — discard anything below ~100 organic monthly visits unless you have a strategic reason (e.g., brand-relevant niche forum). DR alone is not a defense.
- **Duplicate check by eTLD+1** — before working a candidate, confirm the domain isn't already in your tracking system. Same site under a different URL template still counts as duplicate.
- **Anchor text sanity** — before pressing submit, re-read the anchor and confirm it matches the **currently active** site's whitelist. Copy-paste from another tab is the most common source of cross-site anchor bleed.
- **Post-submit survival check for comment-type links** — revisit the target URL 24–72h later; if the comment was removed, mark the **article** (not the whole domain) as moderated and exclude it from the next round.

## Out of Scope

This skill documents methodology only. The following intentionally live **outside** this skill and must be supplied by the consuming project:

- Candidate database schema, candidate-filter SQL, and write-back SQL.
- Playwright MCP / claude-in-chrome instance wiring, `settings.json`, tmux layouts, or multi-instance orchestration scripts.
- Real account credentials, email addresses, proxy endpoints, Chrome profile paths.
- Any per-site anchor-text whitelist or brand fact sheet.

When a task needs one of the above, expect the calling session to provide it (project config, environment, or user message). Do not fabricate values.
