---
title: peek
tags:
  - python
  - project
date: 2026-03-27
modified_timestamp: 2026-05-06T15:28:09+03:00
created_timestamp: 2026-05-06T15:21:07+03:00
description: Terminal-based (TUI) network monitoring dashboard
---
> [!WARNING]
> `peek` was a tool of necessity that was coded with LLM assistance due to lack of time.
> This means that bugs are more likely.

Yesterday (2026-03-26) we experienced a power outage, and I realized that I'm a dumbass and that all of my monitoring abilities are inaccessible. The reason being is that Prom-Grafana is located on our NAS while Uptime Kuma is on the RPi together with HomeAssistant, and until everything is loaded I can't access either.

I was hoping (and trying!) to find a tool similar to [Uptime Kuma](https://github.com/louislam/uptime-kuma) that works locally via CLI, but I couldn't find anything that does what I needed it to do.

In true ADHD fashion, I decided to fuck around a little bit and get something quick running locally, but unfortunately, due to the same fucking ADHD and the multitude of other things I want to do and being a dad – I decided to offload the brunt of the work to Mr. Opencode.

Thus, `peek` was born.
## What
The focus of `peek` was, and is to offer the functionality that I personally needed from it, hence it most definitely is NOT feature complete, but will probably help in a pinch.

`peek` uses YAML syntax for the configuration, which it will try to load from `~/.config/peek/config.yaml`. If the path does not exist, `peek` will try to initialize it.

### Monitor Types
- `ping` – Regular, run of the mill ping
- `tcp` - TCP ping using a specific `port`
- `dns` - DNS resolution
- `http` – HTTP response code

### Other Features
- Grouping: To make the list easier to filter, you can define `groups` and assign `target` to them
- Monitor heartbeat frequency configurable via `interval`, and `timeout`

## Installation
The recommended way to install `peek` is using `uv`:

```shell
uv tool install git+https://github.com/hxii/peek.git
```