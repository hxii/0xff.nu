---
title: A case for microblogging
tags: rant, saisho
date: 2020-09-21
description: Making a case for microblogging. Is it good for me? How should it be implemented? How to do it correctly?
---
>This entry is just me thinking out loud and trying to make a case for microblogging.

Recently I [tooted](https://merveilles.town/@hxii/104875101804537409) about potentially adding support for microblogging to, at least, my website if not Saisho in general. But this made me think and consider the options, requirements, and ways of implementing this (potentially) minor functionality.

The basic need and idea are simple - a way to distinguish between long-form articles and posts to short updates, shares, and misc posts, but it turns out that implementing this correctly could prove a little bit more challenging than I initially thought.

There are several problems that must be addressed and questions that must be answered:
1. Necessity - Do I really need to add this functionality? Why not just mix all the different kinds of posts together? Is this going to make my life easier?
2. File Structure - If I do implement this, would the microblog entries be in the same `/data/` folder? A separate folder? How would the files look like? Metadata?
3. Visuals - How would I display the microblog entries? Should they be in a separate list? Should I emphasize the distinction?

## Necessity
To be frank here, I'm not *entirely* sure I *need* microblogging, but I do know that I will sometimes refrain from posting something unless I have enough "material", so microblogging would certainly address this.

I guess it is also important to understand what microblogging is in its essence and to the best of my understanding it exists to express thoughts out loudly, draft things and quickly share resources with the people that are following your blog. A replacement for Twitter, if you will.

Maybe for this reason the micro-entries should be separated from, you know, the "actual content".

## File Structure
There are two issues here:
- Entries require a front matter header. The whole point of microblogging is for it to be a quick way to share information, so writing metadata doesn't make sense.
- All entries are stored in the `/data` folder. It would make sense to keep all entries in the same folder, but it would also make sense to separate the micro-entries from the rest of the content, in the interest of keeping some sort of organization.

Both of these would most likely necessitate a code change in Saisho, at the very least the separate data folder part.
The header conundrum can be resolved by using an API that will create the files with the appropriate metadata - which will make creating entries even simpler.

There are a few ways to go about this:
1. Separate data folder but metadata stays - core code change which means everyone gets microblogging. Will probably require API to create micro-entries.
2. Separate data folder and no metadata - core code changes with an extra side of code changes, as metadata will be taken from filename and fileinfo.
3. Same data folder and metadata stays - no core changes. Doable by using a "magic" tag and the implementation relies on the template.
4. Same data folder and no metadata - requires core changes (same as #2), but implementation is the same as above.

## Visuals
I do believe it's obvious that micro-entries have to be separate from the rest of the content in one way or another, as having them mixed with the other content will either
A. Create visual clutter.
B. Make articles hard to find with the number of micro-entries or
C. All of the above.

Think of this as a "blog" vs. "professional content" or similar terms.

Since we know a distinction HAS to be made, the question then is what is the best way to do it. Is it a separate page? A list similar to the article list? If so, should it be on the same page? If not, should I only display the latest entry? All entries? N entries?

==This is the part I'm struggling with.== I will be exploring different methods and update this article accordingly.

## Let's Discuss
What do you think about microblogging? Do you or would you utilize something like microblogging?

If so, what do you think is the best way to do it correctly?

# The Chosen Path
After writing the article above, I continued thinking, testing different things, and working on implementing the microblogging functionality given the constraints and requirements that I have from the microblogging functionality into Saisho.

## Source File
I wanted to make sure the source file is humanly readable even when looking at it directly, so I've decided on using a plain TXT file in reversed order (latest entry is always at the top) that follows a very simple format:

```
{RFC3339 Date}  {Unique ID} {Flags} {Entry text with MarkDown}
```

A sample entry would look like this:

```
2020-09-26T21:17:34Z	ed58b9 P Aside from the ID and the flags (still need to figure out if I *really* need those), the format is TWTXT compatible.
```

As you can see, the format is [twtxt](https://twtxt.readthedocs.io/en/latest/user/twtxtfile.html#format-specification) compatible (aside from the ID and flags).

Flags are TBD as I've added them thinking I'll find use (for example P for Published, S for Secret, etc.) for them, but I'm not entirely sure yet.

## Presentation
I've decided to have an entirely separate page for the microblog to make sure people can actually get to it (the other option is having it below the main article list).

A new 'special' page was made in Saisho to make this happen:

```PHP
case 'microblog':
    include_once INC_DIR.DS.'microblog.php';
    $mb = new microblog('blog.txt');
    $entries = (isset($requestedPage['query']['id'])) ? $mb->getEntries($requestedPage['query']['id']) : $mb->getEntries('all');
    $content = (object)[
        'title' => 'Microblog',
        'body' => $mb->renderEntries($entries),
    ];
    $page = (object)['type'=>'microblog', 'content'=>$content];
break;
```
This made me realize that creating 'special' pages in Saisho is less than comfortable, but this will be addressed at a later time.

As you can see, I've made it so that you can link to specific entries in the microblog by using `/microblog?id={id-of-entry}` or if you navigate to [/microblog](/microblog) without an ID, you'll get all the entries.

The microblog is using [Slimdown](https://gist.github.com/jbroadway/2836900) as opposed to Parsedown which is a very simple and quick Markdown parser with a very limited subset of tags.

The output on the microblog page is a simple ID (which gives you the date when you hover above it) and the parsed entry text.

## Posting
Currently, adding new entries to the microblog can be done either by adding them directly to the source file (less than ideal since you need both the timestamp and ID) or by using a simple API.

![Posting an entry via API](https://0xff.nu/i/O5AitXEKej-fs8.png "Posting an entry via API")

The API currently only supports creating new entries, but I might modify it to support changing and removing entries as well.

## Closing Words
This is still a learning experience for me and things may change depending on my requirements from this functionality. That being said, I am trying to keep it (and everything else in Saisho) simple and functional in a way that I will use it.

The format might still change depending on if I can find a use for flags and I still need to revise and refine the API.

The code will be pushed to both Sourcehut and GitHub once I verify that everything is working as it should.

Got any ideas? Want to discuss this? Fill out the form below and don't forget to mention your e-mail address.
