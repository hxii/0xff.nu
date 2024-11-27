---
date: 2024-11-26
tags: css, design, important
title: Expando
type: project
description: TelescopicText implementation. It's only like this because it's cold, promise.
---
!!! important "Salt, Grains and everything in between"
    The material presented here should be safe, but you're encouraged to make your own, better implementation.

## "I was too late... I should have been here sooner."

Some time ago, I came across an interesting concept of text that was very short,
and would expand when you'd click on links to reveal more information.
In my infinite wisdom, I didn't think about saving this groundbreaking concept anywhere
in my black hole of bookmarks so this futuristic information was lost in time, like tears in rain.

That is until very recently, when I decided to give a little UX makeover to my website's
about/now sections and somehow this gem of internet engineering made its way to my frontal cortex.
I still couldn't remember what it was called, so, in true ADHD fashion,
I embarked on a two-day half-assed quest for this life-changing technology.

It's time to get cracking. Let's make this dream a reality!

Eventually, I managed to find a link on HN to a no-longer-working website: <https://telescopictext.com>.
I was able to verify that this was indeed the 8th wonder of the world that I was so desperately seeking
for with the help of [archive.today](https://archive.today), and I noticed a link to [telescopictext.org](https://telescopictext.org) down at the bottom.
This helped solidify my relief.

## "Is this really the best you can do?"

With me being me, the research did not end there, and I've mustered up the mental capacity to scavenge the
internet for other resources and implementations of this downright magical technology:

- [Telescopic Text](https://basseq.com/fun/telescopictext/) - JavaScript implementation by John Whittet circa... oh boy, 2008.
- [GitHub - jackyzha0/telescopic-text](https://github.com/jackyzha0/telescopic-text) - Ah yes, Jacky, the brilliant mind behind [Quartz](https://github.com/jackyzha0/quartz)! Let's see... oh my god, why is there so much to read? I do like the implementation, though.
- [Andrew Cantino](https://andrewcantino.com/) - Andrew made this in 2012 and is still using it, what a legend! But it's `jQuery` and I'm not gonna use that 😅.
- [Telescopic text – Future Text Lab](https://futuretextlab.info/2024/07/21/telescopic-text/) - [Leon Van Kammen](https://mastodon.social/@Leon@futuretextlab.info) made this little gem just recently as well, as it turns out! Still JavaScript, but barely! I mean, just look at it:

```JavaScript
<script>
    ([...document.querySelectorAll('u')]).map( (u) => {
        u.addEventListener('click', e => e.target.className = 'show')
    }
    );
</script>
```

All of these are nice, but I just... want to make my own, you know? Yeah yeah, typical ADHD behavior -
"How hard can it be?", "It's not going to take much time", "It's for my own fun" yadda yadda yadda.

And the most important bit - it has to be compatible with my ~~clusterfuck~~ Markdown-based [website](/hajime).

## "I’m going to have to science the shit out of this."

### The `radio` way

At first, I decided to try a pure HTML/CSS approach using the best hack known to mankind: using inputs.
But instead of using `<input type="checkbox">` we're gonna use it's better brother `<input type="radio">`,
because once clicked (or selected), it can't be unclicked. Sweet.

#### HTML

```HTML
<p>
  My name is <input type="radio" id="hxii"><label for="hxii" more=", and I live on planet earth">hxii</label>.
</p>
```

#### CSS

```CSS
input[type="radio"] {
  display: none;
}

input[type="radio"] + label {
  background: #ddd;
}

input[type="radio"] + label:hover {
  background: #ccc;
}

input[type="radio"]:checked + label {
  background: initial;
  padding: 0;
}

input[type="radio"]:checked + label::after {
  content: attr(more);
  display: inline;
}
```

The keen eyed of you will notice I pigeonholed the expansion as an attribute.
We can eliminate the `<span>` element by using an attribute in the label instead along with some
more CSS wizardry so this just seemed... a bit more streamlined, I guess?

The issue with this approach - I can't have nested elements, can't use HTML nor can I get this to fucking work in Markdown.

### The "using things in an illegaly wrong way" way, a.k.a the `<a>` way

I apologize in advance, but this brainfart of duct-tape-engineering didn't make its way to the
CodePen demo, because it's hella bork. But I'll share it here:

#### HTML

```HTML
<p>
  <a href="#">Test</a><span class="expansion"> me one more time</span>.
</p>
```

#### CSS

```CSS
span.expansion {
  display: none;
}

a:visited+span.expansion {
  display: inline;
}
```

Don't use this. `visited` links will stay visited and you will stay sad because this doesn't work.

### The "hit me with the `<details>`" way

I am fairly sure the only thing I gained by wasting more time than I potentially should have on this
is more gray hairs. Getting this to work was annoying, as `<details>` would escape the confines of its
`<p>` prison when, since it's a block element. `display: inline;` did nothing to help, and `Python-Markdown`
wouldn't have it any other way.

#### HTML

```HTML
<div>
  <span>I own </span>
  <details>
    <summary>two cats</summary>a cat named Yoda, and a cat named Pie.
    <details>
      <summary>They are very smart.</summary>They have maybe two braincells between them, but they're awesome.
    </details>
  </details>
</div>
```

The neat thing about this approach, is that I can safely nest these elements and they will work.
I mean, I even spent two days worth of free Claude.ai tokens to make a custom extension for Python-Markdown
and it didn't work.

Fine, let's just get this over with...

### The "I have to do this; my couch is counting on me." way, a.k.a the `<script>` way

Look, I didn't wanna go the JavaScript way, alright? But you know how the saying goes...
> “When you’re a spatula and all you see are hammers, it’s time to turn that nail into a spoon—because forks just don’t cut it!”
>
> -- I didn't sleep too well at night. Sorry.

How then do I do this without angering mother nature and use the LEAST amount of JavaScript
while keeping this abomination Markdown-safe? Can't do details, links won't work while nested... Lists!

So the idea is then that all list items will be rendered inline, and any list item with a nested
list after it will roleplay as a text and extended-text. Something like this:

#### Markdown

```Markdown
- My name
- is hxii
    - is SOMETIMES hxii
- and I like to code
- cool things
    - useless things
    - that look cool
        - that look kinda nice and might be useful
- .
```

#### CSS

```CSS
div.expando ul {
  display: block;
  margin: 0;
  padding: 0;
}

div.expando ul li {
  display: inline;
}

div.expando li > ul {
  display: none;
}

div.expando li > ul.expanded {
  display: inline;
}
```

Fucking wonderful! Now all I have to do is use an HTML block and vomit my Markdown in-between and I'm all set!

```Markdown
<div class="expando" markdown="1">
- My terrible professional career as a markdown list.
</div>
```

A great solution, then.

## The End

It is what it is, and it's not great, but I think it turned out good enough.
It is probably better than my initial idea (which also sparked the [v0.5 of Hajime](https://git.sr.ht/~hxii/hajime/commit/39c273c)) of adding the
[now](/now) page with the overflow hidden where the about section now resides.

You can see the ~~whatever this is~~ end result, which now takes the shape of the about section on the [main page](/).
Here's the [CodePen link](https://codepen.io/nocte/pen/emOONyK) if you want to play around with the idea.
