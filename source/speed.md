---
title: Pursuing Speed
date: 2020-07-20
tags: webperf,rant
bucket: Web
modified_timestamp: 2025-12-28T15:39:27+02:00
created_timestamp: 2025-04-14T17:13:49+03:00
group: web-optimization
---
Continuing my rambling about [pursuing minimalism](https://0xff.nu/pursuing-minimalism), I'd like to also say a few words about speed having "finished" rewriting my own website engine, once again.

Minimalism and speed (at least when it comes to the web) became a sort of obsession of mine, and I always (try to) stay up to date about any new developments in web development, optimization, caching and other ways of improving speed.

Sure, WordPress can be made fast-er ([leaving](https://darryldias.me/2015/lightweight-wordpress-setup/) [ironic](https://copyblogger.com/make-wordpress-faster/) [snake](https://www.sparringmind.com/speed-up-wordpress/) [oil](https://www.collectiveray.com/speed-up-wordpress) [aside](https://websitesetup.org/how-to-speed-up-wordpress/)), but once your base is bloated[^1] you will never stop optimizing the behemoth by either removing built-in functionality[^2], installing more plugins e.g. cache, finding clean themes or a combination of the above.

Why, then, not start from a clean base? That is exactly why more and more people nowadays are turning to WordPress alternatives such as [Bludit](https://www.bludit.com/), [Ghost](https://ghost.org/), [Statamic](https://statamic.com/) and others as well as static website builders such as [11ty](https://www.11ty.dev/), [Hugo](https://gohugo.io/) and [Gatsby](https://www.gatsbyjs.org/) in which it is easier to control what is being loaded and served.

You can of course take it one step further, if you're really inclined towards speed and controlling your own data and delivery. More on this later.

## State of the web

The thing is, there is, in my opinion a general disregard towards website sizes and loading speeds: huge fucking CSS frameworks, unoptimized images, unnecessary JS libraries and the list goes on.

I recently found instant.page[^3] and was immediately interested in the type of websites that might be using it.

[Here](https://resume.benc.io/) we have someone's resume that is just one page, but it loads 7 JS files, 1.7kb of CSS and 30kb of fonts. All for **one page**, to a total of 100kb. At least the damn SVGs are inline instead of loading fucking FontAwesome.

Or [this](https://onemin-impact.github.io/) placeholder for someone's blog. How bad is it, you ask? 288kb transferred with no meaningful information presented.

![288kb for this? Really?](https://0xff.nu/i/Unlined-15763c51861e33b5.png "288kb for this? Really?")

Things are bad, but they don't have to be, as soon as people start caring without just throwing a bunch of shit together and calling it a website.

## What did I do?

**Preface**: What I did was, in a sense, take things to the extreme. I do not think or am saying this level of minimalism is good for *everyone*, but you can take inspiration and ideas from what I did and implement them in your platform of choice.

1. The base - Instead of using a ready and working platform I decided to write [my own](https://paulglushak.com/saisho). This allows me to control **everything** without relying on third parties when it comes to features.
   CSS was written by hand and only the necessary blocks are present.
   This may not be for everyone, as for better or worse, making it work is up to you (so is security).
2. The bloat - There is none. I am using nothing and loading nothing besides the necessities and the page content. No CSS frameworks, no JS libraries (sans instant.page[^3]). Nothing.
3. The speed - A couple of speed optimizations were done. Some of them may be placebo.
   - nginx serves everything with Brotli compression enabled.
   - Pages are processed with PHP and the output buffer response is cached as HTML for 3600 seconds.
   - Pages are cached in browser using:
     `header('cache-control:public, max-age='.CACHE_TIME.', immutable');`
     Memcached was also considered.
   - Last Modified header is also sent:
     `header('Last-Modified:' . gmdate('D, d M Y H:i:s ', @filemtime($filePath)) . 'GMT');`
   - Links are prefetched once hovered using [instant.page](https://github.com/instantpage/instant.page).
   - Images are optimized, dithered and stored locally.

All these allow pages on Saisho[^4] to be loaded almost instantaneously, something I am really proud of.

## What can you do?

Start caring.

What you do from there is up to you - optimize WordPress to no end, use static website generators, write your custom engine, write static HTML websites or whatever else works for you.

But care about what you're doing and take into account the people who will be visiting your website and their time.

[^1]: Rightfully so as WordPress is a platform, not a tailor-made solution, but more often than not it's overkill for the average folk.
[^2]: Functionality here is debatable. jQuery for example is loaded [all the time](https://wordpress.stackexchange.com/a/91734).
[^3]: instant.page: https://github.com/instantpage/instant.page
[^4]: [Saisho](https://paulglushak.com/saisho) is my semi-static website engine which you are seeing now.

*[SVG]: Scalable Vector Graphics

*[CSS]: Cascading Style Sheets

*[HTML]: HyperText Markup Language
