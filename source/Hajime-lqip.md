---
modified_timestamp: 2026-07-14T00:52:32+03:00
created_timestamp: 2026-04-02T13:51:10+03:00
type: project
tags:
  - draft
parent:
  - hajime
---
The idea to implement some kind of LQIP (Low Quality Image Placeholder) came about as part of working on supporting `type: image` posts on this here website.

I didn’t want to deal with generating thumbnails (though in retrospect this would’ve been a simpler approach) nor, of course, make you load the entire size of the image by just browsing the index.

I read about a similar, albeit much more fucking elaborate approach in a post titled [Image placeholders in pure CSS — or: Defying gods with math and color](https://frzi.medium.com/lqip-css-73dc6dda2529) .
And so, armed with the idea but having forgotten any and all details about the implementation – I’ve decided to roll my own.

## What I need it to do
As the general idea is to have an annual photo grid, where each (relatively) tiny square is an `image` entry that is processed by Hajime upon generation, it makes sense to generate the LQIP in the same pass.

Naturally, I prefer a process that is not too heavy or resource intensive, and that doesn’t require creating a bunch of extra static files.

> [!WARNING]
> The resource usage is TBD in a “yeah I take a photo every single day” (i.e full, 365 image gallery) scenario, but I don’t suspect it to be too resource intensive.

## How did I do it
The napkin math process I thought of looks like this:
%% Image from remarkable %%

Having cracked open the pillow docs
 I haven’t used Pillow much, but I knew that’s kinda what I have to go with.