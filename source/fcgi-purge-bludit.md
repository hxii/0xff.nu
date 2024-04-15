---
title: FastCGI Purge for Bludit
date: 2019-12-06
tags: project, bludit
---
This plugin uses `ngx_cache_purge` to purge cached pages by **GET**ting the modified/deleted post using the given format.

This is, again, something I needed and couldn't find.
The solution? a can of beer and an hour of work.

Now you can purge the modified page, the associated tags and category as well as the index page if enabled.

<a class="button" href="https://github.com/hxii/bludit_fcgi_purge">Available on GitHub</a>

![FastCGI Purge for Bludit](https://paulglushak.com/bl-content/uploads/pages/b69c5ac9e885f7b96700e7177e6e4cac/ScreenShot2019-12-06at12.08.37AM(2).png)
