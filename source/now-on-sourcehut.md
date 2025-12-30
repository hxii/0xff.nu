---
date: 2024-04-15
title: New Home on SourceHut
tags: update
bucket: Update
modified_timestamp: 2025-12-28T15:36:38+02:00
created_timestamp: 2025-04-14T17:13:49+03:00
---
For the longest time, my blog was self-hosted on a Vultr.com server using [[saisho]].

I decided to freshen things up a bit, by finishing what I started with [Saisho-PY](https://git.sr.ht/~hxii/saisho-py) (temporary name. I think we need something new!) and moving to a CI/CD (or is it just CD?) workflow on [Sourcehut](https://sr.ht/).

Now, instead of pushing MD files by SSH to my host (yeah yeah, this could've been simpler, I know. Sue me.), I push changes to a repository which runs a build with the new Python iteration of Saisho, which creates the static pages and uploads them! Nice!

A full write-up regarding the new engine is pending.
