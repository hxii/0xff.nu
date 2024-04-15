---
title: Image Optimization for The Web
description: Steps to properly utilize images on the web in an optimized manner that everyone should take
date: 2020-09-08
tags: webperf, guide
---
In my [previous rant about web bloat](https://0xff.nu/speed-pt3#images) I briefly spoke about image sizes and incorrect image usage and what you can do to either reduce it or make your visitors' life easier.
A [specific toot](https://merveilles.town/@FredBednarski/104821640863683259) prompted me to continue and expand about this with the hopes that this information will help some of you.

## TL;DR
Images, like anything else, are to be use to answer a need or solve a problem[^1] (like demonstrating something in a visual manner).

If you don't absolutely need images - don't use them. If you *have* to use images, make sure they are optimized.

## Image Formats
Many things have been said about image formats and I will most likely have nothing new to contribute, so instead I'll direct you to some useful reading material:
- [Using WebP Images](https://css-tricks.com/using-webp-images/)
- [How to optimize images for web](https://abraia.me/docs/image-optimization/)
- [Picture this: the best image format for the web in 2019](https://www.freecodecamp.org/news/best-image-format-for-web-in-2019-jpeg-webp-heic-avif-41ba0c1b2789/)

## Image Size
Before I delve into fancy (and helpful) tricks that you can do to make sure your page load speeds are not inhibited by images, it is important to deal with the root of the problem - image size.

As I mentioned in my previous rant (linked above), I often see websites usings images of disproportional sizes (both image dimension and filesize) to their intended purpose where people would, for example, use a large (1728x1152) profile photo and resize it via CSS (to 30%, effectively 496x331 on a 1080P display):
![Very large profile photo](https://0xff.nu/i/Quarrelsome-e8b8d9b085ba00e3.jpg)

I'm not going to rant (again) why you really (really) shouldn't do this, so we'll get straight to it.

**Optimize.** Optimize your images. Deal with the dimensions first - if you know you're only going to use 30% of your image, resize it beforehand!
Using smaller dimensions will also result in smaller filesizes.

You think larger screens deserve larger images (not of your fucking face, please!)? Save multiple sizes and use [`srcset`](https://html.com/attributes/img-srcset/).

You made your images smaller? Thank you! You want to go the extra mile? Use optimization tools, either online or offile. For example:

### Online Tools
- [tinypng](https://tinypng.com/) and [tinyjpg](https://tinyjpg.com/).
- [compressor.io](https://compressor.io/)
- [Dither it!](https://ditherit.com/)
- [jpeg.io](https://www.jpeg.io/)

### Offline Tools
- [Color Quantizer (WIN)](http://x128.ho.ua/color-quantizer.html)
- [ImageOptim (MAC)](https://imageoptim.com/mac)
- [pngquant (Multi)](https://pngquant.org/#download)
- [pngcrush (NIX/WIN)](https://pmt.sourceforge.io/pngcrush/)
- [trimage (NIX/MAC)](https://github.com/Kilian/Trimage)

<small>Know any other good tools? LMK.</small>

## Lazy Loading
Unless images are part of the layout, you should always be using lazy loading.

Lazy loading will make the page load faster, as images that are offscreen will not be loaded until they are scrolled into view.

All you have to do is add `loading="lazy"` as an attribute to your `img` tags, e.g.:

`<img src="path-to-img.jpg" alt="Image description" loading="lazy">`

You can read more on CSS-Tricks about [Native Lazy Loading](https://css-tricks.com/native-lazy-loading/) and [The Complete Guide to Lazy Loading Images](https://css-tricks.com/the-complete-guide-to-lazy-loading-images/).

## Going the extra step
Your images have been smallified and are lazy, but you want to do a bit more, huh?
Another thing you can do is make sure images are only loading once a user triggers them.

### The JS route
This is a technique I employ here, on [my website](https://0xff.nu), and it consists of setting a placeholder as the image source and the actual image under a `data-src` attribute, creating a listener and switching the sources once the user clicks on the image.

Image example:

`<img src="/load.png" data-src="https://0xff.nu/i/Tubby-ae0ddc24569cabab.png" alt="Holy fucking unreadable font, Batman!" loading="lazy">`

The JS code:

```JavaScript
  <script type="text/javascript" defer>
  const images = document.querySelectorAll("img[data-src]");
  images.forEach(function(image) {
      image.addEventListener('click', e => {
          e.target.src = e.target.dataset.src;
          image.removeEventListener('click', e);
      });
  });
```

### The CSS route
If you don't want to use JavaScript (I wouldn't blame you), you can achieve a similar effect using HTML and CSS. You can see a little demo I wrote on [Codepen](https://codepen.io/nocte/pen/wvGpOyE).

The gist is to place the image offscreen or hide it using a CSS rule and use a checkbox element to switch the styling once it's checked.

For example, the HTML:
```HTML
<div class="fig">
  <input type="checkbox" id="loadimage" name="loadimage">
  <label for="loadimage">Load Image</label>
  <img src="https://images.unsplash.com/photo-1568431477192-52bb13a55088" loading="lazy" alt="A cute hedgehog">
</div>
```
And the CSS:
```CSS
.fig {
  display: inline
}

.fig label {
  color: blue;
  cursor: pointer;
  text-decoration: underline;
}

.fig input {
  display: none
}

.fig img {
  position: absolute;
  left: -9999px;
  display: none;
}

.fig input:checked ~ img {
  position: relative;
  left: 0;
  display: block;
}
```
This might be a bit less straightforward and more cumbersome solution, but it works.

### In conclusion
You don't have to do this, and you might argue how this is kind of fucking annoying in terms of UX, especially if you are using a lot of images, and you'd be right and this is exactly where you need to excercise common sense.

## Closing words
Images are only part of the web bloat, but they could be one of the easier things to fix. Everything depends on you and how much effort and thought you're willing to put into this.

The important thing is that we acknowledge the problem and take steps towards fixing it, rather than contributing to it.

Let's make the fucking 
web nice again, shall we?

[^1]: Part of my, I guess, way of minimalism, is that when writing code, if something doesn't solve a problem, answer a need or makes someone's life easier it's most likely not required. This is true for many things, images included. I only reserve images for things I cannot show using text.
