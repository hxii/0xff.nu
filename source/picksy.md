---
title: Picksy
date: 2022-06-23
tags:
  - showcase
type: project
description: Python menu picker with filtering
modified_timestamp: 2025-05-25T22:55:42+03:00
created_timestamp: 2025-04-14T17:13:49+03:00
---
# Picksy
## Preface
Seeing as I have not written anything for a little while, a preface, if you will.
Just before 2021 ended, I quit my job as I was unsatisfied with not being able to learn and develop myself. Being stagnant makes me just not enjoy what I do and takes me to dark places, so I prefer to avoid this situation.

In December 2021 I've joined my new employer, Forter, as a tech support specialist, which, at least as far as the title denotes is about the same thing I've been doing up until now. Even the pay is virtually the same.
So why have I decided to go through this turmoil you ask? Even before I joined, during the interviews, it was made clear to me that the title is one thing, but what I will be able to do and learn in the process is another thing. Basically mkaing up the position as I go type of deal. Great!

Fast forward about half a year, I've managed to learn a bit about Python to not feel completely lost when I'm looking at code.
As a way to improve my skills and knowledge I've decided to make some things that I would make public for all the world to see - [VNU](https://github.com/hxii/vnu) and now Picksy.

## What is it?
As part of a different project I am working on, I've coded a simple choice menu (yes, instead of using something off the internet) in Python. While usable, I immediately thought it could be even better if I had the ability to filter the results.
A quick search on PyPI and GitHub later I wasn't able to find something that offers this functionality, so I did what anyone would do - make my own!

So Picksy is just that - a picker menu with the ability to filter items. Nothing more, nothing less.

[Demo on Asciinema](https://asciinema.org/a/0BSnVqQ5atUZ5RWP53KRJJhCC)

## The Deets
- The implementation is done via `curses`. I'm not sure yet what I think of curses :D
- Picksy accepts a dictionary where the key is the ID and the value is the text shown, e.g:
  ```
{
  "item1": "First Item",
  "item2": "Second Item"
  ...
}
  ```
- Picksy will also accept a list for the options which will be transformed into a dictionary.
- **Not Implemented, but remains a possibility**: Multi choice.

[Get it on GitHub](https://github.com/hxii/picksy) or [Get it on PyPI](https://pypi.org/project/picksy/)
