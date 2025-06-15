---
title: iOS Shortcuts
tags:
  - ios
description: Playing around with iOS Shortcuts for fun and profit.
modified_timestamp: 2025-06-15T18:38:28+03:00
created_timestamp: 2025-06-14T22:17:48+03:00
date: 2025-06-14
type: project
---
[TOC]

When we're not spending our evenings behind a heavy metal door, one of the things I find myself fucking around with is iOS' Shortcuts app.
Yes yes, one of the reasons I switched to the iPhone was so that I'll stop screwing with my mobile device, but hear me out - Shortcuts are magical.

With iOS 26 it seems like Apple has fixed some gripes I've had with Shortcuts (e.g. not being able to return to your app/screen of origin after running a shortcut), and I've decided to use the opportunity to make a post where I can also share some of the shortcuts I use almost daily.

## Why Shortcuts?
Ever since I've test driven the iPhone 11 (i.e. just before I switched from Android) and checked out the Shortcuts app, then on iOS 17, I understood the power and comfort it brought to the average Apple user.

While Shortcuts could be easy as pie (i.e. vanilla), or complex as fuck (via Actions for Obsidian, Toolbox Pro, Actions and so on), in my personal experience I've found that unlike the alternatives on the other side of the fence (Automate, Tasker etc.), they don't necessarily require you to recite the Necronomicon or partake in IKEA summoning rituals to get them to do what you need them to do.

So I've decided to create some useful tools for myself, which became even more useful once I got an iPhone 15 Pro which has that fancy shortcut button.

## New Things
I am currently on iOS 26 Developer Beta, and looks like some of my gripes with Shortcuts have been resolved:
1. Apple have added a great "Get Current App" action which allows you to return to the app you were in prior to running the shortcut.

## What have I created?
### Uber Shortcut
> [!IMPORTANT]
> This shortcut requires an additional app - [Menu Box](https://apps.apple.com/us/app/menu-box/id6463440793).
> 
> Menu Box is a QoL app that allows you to create nicer looking menus, and is not a must. You can adapt the shortcut to use "Choose from List" instead.

> [!NOTE]
> iCloud Link: [https://www.icloud.com/shortcuts/92af31e498984175abb536b38b2469c2](https://www.icloud.com/shortcuts/92af31e498984175abb536b38b2469c2)
> 
> Direct File: N/A
> 
> Setup: An import question will ask for a folder where your shortcuts are located.

This shortcut allows me to launch a bunch of shortcuts with the shortcut button by showing me a menu with all the shortcuts from a specific folder.

### Action Button
> [!IMPORTANT]
> This shortcut requires an additional app - [Actions](https://apps.apple.com/us/app/actions/id1586435171).
> 
> Actions adds a shit ton of useful functionality to Shortcuts in general, and specifically the "Is Device Orientation" action that this shortcut uses.

> [!NOTE]
> iCloud Link: [https://www.icloud.com/shortcuts/c287352667b34193bb94399f3e1a53fe](https://www.icloud.com/shortcuts/c287352667b34193bb94399f3e1a53fe)
> 
> Direct File: N/A
> 
> Setup:
> 1. You can do something else instead of opening the camera if the device is horizontal.
> 2. Make sure to choose "Uber Shortcut" as the last action

I use the "Action Button" shortcut in tandem with Uber Shortcut to allow me to do two more actions. Think of this as a very, VERY simple context awareness.
1. If the device is locked, toggle Silent Mode.
2. If the device is horizontal, open the Camera.
3. Otherwise, run Uber Shortcut.

### Radio Picker
> [!NOTE]
> iCloud Link: [https://www.icloud.com/shortcuts/5a6bf701e653425e9559810b5df1801a](https://www.icloud.com/shortcuts/5a6bf701e653425e9559810b5df1801a)
> 
> Direct File: N/A
> 
> Setup: Add your own radio stations to the dictionary where `key -> value` is `station name -> station URL`.

A quick online radio picker, very useful when driving.

### Daily Quick Notes
> [!NOTE]
> iCloud Link: [https://www.icloud.com/shortcuts/e395214ecf8b4c1fa58facf3eda9a0fb](https://www.icloud.com/shortcuts/e395214ecf8b4c1fa58facf3eda9a0fb)
> 
> Direct File: N/A
> 
> Setup: N/A

This shortcut will ask for your note, and append it as `* <time in H:MM:SS format> <your note>` to a a daily note.
If the daily note doesn't exist, it will create it as `YYYY-MM-DD` and tag it as `#daily-note`.