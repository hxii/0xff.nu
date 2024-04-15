---
title: Saisho Mk. 3
date: 2021-06-27
tags: project, saisho
---

!!! danger "No longer maintained"
    This is no longer updated in favor of Saisho MK.4 – see [[im-alive]]

![Complexity-time graph](https://0xff.nu/i/saisho-3.png)

[Saisho](https://0xff.nu/saisho), the semi-static[^*] website engine, has been through a couple of iterations now, and every time I try and make it better while keeping it as simple as I can (after all, the entire point is to have a CMS that offers minimal resistance in daily usage, little to no upkeep and minimal bloat).

With each iteration, I manage to learn new things about PHP - more efficient ways of achieving a goal, better methods to use, unified coding standards and so on and implement them in my own code.

With version 3 of Saisho, I believe I managed to make the entire thing even more simple and robust. For example, earlier I decided to group all of the entries by year. All that was required is to add a grouping function:

```php
  private static function groupByYear(array &$pages) {
    foreach ($pages as $base=>$page) {
      $year = substr($page['date'], 0, 4);
      $pages[$year][$base] = $page;
      unset($pages[$base]);
    }
  }
```

And a tweak to the `list.html` template:
```html
{% foreach ($data_pages as $year=>$pages): %}
<h3>{{ $year }}</h3>
<ul class="entrylist">
  {% foreach ($pages as $link=>$data): %}
  <li><a href="{{ $link }}">{{ $data['title'] }}</a> &mdash; {{ $data['date'] }}</li>
  {% endforeach; %}
</ul>
{% endforeach; %}
```

## The new stuff
The reason I don't like using already existing libraries is not because I hate myself, but because writing something of my own, even with significantly less features, teaches me quite a lot about how things work as well as allowing me to tailor everything to my own needs. Saisho Mk.3 is no different.

### Routing mechanism
Routing in the previous iteration, while working, was a shit show - adding new static routes or making any sort of changes was just plain annoying and cumbersome at best. For version 3, I used the router I created for [Plaintext](https://0xff.nu/2021-06#plaintext) as base and made my own as a separate class.

It's not feature packed and some things _definitely_ need to be fixed and improved, but it is working for this use case.

### Template system
Back in the first iteration, the HTML was a part of the code which is a big, big no-no. In version 2 I had created simple PHP "templates", which was basically just taking the HTML out of the logic and putting it into a separate file.

Now, based on the code from [Codeshack](https://codeshack.io/lightweight-template-engine-php/), I created a simple template system that should make my life (and maybe yours, if you use Saisho) easier when making changes to the template.

### Markdown parsing
I tried parsing Markdown myself, but doing so reliably (at least with my limited knowledge) proved to be pretty much impossible. The code remains (as it's used for the microblog), but I am back to using Parsedown for Markdown parsing.

### Logging
I have added logging with multiple log levels in order to diagnose loading times and other issues when running Saisho. Hopefully it'll prove useful to those of you who are willing to try Saisho.
Example log
```log
[2021-06-29 08:39:02] - DEBUG - INIT Saisho (Saisho->__construct:93)
[2021-06-29 08:39:02] - DEBUG - Page data/antispam.md loaded - 13.91ms (Saisho::getPageData:27)
[2021-06-29 08:39:02] - DEBUG - Template entry.html requested (Template::view:31)
[2021-06-29 08:39:02] - DEBUG - Loading template entry.html (Template::includes:20)
[2021-06-29 08:39:02] - DEBUG - Including head.html (Template::includes:20)
[2021-06-29 08:39:02] - DEBUG - Loading template head.html (Template::includes:39)
[2021-06-29 08:39:02] - DEBUG - Including style.css (Template::includes:39)
[2021-06-29 08:39:02] - DEBUG - Loading template style.css (Template::includes:39)
[2021-06-29 08:39:02] - DEBUG - Including title.html (Template::includes:20)
[2021-06-29 08:39:02] - DEBUG - Loading template title.html (Template::includes:39)
[2021-06-29 08:39:02] - DEBUG - Including foot.html (Template::includes:20)
[2021-06-29 08:39:02] - DEBUG - Loading template foot.html (Template::includes:39)
[2021-06-29 08:39:02] - DEBUG - Compiling echoes (Template::compileEchoes:45)
[2021-06-29 08:39:02] - DEBUG - Compiling blocks (Template::compileBlocks:46)
[2021-06-29 08:39:02] - DEBUG - Compiling yields (Template::compileYields:47)
[2021-06-29 08:39:02] - DEBUG - Compiling PHP (Template::compilePHP:48)
[2021-06-29 08:39:02] - DEBUG - Saving compiled file /Users/paul/git/saisho_v3/Compiled/entry.php (Template::saveCompiledFile:22)
[2021-06-29 08:39:02] - DEBUG - Serving /Users/paul/git/saisho_v3/Compiled/entry.php (Template::saveCompiledFile:22)
[2021-06-29 08:39:02] - DEBUG - Finished loading template entry.html - 3.01ms (Template::view:31)
[2021-06-29 08:39:02] - DEBUG - Saisho finished - 23.19ms (Saisho->__construct:93)
```

## Information
I tried making Saisho as simple as possible, but you have to keep in mind that Saisho is not Wordpress (nor any other well-known CMS):
- It does not have a GUI.
- It does not have an installer.
- It does not have a guide.
- It is not super advanced.
- To get it running, knowing some PHP, HTML and CSS is required.
- And last but not least - it's made by an amateur.

**If you have any ideas or suggestions on how to improve Saisho, please contact me on [@paulglushak](https://twitter.com/paulglushak) via Twitter. (until the contact form is back)**

~~Demo~~ (soon)

~~Download~~ (soon)

[^*]: Not really static anymore. At least not until I bring entry caching back.
