---
aliases: []
tags:
  - hide
  - draft
created: "[[Daily/2026-09-29]]"
modified_timestamp: 2026-09-29T13:44:18+03:00
created_timestamp: 2026-09-29T13:32:17+03:00
title: pi coding harness
date: 2026-09-29
---
Below you can find the extensions I created for my own setup of `pi` in order to leverage smaller, local models.
The focus was to try reduce the load on limited hardware and give the harness efficient tools to manage it's own state, catch common local model pitfalls and so on.

[toc]

## Aniki
*Aniki*, older brother in Japanese (兄貴) is an extension that acts as a helper and supervisor to a local (or, well, any model you choose) model in order to help steer it in the right direction when doing work.

## Overthinker
*Overthinker* is designed to try catch and prevent a local model from looping, over-thinking and second-guessing itself during reasoning.

## Lean
*Lean* is there to prevent loading unnecessary tools in order to reduce the context size.

## Quest
*Quest* is essentially three things:
- Task tracking and management in `TODO.md` via `/t`
- Managing a singular goal that unifies tasks in `GOAL.md` via `/quest`
- Result-driven auto-pilot of a goal via `/embark`