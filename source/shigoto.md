---
title: Shigoto
tags: project, personal development
type: project
description: Todo.txt parser and manager
date: 2020-05-30
bucket: PHP
modified_timestamp: 2025-12-28T17:30:26+02:00
created_timestamp: 2025-04-14T17:13:49+03:00
group: experiments
---
![Shigoto Logo](https://paulglushak.com/flag-shigoto.png)

*Shigoto* is a minimalistic [todo.txt](http://todotxt.org/) parser and manager. It was created as a personal tool to try and get used to organizing tasks properly in a bloat-free manner.

## What it doesn't have
- Sorting is currently broken.
- Code is most likely not optimized.
- Not ready for mobile yet.
- **Something else? [let me know](https://todo.sr.ht/~hxii/shigoto)!**

## What it has
- Reads and parses todo.txt.
- Filtering based on project, context and priority.
- Archiving (done.txt) and marking as done.
- Password protected. (TBD)

## Usage
1. Set hashed password in `config.php` using ~~BCrypt~~ argon2id (HMAC of password with pepper set in `pep.php`; see below).
2. Copy and paste your `todo.txt` file in the same folder as Shigoto. (if you don't have one, an empty file will be created)
3. Added September 15th, 2020: create a file called `pep.php` where you will store your password pepper (or change the file and it's location in `login.php:5`) that looks like this:

```PHP
<?php

defined('SHIGOTO') or die();

return 'your-sha256-pepper-here';
```

## Notes
- This was created as a personal project, so basically everything is an afterthought.
- This is supposed to be minimalistic, but I tried covering the basics. If you think something basic is missing, let me know!
- This code in this project is far from ideal, but I'm getting better.

## Download
Get it on [Sourcehut](https://git.sr.ht/~hxii/shigoto) or [GitHub](https://github.com/hxii/shigoto).

Like it? Consider a small **[donation](https://ko-fi.com/hxii_)**, it's very much appreciated!
