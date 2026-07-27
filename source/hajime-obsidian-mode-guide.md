---
title: Hajime Obsidian Mode – A Quick Guide
date: 2026-07-27
tags:
  - guide
  - hajime
  - obsidian
bucket: Productivity
group: hajime
parent:
  - hajime
modified_timestamp: 2026-07-27T17:37:41+03:00
created_timestamp: 2026-07-27T12:31:18+03:00
---
> [!IMPORTANT]
> Right now there's no direct Obsidian plugin, but maybe I'll get to it at some point.
> That being said, the process is actually quite simple,

Now that [Hajime v0.6.4](https://git.sr.ht/~hxii/hajime/refs/0.6.4) is out and backlink and relationship support is in, I figured it might be worthwhile to put together a short guide on how to wire Hajime and Obsidian together, in case others are interested in using this function. 

## Requirements

- [Hajime 0.6.0+](https://git.sr.ht/~hxii/hajime) (0.6.4 recommended for backlinks and relationships)
- [Obsidian](https://obsidian.md/) obviously
- Optional: [Shell Commands plugin](https://github.com/Taitava/obsidian-shellcommands) for triggering builds from inside Obsidian

## Step 1: Prepare Vault

While you can just rely on the filtering in Hajime to pick up what is and isn't a blog post, it'd probably be best to separate your content into a dedicated directory withn your vault. For example:

```
~/Documents/Brain/
├── blog/          ← my entries go here
├── Files/         ← attachments (images, etc.)
└── ...rest of your vault
```

You don't need to move your vault, as Hajime will read and copy the relevant entries from the directory you point it at.

## Step 2: Configure `hajime.toml`

Add an `[obsidian]` section to your `hajime.toml` (or **first** run `hajime init` in a new directory if you didn't set Hajime up before)

```toml
[obsidian]
obsidian_mode = true
vault_root = "~/Documents/Brain"
entries_path = "blog"
attachments_path = "Files"
resolve_attachments = true
```

Here's what each option does:

| Option                | Description                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `obsidian_mode`       | Enables Obsidian mode. When `true`, Hajime reads entries from your vault instead of the `source_path`. |
| `vault_root`          | Path to your Obsidian vault root.                                                                      |
| `entries_path`        | Directory inside the vault where publishable entries live.                                             |
| `attachments_path`    | Directory inside the vault where attachments (images, etc.) are stored.                                |
| `resolve_attachments` | When `true`, Hajime resolves `![[image.png]]` references and copies attachments to the output.         |

## Step 3: Frontmatter

Each entry in Hajime expects some frontmatter, which Obsidian obviously does:

```yaml
---
title: "My Post"
date: 2026-07-27
tags: [guide, obsidian]
---
```

To keep something unpublished, tag it `draft` (or whatever you set in `[exclude]`).

## Step 4: Wikilinks and Backlinks

As of **v0.6.4**, Hajime resolves `[[wikilinks]]` and generates backlinks automatically.
So if `[[entry A]]` links to `[[entry B]]`, if you call `backlinks` on `[[entry B]]`'s page you'll get A as a backlink. This is computed at build time — no manual maintenance.

Relationships are also available:

- **Direct**: `parent` and `related` from frontmatter.
- **Inferred**: `siblings` (entries sharing the same parent) and `children` (entries that have this entry as their parent).

These are exposed on the `Entry` object in templates as both JSON and [Kankei](https://git.sr.ht/~hxii/hajime) format.

You can get the relationships as either JSON (`entry.generate_json_relationships()`) or Kankei. The graph is up to you. I published my implementation here: [kankei-graph.js](https://github.com/hxii/kankei-graph)

## Step 5: Build

From your Hajime directory:

```bash
hajime sync    # pulls entries from vault locally to hajime.toml
hajime build   # renders the site
hajime push    # Optional - will push changes to remote git
```

Or do both in one shot:

```bash
hajime sync && hajime build
```

## Optional: Trigger From Obsidian

Install the [Shell Commands plugin](https://github.com/Taitava/obsidian-shellcommands) and set up a command:

```
cd ~/dev/blog; hajime sync
```

Bind it to a hotkey. Now you can write in Obsidian, hit a key, and your site updates.

## Optional: Automated Builds

If you push to a Git remote (SourceHut, GitHub, etc.), you can run the build in CI. Here's a SourceHut build manifest:

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
  site: example.com
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