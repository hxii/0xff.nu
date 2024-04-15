---
title: Overkill Compliance
description: Over-complicating tasks for the sake of innovation?
date: 2020-05-15
---
A little while ago, I wrote a very simple and small WordPress plugin[^1] (we're talking 1597 bytes of actual code, or 1128 bytes if we were to remove CSS) that answered a very specific requirement.
One which does not (to the best of my knowledge) exist in WordPress[^2].

Due to the fact the project in which the plugin was supposed to be used for never came to light and after making sure it works (as well as adding some functionality), I've decided to upload it to WordPress.org thinking others may find use in it.
Having submitted two plugins to WordPress.org in the past and not encountering issues in the submission/validation process, I never expected to receive the reply I received.

> At this time, we are not accepting plugins of this nature.
>
>
> Plugins that reproduce features that are already included in WordPress, without any perceivable additions, such as (but not limited to) duplication of existing short codes ([embed] and [gallery]), widgets (rss feed display), or functionality (adding users), will not be accepted.
>
>
> In your specific case, there's no need for a shortcode to embed WordPress posts because WordPress auto-embeds posts. Just paste the URL of the post you want to embed on it's own line (or in it's own block) and it will automatically do that for you.

This was the content of the validation email I've received from WordPress.org. Needless to say, I did not agree with their decision.

I sent a reply explaining that the built-in functionality differs (including a screenshot!) from the one my plugin offers.
I was met with the following reply:

>You do not need any plugin to do this, WordPress now does this by default and built-in.
>Literally, you're recreating built in functionality. Just paste a link to a WordPress post on its own line, or use the embed block, and it just works. No need for any plugin at all.

I thought maybe I'm not conveying my point clearly, so I sent another screenshot explaining the difference in functionality. This was met with the following:

>There are a few critical flaws in your approach. First, and most importantly here, you're using shortcodes. It's about to be 2020 and all new sites default to Gutenberg. Having an insert require shortcodes today is short sighted, especially because of the second flaw. You're requiring people to know the post ID.
>But also you totally missed https://wordpress.org/plugins/posts-in-page/
>If you wanted to make a full blown Gutenberg-ized version, that would be one thing. But you haven't actually created anything new here. It's absolutely useful, yes, but it already exists both in the plugin you found and posts-in-page.

The problem, then, is NOT in the "existing" functionality, but rather forcing plugin creators to use Gutenberg[^3] (with it's thousands[^4] of bugs) instead of creating a lightweight, simple plugin (I'm leaving the fact that both the plugin that I found, and the one they sent over are VERY outdated).

You're strong-arming me (and others) to introduce more than the required amount into something so simple in order to be "compliant". Overkill, just like the rest of the platform.

Needless to say, I gave up on submitting this plugin. Whoever needs this functionality, will hopefully find my repo.

[^1]: Embed Post, available on [GitHub](https://github.com/hxii/embed_post).
[^2]: The plugin allows a user to seamlessly embed a post in a different post, in order to avoid content duplication. Was created to be used with knowledgebases where bits and pieces are often referenced by different articles.
[^3]: Gutenberg is the new wordpress post editor: https://wordpress.org/gutenberg/
[^4]: https://github.com/WordPress/gutenberg/issues
