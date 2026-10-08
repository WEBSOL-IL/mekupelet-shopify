# Hyper core-file customizations

Every edit to a Hyper core file is wrapped in `MK-CUSTOM start` / `MK-CUSTOM end`
comments and logged here. Carry these over manually on every Hyper update.

| Date | File | Reason | Notes |
|---|---|---|---|
| 2026-10-08 | `layout/theme.liquid` | Load `snippets/mk-fonts.liquid` (self-hosted Simpler Pro) and `assets/mk-custom.css` after Hyper's stylesheets | 4 lines between `MK-CUSTOM start/end` right after the `rtl.css` liquid block in `<head>`. On a Hyper update: re-insert the same block. |

| 2026-10-08 | `snippets/facets.liquid` | Render `mk-subcategories` (sub-category links box from `collection.metafields.custom.children`) above the filter groups, sidebar and drawer alike | 5 lines between `MK-CUSTOM start/end` comments right after the facet `<form>` opens. On a Hyper update: re-insert before `{% if results.filters != empty %}`. |
| 2026-10-08 | `sections/breadcrumbs.liquid` | Collection branch: walk `custom.parent_handle` (up to 3 levels) and print the parent trail instead of the "Collections" link; falls back to Hyper's link when the collection has no parent | Block between `MK-CUSTOM start/end` inside the `elsif template contains 'collection'` branch. |
| 2026-10-08 | `snippets/product-collapsible-tab.liquid` | Render a collapsible tab only when its content or page is set, so metafield-driven accordions (מדד התפתחות, מתאים לגיל, מפתח מיומנויות, פרטים נוספים) disappear on products without values | `{%- if block.settings.content != blank or block.settings.page != blank -%}` around the `<details>`, between `MK-CUSTOM start/end`. |
