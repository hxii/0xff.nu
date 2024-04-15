---
title: Image Placeholder DIV
description: Quick image placeholder snippet
date: 2021-01-10
tags: webperf, guide
---
This is a quick snippet I already wrote about under [Image Optimization](/image-optimization#the-js-route) but decided to revisit in order to make it totally image-less (in the placeholder state).

The change, in a gist, lies in using a `button` element instead of an `img`. The inner text used to present the reader with the dimensions and filesize of the image they are about to load - this will require some server-side code which I may add here in the future.

You can, at this point, just use a [pure CSS solution](/image-optimization#the-css-route).

First, we need the button. Note we're using `data-src` to store the URL of the image. The text inside the button can be static ("Click to load") or dynamic ("350x150, 10kB").
```HTML
<button class="loadimg" data-src="https://via.placeholder.com/350x150">Click To Load 🖼️</button>
```

Next up is the code that makes it work. This requires a little bit of JS:
```JS
const images = document.querySelectorAll("button.loadimg");
  images.forEach(function(image) {
      image.addEventListener('click', e => {
        var i = document.createElement('img');
        i.src = e.target.dataset.src;
        document.body.insertBefore(i,image);
        image.removeEventListener('click', e);
        image.remove();
      });
  });
```