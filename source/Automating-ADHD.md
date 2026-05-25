---
date: 2025-11-26
modified_timestamp: 2026-05-24T14:44:50+03:00
created_timestamp: 2025-11-26T12:50:31+02:00
tags:
  - adhd
  - automation
  - homeassistant
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

I often forget to take my meds in the morning, especially with how hectic some mornings may be, and even though my phone gently nudges me to take the meds at 8:35AM (and then ~~punches me in the ribs~~ yells much louder at 9:15AM), I will still forget to do so.

So I came up with a solution through HomeAssistant to keep annoying me until I take my meds.

#### Hardware Requirements
- Vibration sensor that can report [XYZ](https://www.zigbee2mqtt.io/supported-devices/#e=x_axis) or [tilt](https://www.zigbee2mqtt.io/supported-devices/#e=tilt) and can comfortably fit in/on your jar
- A jar or a box that can safely store medicine
#### The Setup

1. Create a **Input Boolean** helper in [helpers](https://my.home-assistant.io/redirect/helpers/). I called mine `Paul Meds Taken` and gave it the `mdi:pill` icon
2. Create a reset **Automation** in [automations](https://my.home-assistant.io/redirect/automations/). The gist is to reset the boolean at midnight
```YAML
alias: Reset Meds Taken Status
description: >-
  Automatically reset the medication status to 'not taken' at midnight if it was
  marked as taken.
triggers:
  - trigger: time
    at: "00:00:00"
conditions: []
actions:
  - action: input_boolean.turn_off
    metadata: {}
    data: {}
    target:
      entity_id: input_boolean.paul_meds_taken
mode: single
```
3. Create a reminder **Automation** which will constantly nag you to take your meds, until the boolean you created earlier is set as `true`.
> [!NOTE]
> For my automation, I also included the phone location, as if I'm not home (which is where the drugs are) there's no reason to constantly nag me.
```YAML
alias: "Reminder to Take Meds"
description: Automatically reminds Paul to take his medications every hour if not done by 12 PM.
triggers:
  - trigger: time_pattern
    hours: /1 #Reminder every hour
conditions:
  - condition: and
    conditions:
      - condition: time
        after: "08:00:00"
        before: "12:00:00"
      - condition: state
        entity_id: input_boolean.paul_meds_taken
        state:
          - "off"
      - condition: zone
        entity_id: person.paul
        zone: zone.home_city
actions:
  - action: notify.mobile_app_phoney
    metadata: {}
    data:
      message: 💊 TAKE YOUR MEDS
      title: 💊 TAKE YOUR MEDS
mode: single   
```
4. Create an **Automation** to indicate you've taken your government-issued brain medication.
> [!NOTE]
> Note the zone check in this automation. It's there to prevent turning the automation off by mistake in case my wife decides to pick up the happiness jar.
```YAML
alias: Paul – Cancel Medication Reminder
description: >-
  This automation activates when the medbox lid is tilted and sets
  the helper as true meaning meds taken.
triggers:
  - trigger: state
    entity_id:
      - binary_sensor.medbox_vibration_sensor_tilt
    from:
      - "off"
    to:
      - "on"
    for:
      hours: 0
      minutes: 0
      seconds: 3
conditions:
  - condition: and
    conditions:
      - condition: time
        after: "07:00:00"
      - condition: state
        entity_id: input_boolean.paul_meds_taken
        state:
          - "off"
      - condition: zone
        entity_id: person.paul
        zone: zone.home_city
actions:
  - action: input_boolean.turn_on
    metadata: {}
    data: {}
    target:
      entity_id: input_boolean.paul_meds_taken
  - action: notify.ntfy_home
    metadata: {}
    data:
      title: MedBox
      message: Paul took his meds
mode: single
```

> [!NOTE] Wife's Version
> I ended up being able to convince my wife to allow me to create a similar automation for her, as she also seldom forgets to partake in the medicinal journey, albeit with her own pills.
> She however, did not want to put her medication in a small jar with a vibration sensor glued to it, so I proposed a different solution for her. The principle is the same to the one I use, but the activation is different.
> 
> 1. Wife forgets to take her medication
> 2. A notification is being broadcast through **NTFY** as well as the living room smart speaker
> 3. Wife scans an **NFC Tag** which runs a **iOS Shortcuts Automation** 
> 4. The automation pens the **Health** app on the Medication view and executes a **HomeAssistant Automation** which sends a **NTFY** notification and sets the **Input Boolean** to true
## Interaction Based
### Reminding me to buy cat food and litter

### Important Shopping List