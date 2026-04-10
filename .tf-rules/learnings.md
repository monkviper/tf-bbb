## Consolidated

## Recent
[chat] spacing-style requires BOTH the CSS class AND {% render 'spacing-style', settings: section.settings %} in the inline style attribute — the class alone does nothing
[chat] Section width options use t:options.page and t:options.full — NOT t:options.page_width / t:options.full_width
[chat] Always verify every t: translation key against locales/en.default.schema.json before using — keys under "names" vs "settings" vs "options" are different namespaces
[chat] When implementing a shared pattern (spacing-style, color scheme, etc.), grep an existing section to see the full implementation — don't guess from the class name alone
[chat] section--page-width requires the base 'section' class — .section sets up the 3-column CSS grid, .section--page-width places children in center column. Without 'section', page-width does nothing.
