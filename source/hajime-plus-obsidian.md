---
title: Hajime + Obsidian = 🤯
modified_timestamp: 2025-04-15T22:37:24+03:00
created_timestamp: 2025-04-15T21:14:27+03:00
date: 2025-04-15
tags:
  - guide
---
Having recently made some adjustments to [[Hajime]] to make it possible to author posts via Obsidian,
all I have to do now is write something somewhat coherent in Obsidian and run a command in 
Obsidian (or throw some gang signs that resemble a hotkey, if that's your jam).

Here's a short guide on how I set it up.
## Requirements
- [Hajime 0.5.7 and above](https://git.sr.ht/~hxii/hajime/refs/0.5.7).
- Obsidian.
- [Shell commands plugin for Obsidian](obsidian://show-plugin?id=obsidian-shellcommands). 
- Optional: Sourcehut/Github build workflow.

## The How
### Hajime
The first step is to configure the Hajime repository and make some changes.
I moved all my posts from `~/dev/blog/source` to a dedicated folder in my vault: `~/Vaults/brain/blog`.

Then, I enabled "copy mode" by setting `copy_entries_to_local_source` to `true` and changed 
the value of `source_folder` to the new directory in my Obsidian vault: `"~/Vaults/brain/blog"`.

My `hajime.toml` file looks as follows:
```toml
[meta]
version = "0.5.6"
folder_hierarchy = true
sync_commit = true
sync_push = true
disallow_publish_override = false
copy_entries_to_local_source = true

[folders]
source_folder = "~/Vaults/brain/blog"
output_folder = "html"
template_folder = "template"

[include]

[exclude]
tags = ["hide"]
```

### Obsidian
To avoid reaching for the terminal every time I want to update my blog the initial plan was to write a simple plugin
(I still might do that... at some point) to handle the `sync` process of Hajime.

But, being ~~lazy~~ all over the place as I am, I went for a simpler solution - running shell commands!

For this, I am using the [Shell Commands](https://github.com/Taitava/obsidian-shellcommands) plugin. And since it's not currently possible to export/share the
configuration from it, I'll try and explain the steps I took.

First, I had to add a custom shell, as Fish (as of April 15th, 2025) is not supported out-of-the-box:

1. Open [Obsidian settings](obsidian://advanced-uri?settingid=general). 
2. Navigate to *[Environments -> Custom Shells -> New Custom Shell](obsidian://advanced-uri?settingid=obsidian-shellcommands)*.
3. Shell name: `fish`
4. Executable path: `/opt/homebrew/bin/fish`

Then, just for the "configurability" of it, I created a variable for the Hajime directory:

1. Navigate to *[Variables -> Custom Variables -> New Custom Variable](obsidian://advanced-uri?settingid=obsidian-shellcommands)*.
2. Variable name: `hajime_directory`.
3. Description: `The directory where your Hajime blog is located`.
4. Default Value: `Cancel Execution`

And finally, I created the command itself:

1. Navigate to *[Shell Commands -> New Shell Command](obsidian://advanced-uri?settingid=obsidian-shellcommands)*.
2. Command: `cd {{_hajime_directory}}; hajime sync`.
3. MacOS Shell: `fish`.
4. Variables -> {{_hajime_directory}}
	- Execute With Value
	- `~/dev/blog`

## Optional: Sourcehut Build
The cherry on top of my amateur solution is to automate the building process using [Sourcehut Builds](https://man.sr.ht/builds.sr.ht/).

Here's my manifest:
```yaml
image: alpine/edge
oauth: pages.sr.ht/PAGES:RW
packages:
  - python3
  - rust
  - uv
  - cargo
  - hut
sources:
  - https://git.sr.ht/~hxii/hajime
environment:
  site: 0xff.nu
tasks:
  - setup: |
      cd hajime
      uv tool install .
  - package: |
      cd $site
      uvx hajime build --compress
      tar -C html -cvz . > ../site.tar.gz
  - upload: |
      hut pages publish -d $site site.tar.gz
```

## The Result
I now have one (albeit fairly annoying) excuse less to avoid writing something, as the process is virtually effortless requiring only one command to accomplish.
Probably not elegant, but fuck it! If it's stupid, but it works - it ain't stupid.