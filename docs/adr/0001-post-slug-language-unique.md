# Post identity is (slug, language)

Public blog posts are localized per site locale. Readers on `/de/blog` should only see German rows, and a German post may share the same public slug as its English sibling (for example `/blog/seedance-2-0-fast-vs-mini`).

We dropped the global unique constraint on `post.slug` and replaced it with a composite unique index on `(slug, language)`. Locale-suffixed slugs were rejected because they break shared URLs and hreflang-style linking. The admin and seed paths now treat "same slug, different language" as separate publishable articles.
