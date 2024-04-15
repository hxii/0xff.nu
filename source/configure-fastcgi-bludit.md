---
title: Configure FastCGI Cache for Bludit
tags: bludit,guide
date: 2019-12-10
---
Following my [FastCGI Cache Purge plugin for Bludit](https://paulglushak.com/fastcgi-purge-for-bludit), I've been asked how FastCGI cache is even configured for Bludit. 

This is **not** a beginner guide, so I assume you have nginx installed together with the `ngx_cache_purge` module. If you don't, there are a few guides online how to build nginx from source with the module [like this](https://www.digitalberg.com/WiKi/how-to-compile-nginx-plus-ngx_cache_purge-for-wordpress-on-ubuntu-centos/). Generally configuring FastCGI cache also [shouldn't be a problem](https://www.digitalocean.com/community/tutorials/how-to-setup-fastcgi-caching-with-nginx-on-your-vps).
 
The gist is to:

- Configure a cache zone.
- Configure Bludit specifics and
- Configure purge location.

## Bludit Specifics
Since there are things we don't want to cache, they need to be configured. I used the following settings:
```
# This will prevent caching anything in the admin and any POST requests.
if ($request_uri ~* "/admin/|/bl-kernel/") {
  set $skip_cache 1;
}
if ($request_method = POST) {
  set $skip_cache 1;
}
# This will allow to use the purging plugin. Note that you need to replace YOURZONE with what you set up for FastCGI cache. 
location ~ /purge(/.*) {
  allow your.server.ip.address;
	deny all;
  fastcgi_cache_purge YOURZONE "$scheme$request_method$host$1";
  access_log off;
}
# My website rarely changes, so all pages are cached for 48 hours.
location ~ \.php$ {
...
  fastcgi_cache_bypass $skip_cache;
  fastcgi_no_cache $skip_cache;
  fastcgi_cache YOURZONE;
  fastcgi_cache_valid 200 302 48h;
  fastcgi_cache_valid 404 1m;
}
# Unrelated to fastcgi cache, but if we're already modifying configs...
location ~*  \.(jpg|jpeg|png|gif|ico|css|js)$ {
  expires 7d;
}
location ~ /wp\S* {
  deny all;
  access_log off;
}
```
## What do we gain?
![With FastCGI Cache](https://paulglushak.com/bl-content/uploads/pages/autosave-dbd663bd232e9dd5c26c9aaa009405fb/ScreenShot2019-12-11at12.04.27PM.png)<span class="caption">Fig.1 With FastCGI Cache</span>

![Without FastCGI Cache](https://paulglushak.com/bl-content/uploads/pages/autosave-dbd663bd232e9dd5c26c9aaa009405fb/ScreenShot2019-12-11at12.08.18PM.png)<span class="caption">Fig.2 Without FastCGI Cache</span>

