# Hyper core-file customizations

Every edit to a Hyper core file is wrapped in `MK-CUSTOM start` / `MK-CUSTOM end`
comments and logged here. Carry these over manually on every Hyper update.

| Date | File | Reason | Notes |
|---|---|---|---|
| 2026-10-08 | `layout/theme.liquid` | Load `snippets/mk-fonts.liquid` (self-hosted Simpler Pro) and `assets/mk-custom.css` after Hyper's stylesheets | 4 lines between `MK-CUSTOM start/end` right after the `rtl.css` liquid block in `<head>`. On a Hyper update: re-insert the same block. |
