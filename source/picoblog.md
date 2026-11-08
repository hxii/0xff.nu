---
title: Picoblog
tags: microblog
type: project
date: 2020-10-02
description: Picoblog is a super simple frontend for a microblog (picoblog or twtxt format) with Markdown support
bucket: PHP
modified_timestamp: 2025-12-28T15:37:15+02:00
created_timestamp: 2025-04-14T17:13:49+03:00
---
I wrote briefly (or not so briefly) [about microblogging](https://0xff.nu/microblogging) just recently and while the microblog code will probably be added to Saisho, I've decided to also make it available as standalone as I realize not everyone might be using Saisho.


Picoblog is very very simple but it gets the job done.

Creating a microblog page is super simple:
```PHP
include_once 'picoblog.php';
$mb = new \hxii\PicoBlog('blog.txt');
echo $mb->renderEntries($mb->getEntries('all'));
```

This being said, please take a look at [`blog.php`](https://git.sr.ht/~hxii/picoblog/tree/master/blog.php) for a more complete usage example.

[Demo (in Saisho)](https://0xff.nu/microblog)

[Download from Sourcehut](https://git.sr.ht/~hxii/picoblog)

[Download from GitHub](https://github.com/hxii/picoblog)

[Bugs](https://todo.sr.ht/~hxii/picoblog)
