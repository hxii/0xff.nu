---
title: Why saisho?🤔
date: 2020-05-23
tags: project,update
bucket: Rant
modified_timestamp: 2025-12-28T17:20:27+02:00
created_timestamp: 2025-04-14T17:13:49+03:00
---
Why did I make *Saisho*? To be honest with you, I didn't think I was going to use it. In a sense, at least that's what I thought initially, *Saisho* was **too** minimal.

I wasn't sure I was ready to give up on a GUI to edit the content of my blog/website/whatever. It's comfortable.

Thing is, we humans have a very good ability - we adapt. Saisho was a challenge to myself - get out of this comfort zone and create something that, I myself, will use. Bonus points if others will too.

The starting point was perfection[^1] to which I will only add the things that matter, no bells, no whistles.

I believe I have managed to achieve that (albeit with messy code) - *Saisho* takes MD files (with some extra metadata[^2]), parses them and saves a cached HTML file to be served. Now there's also an RSS feed thrown in.

That's it.

And while my code is a mess and template support could be done much better, I don't think *Saisho* **needs** any extra features besides this.

Features are there to answer a need or solve a problem. If a feature does neither, we don't really need it.

[^1]: “Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.” -- Antoine de Saint-Exupéry, Airman's Odyssey
[^2]: The basics are title, date and description but Saisho will parse any `[[metadata]]`.

*[MD]: MarkDown
*[HTML]: HyperText Markup Language
*[RSS]: Rich Site Summary
