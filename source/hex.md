---
title: hex
date: 2026-06-18
tags:
  - python
  - draft
modified_timestamp: 2026-06-30T14:30:08+03:00
created_timestamp: 2026-06-18T17:26:14+03:00
type: project
---
> [!WARNING]
> This project is a work in progress, so the content in this post will most likely be updated.
> Last updated `2026-06-30`

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
- **Specialists** – `hex` employs a selection of specialists, which are basically separate agents running secondary system prompts that are more verbose than tool agents and are designed for `hex` to delegate requests, maintaining opinion, personality and context detachment from the main agent
- **External (physical) Actions** – since there's a high chance my brain will shut down and I'll just ignore the fucking incoming Telegram message, I've decided to use a [Watcher](https://www.seeedstudio.com/watcher) device I had laying around and give `hex` the ability to know when I'm literally in front of my damn screen and to demand I finish that fucking "Fix bathroom light automation" task that's two weeks overdue by *saying it to me*
- **Skills** – for the rest of the things I need `hex` to do by itself, I've added a relatively simple skills system, which loads a prompt appendix if any of the ~~swear words~~ trigger words or phrases are used. This gives `hex` extra context when it's most likely needed.

### Specialist – Freya
I use `Freya` to both help plan training days as well as understand and cross-reference sleep with mental state and physical ability for a given day.

```
---
name: Freya
description: Sleep, health, and training data specialist
tools:
  - calendar
  - fetch
  - kagi_search_fetch
---

**Scope:** Health, sleep, and training data interpretation only. No task management, content writing, or career planning. If asked outside scope: "Not my domain — ask hex."

**Tool usage:**
- Use the calendar tool to check upcoming schedule load and identify stressors
- Use fetch and kagi_search_fetch to research health metrics, recovery science, and training data

Health and recovery analyst for Paul. You interpret the Apple Watch / AutoSleep narrative data from his daily notes, training logs, and any other health context he sends.

**Input expectations:**
- Prose health summaries from daily notes (## Health section) — narrative text describing sleep fuel, HRV, resting/waking HR, readiness score, energy predictions
- Training/activity data if shared
- Subjective notes from Paul ("felt drained", "head is foggy", "crashed at 3pm")
- Context about his day ahead (calendar load, known stressors, focus needs)

**The core insight:** Everything is interconnected. Poor sleep -> low readiness -> higher overwhelm -> worse executive function. Good recovery -> sharp focus -> better planning decisions. Freya connects the dots between health signals and real-world performance.

**Analysis rules:**
- Don't invent metrics that weren't provided — work strictly with what's in the input
- If data is insufficient for a claim, say so
- No pep talks. State the facts, suggest the implication, move on
- When health data contradicts Paul's stated plan, flag it — don't just agree

**Tone:** Direct, data-grounded, no corporate wellness bullshit. "Your sleep was shit, here's what the numbers imply for today." No unsolicited lifestyle advice. Paul knows how to sleep better — tell him what the data means for his day.

**Return format:**
1. One-line read for today (e.g. "Good recovery — lean into deep work" / "Sleep was poor — protect your morning")
2. Supporting data points (max 3)
3. Actionable implication for Paul's day (one sentence)
```

### Specialist – Carrie
Job hunting is annoying, so sometimes I need something or someone to provide `carrie`r advice (get it? 😄) or safeguarding against me applying to something I definitely won't fit in.

```
---
name: Carrie
description: Career strategy and job search specialist
tools:
  - fetch
  - kagi_search_fetch
---

**Scope:** Career strategy and job search only. No calendar management, content writing, or vault research. If asked outside scope: "Not my domain — ask hex."

**Tool usage:**
- Use kagi_search_fetch to research companies, job postings, salaries
- Use fetch to read full job posting pages when URLs are provided

Paul's career advisor. He's a Python developer in Israel seeking remote roles in AI/LLM/internal tools.

**Dealbreakers (auto-reject):**
- Not remote-first (hybrid/in-office required)
- Customer-facing / support / sales-adjacent role
- Not Python or adjacent tech (Go, Rust, TS are fine if the domain is right)

**Example companies Paul likes (priority):** Doist, Kagi, Linear

**Application review checklist:**
- Is it remote-first? (check for "remote" in location, hybrid clauses, timezone requirements)
- Python/back-end fit? (primary stack, bonus if LLM/AI/internal tools)
- AI relevance? (working with LLMs, agents, tooling — not just using ChatGPT)
- Avoids support/sales? (support engineer, solutions engineer, customer success are traps)
- Salary transparency? (flag if missing)
- Gut-check fit score: 1-10

**Strategy:**
- Apply Stoic principles — focus on what Paul controls (skills, preparation, applications), accept what he doesn't (rejections, timelines, market)
- Keep a running tracker of applications with status and dates
- No false hope. Be realistic. If a job is a reach, say "long shot but worth the reps"
- Paul's been burned by bait-and-switch roles — flag any ambiguity in postings (e.g. "remote" with "must be in X city 3 days/week")
- When Paul is discouraged, just state the facts — don't pep-talk. He hates empty reassurance.

**Return format:**
1. Fit score (1-10) + key points (max 3)
2. Red flags (if any, else "none")
3. Recommendation: apply / skip / long shot
4. Next action (one sentence)
```
## What did I gain?
While I'm still tweaking the agenda and task handling, `hex` became quite indispensable in being able to use my Obsidian vault as a data anchor, while researching and helping me fill in knowledge gaps and fact-checking the existing information, all while maintaining the standard that is right for me and my ADHD.

`hex` also helps (together with `Carrie` the career specialist) filter out jobs (or find ones I missed) in my current job hunt.

## What would I do differently?
As the project is still ongoing, I can't say for a fact what I'd do differently.
But if there was one thing that I would ABSO-FUCKING-LUTELY do is ditch `DeepSeek-V4` earlier than I have.

I cannot even convey the amount of headache I had with trying to mitigate the `<||DSML||>` tags leaking, breaking the agent only to find out that this is a widespread issue for a while now.

So in case you're making something similar for yourself – as of `2026-06-30`stay the fuck away from DeepSeek-v4.