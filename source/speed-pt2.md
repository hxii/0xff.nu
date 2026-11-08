---
title: Pursuing Speed, Pt. 2
date: 2020-07-23
tags: webperf,rant
bucket: Web
group: web-optimization
modified_timestamp: 2025-12-28T15:39:02+02:00
created_timestamp: 2025-04-14T17:13:49+03:00
---
>*Note*: Nothing in this article/rant is meant to offend anyone. If your wesbite is used as an example know that I don't think you're bad at what you do or have anything against you.
>This is my opinion, and you're welcome to disagree with it. Don't advocate over-engineering without a purpose and don't spread bad advice.

In my previous entry, [Pursuing Speed](/speed), I feel like even though I got my point across (I'd like to believe I did) I didn't articulate my thoughts in a sufficient manner.
In this addendum, I'd like to further elaborate about the state of the web.

In today's world -- a world of abundance and plenty, it's easy to get lost in the plethora of available resources and fast connections and become lazy and dependent on these resources, all while forgetting your craft and why is it you started doing whatever it is you're doing in the first place.

People like Colby Fayock saying [you're allowed to over-engineer your blog](https://www.colbyfayock.com/2020/07/youre-allowed-to-overengineer-your-blog/) couldn't be more wrong (at least in the current phrasing), basically saying you can just do what-fucking-ever because it's educational for YOU.
While yes, you can use React, jQuery and whatever fucking library you wish to hone YOUR skills, dumping all these overkill libraries, frameworks, trackers and huge fucking images on your visitors is NOT okay.

## What the fuck is accessibility, even?
What people like Colby Fayock are saying, is that websites like [this](https://merichard123.github.io/) are okay. That it is, in essence, okay to force your visitors to load 1.6Mb of resources just to show them 1084b (yes, bytes) of relevant information (on the front page). That's 0.06%.

![Holy fucking unreadable font, Batman!](https://0xff.nu/i/Tubby-ae0ddc24569cabab.png)

Somehow loading FontAwesome Brands font, an image with no added value and honestly an unreadable Google Font is more fucking important than adding a dark theme to your website, properly designing for mobile, or, you know, if you **truly** want to be hip, fucking researching about [Network Information API](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API).

## Glorious overkill
Broken HTTPS cert aside, websites like [this](https://cs.ambadiritik.tech/) are completely fucking useless if you can't (or don't want to) load JavaScript. So you know what? Fine, let's load JS.
What did we get? We're loading 256kb for this much fucking content:
![Image showing disproportionate content to page size](https://0xff.nu/i/Cold-2a380d37a67d0e9c.png)
Fucking great. 622b of mostly irrelevant data. **That's 0.24% of what you're actually fucking loading.**
But hey, having a fucking shiny React website is more important, right? For personal development, yeah?

## I can't even
As a last example, we have people like Miranda Limonczenko who preach about [Clean Code](https://dev.to/mlimonczenko/why-clean-code-is-still-a-classic-3n3a) who's website is, ready for it? **8 point fucking 3 megabytes large**.
That's for the front fucking page. The **entirety** of Shakespeare's works only occupy about 5.6mb.

![20 seconds to load on Fast 3G](https://0xff.nu/i/Real-d9294c8a9bce95b1.png)

I'm not even going to talk about the fact SquareSpace is being used here. Or that it's ridden with trackers. Or that it would take me fucking 18 seconds to load this monstrosity with a Fast 3G connection just to see promotional garbage on the front page.

## Over-engineering
Go on, listen to people like Colby, over-engineer ahead, shove 10 frameworks, 5 million libraries and all the fucking tracking scripts you want - at **your own** expense.
Your visitors are **not** your testing group. Their time is not free and nor is their data plan.
