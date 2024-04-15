---
title: Ultra Clean
date: 2020-01-16
parent: bludit-boilerplate
tags: project,bludit,theme
---
[Bludit Boilerplate](https://paulglushak.com/bludit-boilerplate/) is nice, but what if I'm **real** fucking lazy?

No worries, here's a simple sample CSS (in addition to what's already in BLBP) to make BLBP look like this:
![Sexy minimalist design](https://paulglushak.com/bl-content/uploads/pages/30d590625ca2a79b2cbb7c2d678ba19f/ScreenShot2020-01-16at3.06.27PM.png)<span class="caption">Sexy, sexy minimalism.</span>

<a class="button" href="https://paypal.me/PaulGlushak">Support Me</a>
<a class="button" href="https://ko-fi.com/hxii__">Buy me a {beverage} on ko-fi</a>

Here's the CSS, free of charge:
```CSS
html {
	font-size: 15px;
}
body {
	font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
	-webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
	font-size: 1rem;
	line-height: 1.6;
	margin: 2rem;
	background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAPElEQVRIS+3SIRIAMAjEwPD/RxdVHYVL9U1hlhvgAcPRO/v479sAvVxEEamABmpRRCqggVoUkQpo4LxFC49HARl6Ae7nAAAAAElFTkSuQmCC) repeat;
}
.container {
	max-width: 600px;
	background: #fff;
}
header .content {
	display: flex;
	align-items: baseline;
	justify-content: space-between;
}
header hr {
	display: none;
}
.logo h2 {
	font-size: inherit;
	display: inline-block;
}
.slogan {
	display: none;
}
ul.nav, ul.tags {
	display: flex;
	flex-direction: row;
	margin: 0;
	padding: 0;
	list-style-type: none;
}
ul.nav li + li {
	margin-left: 1rem;
}
.article-list {
	margin: 1rem 0;
}
article.list-article {
	display: flex;
	justify-content: space-between;
}
.list-article .article-name span {
	display: none;
}
ul.tags li + li {
	margin-left: 1rem;
}
footer .plugin {
	margin-bottom: 2rem;
}
a, a:visited {
	color: #000;
}
a:hover {
	color: #1a41ff;
}
hr {
	margin: 2rem 0;
}
@media screen and (max-width: 640px) {
	body {
		margin: 1rem;
	}
}
```

