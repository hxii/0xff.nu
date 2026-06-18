---
aliases: []
tags:
  - calendar
  - draft
created: "[[2026-05-31]]"
status: new
modified_timestamp: 2026-05-31T19:02:27+03:00
created_timestamp: 2026-05-31T18:18:18+03:00
title: Hxii's Calendar Spec
type: project
bucket: Productivity
---

## The Reason
Calendar organization is a skill that very few of us can truly master. I myself am very bad at wrangling the calendar, especially given that I try and maintain a [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) in this area as well which means I've got more than one calendar active.

In fact, I've got five of them:
- **Family Calendar** – Shared events relating to more than one family member
- **Personal Calendar** – Personal calendar for events relating only to me
- **Kids' Events Calendar** – Daycare events, reminders etc.
- **Work Calendar** – All work events
- **Work Blocks Calendar** – Since I can't share my work calendar with my wife, work events are being duplicated as blocks to this calendar which my wife does have access to

But even with a separation like the above, unless you have special software which has this custom feature, you have no ability to differentiate between the events on your calendar.
Can you at a quick glance understand what's the upcoming event, without looking at the title? What is just an "FYI" event? Which event requires you to be there not only in spirit but in person as well? Which event is more important than another in case of a conflict?

These questions and more are why I've decided to develop my own "spec" for calendar events, and I'd like to share it with you.

## The Goals
- **Identifiability** – I am able to identify the "core principle" of an event at a quick glance
- **Distinction** – I am able to identify the difference between adjacent events
- **Prioritization** – I am able to identify the priority of an event at a quick glance
- **Uniformity & Searchability** – The event title structure is uniform between similar events, which allows me to easily find events without having to guess their title

## The Spec
### Prefixes
Prefixes fulfill three of the goals above for me: identifiability, distinction and prioritization.

| Prefix | Meaning                                             |
| ------ | --------------------------------------------------- |
| 🚗     | Commute Required                                    |
| ☎️     | Phone meeting                                       |
| ℹ️     | Information/FYI event                               |
| ⚠️     | Attention required (in the context of the calendar) |
| 👤     | Meeting with a single person                        |
| 👥     | Meeting with multiple people                        |
| ❌      | Unavailability                                      |
| 🥪     | Lunch                                               |

