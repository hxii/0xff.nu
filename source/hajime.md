---
title: Hajime
date: 2024-04-19
tags: project, important
type: project
description: Static website generator made in Python
---
*Hajime* (previously called Saisho-PY), meaning "beginning" in Japanese, is a simple, slightly opinionated static website generator built with Python.

It is the spiritual successor and replacement to [Saisho](/saisho) (which was made in PHP), and is currently still being developed.

![Hajime Logo](hajime.png)

!!! important "Important"
    It is important to note a few things, in case you are interested in giving Hajime a spin:
    
    1. I'm still ironing out kinks as I come across them. If you see anything, please report on [Hajime tracker](https://todo.sr.ht/~hxii/hajime).
    2. Hajime is coded with certain assumptions, hence the opinionated part. Examples being the template files it uses, date formats or the lack of Markdown or MD extension configuration.
    3. As of April 19th, 2024, Hajime is not available as a standalone module, but as I use it as part of an automated build on SourceHut, it doesn't bother me. More on this later.
    4. Hajime is not feature complete, whatever that means in the context of minimalism. Please take this into account.
    
## Philosophy
From my personal point of view, the biggest obstacle to writing and sharing (and well, when it comes to productivity in general) is fucking around with themes, plugins and configurations. We often go so deep into the woods while forgetting why we even went there in the first place.

The less frills and moving parts, the better. From this aspect, Hajime both *is* and *isn't* feature complete - there is one template, some frontmatter and whatever you write in Markdown format. That's pretty much it.

Hence, the idea for (or behind) Hajime, is identical to how Saisho was operating -- MD comes in, HTML comes out.

Keep it simple. Keep it honest. Keep it usable.

## Dependencies and Tooling
*Hajime* was built with Python 3.12 in mind, albeit it probably will work with >=3.10 as well.
In a gist:

- [Tomli](https://github.com/hukkin/tomli) for TOML configuration.
- [Click](https://click.palletsprojects.com/en/8.1.x/) for CLI.
- [Ibis](https://www.dmulholl.com/docs/ibis/master/) for templates.
- [Markdown](https://python-markdown.github.io) (with some extensions).
The full list of dependencies is relatively short, and can be seen [here](https://git.sr.ht/~hxii/hajime/tree/main/item/pyproject.toml).

## Usage
### Installation
This is basically my [`build.yml`](https://git.sr.ht/~hxii/0xff.nu/tree/master/item/.build.yml) paraphrased:

1. Clone https://git.sr.ht/~hxii/hajime
2. Ideally install this in a venv, e.g. `cd hajime; python -m venv .venv; chmod +x .venv/bin/activate; ./.venv/bin/activate`.
3. Run `make install` to install dependencies.

### Using Hajime
1. Run `python -m hajime init` to create a default configuration file.
2. Put your template in `template`.
3. Put your content in `source`.
4. Run `python -m hajime build` to generate HTML files.

## Templates
Hajime relies on three main files existing in the `template_folder`:

- `list.html` - The main index or list of entries.
- `page.html` - Entry template.
Given to how `ibis` works, you can also have templates split to parts or have conditionals.
Please see the [Ibis Documentation](https://www.dmulholl.com/docs/ibis/master/) for details.

## Entries
Markdown syntax, obviously, with the following extensions:
```
"meta", # YAML Frontmatter
"wikilinks", # [[wikilinks]]
"extra", # Abbrev, attr and def lists, fenced code, footnotes, tables
"admonition", # rST Style admonitions - https://python-markdown.github.io/extensions/admonition/
"fenced_code", # As it says
"markdown_mark", # Marked text
"yafg", # Figures - https://pypi.org/project/yafg/
"markdown_del_ins", # Deleted and inserted text
"toc", # TOC - https://python-markdown.github.io/extensions/toc/
```

*Hajime* uses YAML frontmatter for metadata:
```YAML
---
title: The page title can be different than it's name.
type: entry, page and project are supported types.
date: YYYY-MM-DD format.
tags: comma,delimited,list,of,tags
description: A text description for things like projects
---
```

## Automating the Build
!!! information "Going Forward"
    In the near future, I'd like to add the `sync` functionality (or something similarly named) which will allow for a simpler deployment to **SourceHut specifically**.
    
    Perhaps a pre-built `.build.yml` file or just clear, simple instructions given how brutally simple it is to just get your content out there using SourceHut.

I currently host my blog on SourceHut, and use Hajime with the following `.build.yml` to automatically re-generate and upload my website.
You can take inspiration, and get a similar looking setup for your own blog.
```YAML
image: alpine/edge
oauth: pages.sr.ht/PAGES:RW
packages:
- hut
- rust
- cargo
- python3
- py3-pip
sources:
  - https://git.sr.ht/~hxii/hajime
environment:
  site: 0xff.nu
tasks:
- setup: |
    cd hajime
    python -m venv .venv
    chmod +x .venv/bin/activate
    ./.venv/bin/activate
    make install
- package: |
    cd $site
    python -m hajime build --compress
    tar -C html -cvz . > ../site.tar.gz
- upload: |
    hut pages publish -d $site site.tar.gz
```