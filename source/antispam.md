---
title: hxii's AntiSpam
date: 2021-03-03
tags: project, webdev
type: project
description: A simple, lightweight spam prevention feature
group: experiments
bucket: PHP
modified_timestamp: 2025-12-28T17:21:42+02:00
created_timestamp: 2025-04-14T17:13:49+03:00
---
Recently I've finally decided to deal with the spam problem I've been having while using [FormSubmit](https://formsubmit.io/).
Despite FormSubmit having their own spam prevention methods, I was still receiving pointless emails from bots using the form:

![Example of spam](https://0xff.nu/i/Darkslategray-79c80cb8f907aa23.jpg)
![Example of spam no.2](https://0xff.nu/i/Skeletal-c73774c817d7400f.jpg)

As banning specific IPs is as effective as chasing your own tail, I've decided to employ a fairly simple concept - a honeypot.
To make it a bit more interesting, and most importantly educational, I've decided to code the solution by myself.

## The Concept
As the form I'm using is quite basic (only the comment field is available), I've added a couple of honeypot fields that under no normal circumstance will be filled out by people: name, last name and email:
```HTML
<input name="email" id="email" type="hidden" value="">
<input name="name" id="name" type="text" autocomplete="off" style="opacity:0;position:absolute;z-index:-1;top:0;left:0;height:0;width:0" tabindex="-1">
<input name="lastname" id="lastname" type="text" autocomplete="off" style="opacity:0;position:absolute;z-index:-1;top:0;left:0;height:0;width:0" tabindex="-1">
```
> *Note*: As you can see, I'm using two different methods of hiding the fields - a `type="hidden"` field and using CSS. This is to try and maximize the chances of capturing the bots filling out the form.

I wanted to not only prevent these bots from sending me an email when specific fields were filled out, but also provide a way to flag these bots from using the contact form even if the field were not filled out.

To do this, I use a file that contains [filtering rules](http://wiki.0xff.nu/antispam#example-rules) that the client goes through every time the form is submitted. 

I also wanted to give falsely flagged people a way to tell me that they've been flagged, so each infraction gets a reference code which I can match against the log.

## The Code
### Overview
The way the code works is as follows:

```PRE
Page with contact form ---> Redirector ---> FormSubmit
                               | |
                               | |
                            AntiSpam Code
```
1. The user (or bot) submits the form on any given page.
2. The form action is `redirector.php` instead of the FormSubmit URL.
3. The redirector performs the following actions:
    1. Asks the AntiSpam code if the user is already banned.
    2. If the user is not banned, checks if the honeypot fields were filled out and bans them.
    3. If the user passed, recreates the form with the needed fields and performs a submit action.
4. The users comment is sent to FormSubmit.

### Filtering and identification
The parameters that sent and checked against the rules are:
- User agent.
- IP address.
- Referrer.
- Payload - JSON encoded form fields.
- Signature - MD5 encoded base64 string of IP and UA concatenated.

If a user that triggered the system doesn't match any of the rules, the signature is automatically added.

### Reference
Each time a banned user uses the form and is redirected to the error page gets a reference ID: `"r$rule-".md5(base64_encode($date.$id));`.

In case the user was falsely flagged, this reference ID will allow you to search the entry in the log by the hash and tell you which rule (line number) prevented them from submitting the form.

## The Outro
This code is not ideal and (potentially) has many flaws. It is provided as is for educational purposes and may be updated as I learn of new ways to combat this crap.
You can see the entire code on [Github](https://github.com/hxii/AntiSpam) or [Sourcehut](https://git.sr.ht/~hxii/AntiSpam) as well as check out some [example rules](http://wiki.0xff.nu/antispam#example-rules).

In my experience, it's quite effective:
```LOG
2021-02-28T12:05:43+00:00 (r3-674e131fb162dc4e7ccd6a87028d70f0) - ip:188.213.34.38
2021-02-28T19:45:48+00:00 (r3-7806599467a5432b9a568ad8b800102a) - ip:188.213.34.38
2021-03-01T06:17:45+00:00 (r21-5058982c9c12d90c95b8ac7b65bb1eb7) - ip:157.97.132.45
2021-03-01T22:31:20+00:00 (r3-fac0418d0930a85dca8a071a4e462de2) - ip:93.195.6.226
2021-03-01T22:31:33+00:00 (r3-2d4686639298ab49529283678fa5682b) - ip:93.195.6.226
2021-03-02T19:57:47+00:00 (r22-19a0125fba262757bdc25aa589e87014) - ip:45.141.156.59
2021-03-02T23:48:34+00:00 (r23-8621d510194c9f964b2bb413bdfd242e) - ip:45.141.156.59
2021-03-04T05:12:48+00:00 (r24-d7574c2ccbbd59ef915debaa51b8e00d) - ip:45.12.177.112
2021-03-04T14:15:23+00:00 (r25-8390eeb2234b4ff5ab187c3c13e083ed) - ip:103.197.168.14
```
