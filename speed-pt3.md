---
title: Pursuing Speed, Pt. 3
date: 2020-08-12
tags: webperf,rant
---
>This entry (and collection of links) is a continuation of [Pursuing Speed, Pt. 2](https://0xff.nu/speed-pt2) which you can read for context.
>
>You are more than welcome to share the link to this with your friends and colleagues.
> If you'd like to contribute relevant points of interesting links or resources, please contact me using the form at the bottom of the page.

At this point, you might be going "This dude can only rant! Provide some alternatives, then!" and, in a sense, you'd have a point, since all I did so far is rant and only briefly talk (or rather mention) the "correct" way to go about things.

So it's time to remedy this. In this post, I will try to provide tips and rough guidelines as well as links to further reading which will help you in making your website faster and more accessible.

As I've said before, speed, lightness, mindfullness and minimalism do not neccessarily mean that your website must or will look as minimal (and some would say barren) as mine, not at all! You can have colors, images and whatever fucking flashy, hip things you want, but you MUST be mindful with everything that you add. Dont use jQuery just to do a fucking POST call and don't use Bootstrap just because you're fucking lazy.

## The least you can do
### Base
In order for your website to be quick, it needs to have a solid, lightweight base. To ensure this, *my* solution was to create [my own website engine](https://0xff.nu/why-saisho) that will fit *my needs*. You, of course, don't have to do this, but you do have to take your base into account as it's probably the most important aspect.

WordPress is bloated[^1]. You need a plugin for even the most basic things which make the platform even heavier. This is not to say that WordPress is bad per se, but it is more often than not an overkill solution just to handle your blog or journal.

If you can afford it, use a static site builder like [11ty](https://www.11ty.dev/) or literally anything from [StaticGen](https://www.staticgen.com/). If you need a CMS, use lighter solutions like [Bludit](https://www.bludit.com/), [Grav](https://getgrav.org/) or [Automad](https://automad.org/).

### Accessibility
Making your website more accessible to different kinds of people probably was not in your list of considerations, but you can now help change this. There are tons of small things you can do which will ensure a lot more people can read your website comfortably.

**Animations** - Want to use animations? Great! But please note not everybody likes (or can stomach) this fucking trash:
<video controls width="450">
    <source src="https://0xff.nu/i/Disastrous-4da830c339b59b9b.webm"
            type="video/webm">
    Sorry, your browser doesn't support embedded videos.
</video>
Animations, at worst, need to compliment your content and **enhance** the user experience, and at best not to be used at all.
Still want to use them (in moderation, of course)? Sure, BUT also use the `prefers-reduced-motion` [^2] media query. This way, those who do not wan't to see animations will not be forced to do so.

**Colors** - Use tools like [this](https://color.a11y.com/) to make sure the colors you are using are contrasty enough.
While some say dark mode (or night mode) is not important, it is becoming way more requested and needed. Besides, it is now easier than ever to implement using the `prefers-color-scheme`[^3] media query, so why not add it?

**Fonts** - Avoid webfonts if you can. The system stack is usable enough for most people. If you are using webfonts, don't use unreadable shit like this:
![Unreadable](https://0xff.nu/i/Tubby-ae0ddc24569cabab.png)

Relevant reading:
- [Designing Safer Web Animation For Motion Sensitivity](https://alistapart.com/article/designing-safer-web-animation-for-motion-sensitivity/).
- [An Introduction to the Reduced Motion Media Query](https://css-tricks.com/introduction-reduced-motion-media-query/).
- [Web fonts: when you need them, when you dont](https://medium.com/hackernoon/web-fonts-when-you-need-them-when-you-dont-a3b4b39fe0ae).

### Frameworks
Want to use a framework? Don't. **Absolutely have** to use CSS & JS frameworks? Use them wisely.
How does, for example, loading 500-fucking-kilobytes for 5 social icons makes any sense?
![this is 500kb](https://0xff.nu/i/Secondary-d154d301072c74d3.png)

Write your own CSS according to your/your website's needs. Only add classes you're going to use. Optimize.

If you're only using jQuery (31kb) to do ONE thing, I'm sure as hell you can manage to do it using vanilla JS. Need a small framework to make things easier? Check out [Cash](https://github.com/fabiospampinato/cash) or [UmbrellaJS](https://umbrellajs.com/).

### Images
Images are there to compliment the rest of your content. Unless I'm looking at your portfolio of visual arts, don't make me download a megabyte photo of your mug.

**Optimize** - there's no fucking reason for you to force me to load unnecessary data, for example the illustration [here](https://merichard123.github.io/) provides no additional value yet weighs 26% of the total page size.
FFS the same image in WEBP is 132kB, which is a 31.6% reduction in size and it only took me 5 fucking seconds to do this.

**Resize** - The profile image [here](http://www.pierrealexandreholliger.fr/) for example is 1728x1152 pixels yet you're limiting it to 30% in CSS, thus making your visitors download more data than is actually required. WHY? 5 fucking seconds to resize it to 600x400 and optimize and it's a miniscule 17.9 kB instead of 95.1kB, and all it took is some caring.

**Lazy loading** - Utilize [lazy-loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading) on all the images that you use. It costs you nothing, yet helps a lot.

## What else can I do?
This all depends on how much you care. If you care about your website, and you actually put some time in crafting it rather than throwing a bunch of crap together - it will look and perform great.
Make sure to check out [client-side caching](https://www.nginx.com/blog/nginx-caching-guide/) (if your HTML won't change, you could try caching it as well), preload/prefetch[^4] resources, minification, pre-compressing your resources, read what [others](https://daverupert.com/2020/03/maintaining-performance/) [have done](https://www.kizu.ru/a-bit-of-performance/), and try to stay on top of whats new in web technologies.

The main point I'm trying to get across is this - Experiment to your heart's content, but please give a shit when it comes to a publicly available website, your visitors are not your test subjects. They would rather read what you have to say than bask at the unholy abomination that is your fancy fucking React APP. 

### Further Reading
- [Bandwidth Conservation Society](https://kokorobot.ca/site/leanerweb.html) by Rekka Bellum.
- [`content-visibility`](https://web.dev/content-visibility/).
- [Service worker caching and HTTP caching](https://web.dev/service-worker-caching-and-http-caching/).


[^1]: This is not my opinion. This is a fact. Articles like [this](https://devdojo.com/ramadan-byalk/useful-code-snippets-for-wordpress) exist because of how bloated WP is.
[^2]: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
[^3]: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme
[^4]: https://www.digitalocean.com/community/tutorials/html-preload-prefetch
