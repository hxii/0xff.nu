---
date: 2025-11-26
modified_timestamp: 2026-01-05T07:55:49+02:00
created_timestamp: 2025-11-26T12:50:31+02:00
tags:
  - adhd
  - automation
  - homeassistant
  - hide
  - draft
title: Automating ADHD
group: adhd
bucket: Productivity
---

> [!IMPORTANT]
> This article will be constantly updated with new solutions and improvements to existing solutions that I implement for myself.

> [!NOTE]
> The automations below require some hardware (sensors, zigbee radio) and software (Home Assistant), but can probably achieved with other combinations.
> Adapt the logic to your needs and constraints!

As I'm sure I wrote before – [I have ADHD](/productivity), which comes with a unique set of benefits, but also a fucking mountain of challenges. It is also the catalyst and driving force behind a large chunk of my personal projects.

And so, as part of my never-ending pursuit for improving and streamlining as much of my daily life as possible, I decided to try and tackle some of those annoying tasks that most of us (yes, even people that don't have "a little bit of ADHD") just tend to forget to do.

[TOC]
## Automatic

### Reminding me to cleaning the cats' litter-box
> [!NOTE]
> This can, and probably should, be further improved to complete existing tasks for example, instead of having to complete them manually.

- **Hardware** – Zigbee door/window sensor (magnetic reed switch or hall effect)
- **Software** – Todo app with an API integration in HomeAssistant

The principle of this automation, which actually has two parts, is both create a reminder that is based on completion date and nag me in case I forgot to remove the bio-hazard waste.

The magic is achieved by placing the magnetic switch on the drawer of the litter-box, which you ideally will only open when performing maintenance on the feline waste container.

### Reminding me to take my meds
> [!NOTE]
> Due to the configuration oddities of the sensor, fine-tuning this automation may be more difficult than necessary. But with some extra logic you'll be able to do it!

## Interaction Based
### Reminding me to buy cat food and litter