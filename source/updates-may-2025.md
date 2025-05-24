---
title: Boku Update, May 2025
date: 2025-05-21
tags:
  - update
  - project
modified_timestamp: 2025-05-24T20:35:05+03:00
created_timestamp: 2025-05-21T20:06:11+03:00
---
The past three months felt very hectic for me, and at times it felt as if I was losing any sliver of control over things that I, personally, wanted to accomplish. Driven by work, fatherhood and sense of impending ~~doom~~ move (which, thank fuck, is now behind us... almost. Fucking never-ending boxes!), the mental capacity that I could devote towards self-expression and creation just.. wasn't there. Yet, as we do, I persevered and managed to get some important fixes out for [[Hajime]] as well as the star of this post - [[Boku.]].

While writing this update I have realized that I initially started working on [[Boku]] on and off _just_ over a year ago on May 14th 2024. If I was a professional developer, or at least better at managing my own time, I'm fairly sure that the result of a (gross) year worth of work would've been better. But..
![[Pasted image 20250524142226.png]]

## Boku

The goal was, and remains to create a tool that is **personal** and is a comfortable stop-gap solution to, perhaps, a very small problem, not necessarily something that is feature complete and that can provide a worthy alternative to the hundreds of better tools out there, and so, even though `boku` can't do everything, I am proud of what I managed to accomplish, because being able to do

```
tasks:
	get_os:
		run: uname -s
		save_output: os
	ensure_brew:
		run: command -v brew
	install_brewfile:
		depends_on: ensure_brew
		run: brew bundle install --file ${os}Brewfile
		on_failure: echo "Brew has to be installed!"
```

(for example) to install an OS dependent `Brewfile` from my dotfiles feels... great.

Boku version 0.2.3 is available on [SourceHut](https://git.sr.ht/~hxii/boku/refs/0.2.3).

> [!IMPORTANT]
> - I haven't fully figured out how to work with artifacts and releases on SourceHut. 
> - The documentation is not as full as it should be, but I'm working on it.

## TRMNL

As I'm writing this update, my [TRMNL](https://usetrmnl.com/) is just around the corner, waiting to be delivered. Once I have it, I believe the quality and quantity of plugins I make for it will increase.
That being said, while waiting for my device to arrive I wrote a [Today's Mealie Plan](https://usetrmnl.com/recipes/34578/install) and [Miniflux Feed](https://usetrmnl.com/recipes/33478/install) plugins.
[[Dengonban]] is still not ready though.
## Life

- We're having another child on the way! This is sure going to be interesting.
- After 7 years of staying in the same apartment, we've finally decided it's time to move to a bigger place. This was physically demanding, even though we've paid a moving company to move 80% of the stuff.
  But you know what they say about the 80-20 rule, right?
- Since we've moved, the new place (1 month in) still looks like a warzone as we've yet to figure out where everything needs to go.