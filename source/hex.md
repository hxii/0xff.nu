---
title: hex
date: 2026-06-18
tags:
  - python
  - draft
modified_timestamp: 2026-06-19T17:49:34+03:00
created_timestamp: 2026-06-18T17:26:14+03:00
type: project
---
`hex` is an executive assistant agent that I vibe-coded to assist me in managing my ADHD through the different systems I use on a daily basis.

If I had more time to spare to this project, most (if not all) of the code would've been written by me, alas balancing an active job search, two kids (and learning fucking Swift lol) while trying to keep some of my sanity take most of my available time.

While the systems that I put in place for myself do help a fair bit, there is still much that is left to chance, which obviously my brain will forget or get overwhelmed by.
So, with the recent AI buzz-word explosion, I've decided to brush up my knowledge of AI and LLMs beyond just installing `opencode` or `pi` and scouring *HuggingFace* for new tiny models to run locally, and actually both *use* agentic coding and *utilize* agents for tasks that are beyond the "I'm too fucking lazy to read this article; Summarize in two paragraphs" prompt.

I've decided to share a bit about the reasoning and execution to serve as an inspiration to others – whether you're also working on an ADHD agent or just fucking around with LLMs and need inspiration, maybe this is for you! 🤖

## hex's toolbox
Given the effort that is already required from me to manhandle my own grey matter, I really don't want to hand-hold `hex` by spoon feeding him the entire fucking context behind every single "I want to make sure I go for a walk tomorrow morning" request and all the data it needs to act, so I had to provide it with access to the high-friction bits of ADHD management nightmare:

- **Calendar** – `hex` can read events by default, and create and edit events with permission. Currently `hex` is accessing my FastMail calendar using `icalendar`, but Fastmail do offer an [MCP server](https://www.fastmail.help/hc/en-us/articles/15869557281295-Connecting-AI-tools-via-Fastmail-s-MCP-server) which I will probably move to using instead
- **Todoist** – `hex` can manage my tasks by using the [Todoist MCP server](https://ai.todoist.net/mcp), with the goal tools being filtered out
- **Obsidian** – since I try and dump all my knowledge into my vault, allowing `hex` to query my vault was a necessity. During development `hex` can access the vault using [Obsidian CLI](https://obsidian.md/cli), which unfortunately **does not exist** in the headless [Obsidian Sync](https://obsidian.md/sync), so I will have to use a tool like [NotesMD CLI](https://github.com/Yakitrak/notesmd-cli) as an alternative
- **Web Searching and Fetching** – Since me or my vault might be missing information or have information that is out of date, it's important for `hex` to be able to search the internet and get the content back. Fetching is done via the wonderful [Defuddle](https://defuddle.md) while search is done via [Kagi's MCP server](https://kagi.com/api/docs/openapi/section/mcp)
- **Browser** – while just getting the content of websites gets the job done most of the time, sometimes I need `hex` to "see" the website, which is done using [Playwright](https://playwright.dev) and a headless Chromium
- **TTS** – `hex` is able to voice the output using [KittenTTS](https://github.com/KittenML/KittenTTS), which is used for the Watcher integration (more on that later)
- **Telegram** – The main interface of hex is through Telegram, using [aiogram](https://aiogram.dev), which was recently made even more awesome by the introduction of Rich Messages in [Bot API v10.1](https://core.telegram.org/bots/api#june-11-2026)

## hex's features
Tools are one thing, but for `hex` to work properly, he needs some other useful features (which some would call basics):

- **Memory** – `hex` basically has three memory layers:
	1. Sliding contextual memory + summarization
	2. [Qdrant](https://github.com/qdrant/qdrant) vector storage for facts and transient memories
	3. Preferences storage using SQLite
- **Tool Sub-agents** – `hex` uses tools via slim sub-agents in order to prevent the entirety of the main context and prompt being used with a simple tool call. 
- **Specialists** – these are basically separate agents running secondary system prompts that are more verbose than tool agents and are designed for `hex` to delegate requests, maintaining opinion, personality and context detachment from the main agent
- **External (physical) Actions** – since there's a high chance my brain will shut down and I'll just ignore the fucking incoming Telegram message, I've decided to use a [Watcher](https://www.seeedstudio.com/watcher) device I had laying around and give `hex` the ability to know when I'm literally in front of my damn screen and to demand I finish that fucking "Fix bathroom light automation" task that's two weeks overdue by *saying it to me*
- **Skills** – for the rest of the things I need `hex` to do by itself, I've added a relatively simple skills system, which loads a prompt appendix if any of the ~~swear words~~ trigger words or phrases are used. This gives `hex` extra context when it's most likely needed.

## What did I gain?