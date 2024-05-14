---
date: 2024-05-14
tags: project,python
title: Boku
---
![Boku Header Image](boku.png)

!!! important "Important"
    Boku is still under active development, and some features (those that are intended to be included, that is) are missing.

*Boku* (僕, servant in Japanese) is a simple, sequential YAML task runner written in Python.

[Get it on SourceHut](https://git.sr.ht/~hxii/boku), [Report a Problem](https://todo.sr.ht/~hxii/boku).

## Why
The idea for *boku* came from my dayjob, where we developed a robust onboarding script that takes care of setting up development environments for new onboardees.

The onboarding script we use is robust and comfortable, but requires knowledge in Python to be able to add even the simplest of tasks to it. Moreover, each addition requires the binary to be recompiled and redistributed, so the portability and versatility of this tool suffers as a result.

*Boku* then comes to bridge this gap, yet is not intended to replace much more robust tools in order to keep it's simplicity.

The TL;DR is - 
1. Was bored
2. Thought it might be useful because I personally need it
3. Learning experience \o/

## What
The features currently included in Boku are as follows:
- Simple, YAML syntax to define tasks. Tasks are sequential, thus depend on each other by default.
- Parametrized command execution allows to run the same command for a set of parameters:
```YAML
brew_formulae:
description: Install brew formulae
run: brew install {}
each:
    - fzf
    - fish
    - broot
```
- Support for helpers as prerequisites for tasks, for example:
```YAML
helpers:
  sudo:
    description: "Sudo helper command"
    run: sudo ls
tasks:
  install_brew:
    description: Install Homebrew
    prerequisites: helpers.sudo
    run: NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
- Support for running remote or piped tasks: `curl -fsSL https://myrepooftasks.com/task.yaml | boku --dry_run -`.

For the rest of the features, please see the [repository on SourceHut](https://git.sr.ht/~hxii/boku).

## How
*Boku* uses [PyYAML](https://github.com/yaml/pyyaml) to read the YAML files, and [Cerberus](https://github.com/pyeve/cerberus) to validate the schema.
The rest of the parsing happens in the code, and tasks are run via Python's [subprocess module](https://docs.python.org/3/library/subprocess.html).

## Examples
If you found *Boku* useful, please feel free to contribute some example tasks to this section.
Get in touch via [Twitter](https://twitter.com/paulglushak) or [Mastodon](https://merveilles.town/@hxii).