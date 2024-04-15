---
title: On creating a social network
date: 2021-03-08
tags: hide, project
style: color:teal;font-weight:bold
---
![Features-discourse chart](https://0xff.nu/i/socialfeatures.png)
## Preface
After stumbling upon [Subreply](https://subreply.com/discover) my interest was piqued - do we still have a place for "alternative" social networks? How hard is it creating such a social network? What are the considerations when creating such a piece of software?

The solution was "simple" - create a social network of my own and try to incorporate what I myself would like to see in such a network.

## Start
Now, I'm no stranger to PHP having created quite a few small [projects](/projects) until now, but this was totally different. Here I would have to create something that multiple people can use simultaneously at least in relative comfort and security. Prior to starting, I actually got in touch with [Lucian Marin](https://lucianmarin.com/) the creator of Subreply hoping to open a discourse and learn from his experience and ideas of creating a "different" social network, alas, he didn't seem interested in sharing his knowledge.

The first step was to *roughly* understand a bunch of *what*s:
1. What do I want to create?
2. What do I want it to look like?
3. What requirements does it have?

### The general guidelines
The point of this entire endeavour was not necessarily to come up with something revolutionary and never-before-seen, but rather to get some experience creating a piece of software of this complexity.

The main guidelines (I guess you can call them) or guiding principles of this project were:
- **Focus on discourse.** This was most likely *the* main point of this entire project. This means no images, no likes, shares or anything of that kind.
- Keep it simple code-wise. Simple code is easy to understand and maintain.
- Keep it simple feature-wise. It would be much more beneficial to create a handful of stable and useful features rather than a bunch of half-assed ones.

I took some inspiration from things of the past: forums, shoutboxes, IRC and so on.