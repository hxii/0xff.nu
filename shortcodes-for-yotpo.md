---
title: Shortcodes for Yotpo
tags: project
date: 2019-08-15
---
Want to use Yotpo widgets in page builders? Don't want to make changes to your templates?
Shortcodes for Yotpo exists for this sole purpose.

This plugin will allow you to use five shortcodes in all of your posts:

- `[yotpo_widget]` - Will output the main widget.
You can optionally add a `product_id` argument (e.g. `product_id="47"`) to show a widget for a specific product.
- `[yotpo_bottomline]` - Will output the bottomline widget.
You can optionally add a `product_id` argument (e.g. `product_id="47"`) to show a widget for a specific product. You can also use to `noempty` prevent empty ratings from showing up.
- `[yotpo_questions]` - Will output the Q&A bottomline widget.
You can optionally add a `product_id` argument (e.g. `product_id="47"`) to show a widget for a specific product.
- `[yotpo_product_gallery gallery_id="5bbb561f5ea79223a9da0e7c"]` - Will output the gallery with the chosen ID.
All customizations are done via your Yotpo account.
You can use an optional `noproduct` argument if the gallery is either not on a product page or you want to show a specific gallery on a product page.
- `[yotpo_product_reviews_carousel background_color="#22fff2" mode="most-recent" type="both" count="3"]` - Will output a reviews carousel. Take values from your Yotpo admin page.
Has a few optional arguments:
`product_id` - will show carousel for a product.
`review_ids` - if mode is set to manual, use this argument to provide review IDs, similar to what you get in your Yotpo admin (e.g. `review-ids="55359479,57352049,55789410,64472373"`)
`noproduct` - use this argument if you want to show a carousel that is not on a product page, otherwise product_id will be appended.
- `[yotpo_badge]` - Will output the badge graphic.
- `[yotpo_testimonials]` - Will output the standalone testimonials widget.
- `[yotpo_highlighs]` - Will output review highlights widget.
You can optionally add a `product_id` argument (e.g. `product_id="47"`) to show a widget for a specific product.

<a class="button" href="https://wordpress.org/plugins/shortcodes-for-yotpo/">Download from WP.org</a><a class="button" href="https://github.com/hxii/shortcodes-for-yotpo">See on Github</a>
