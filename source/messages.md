---
title: Messages
date: 2026-11-07
tags:
type: page
stricon: R0lGODlhEAAQAPIGAJaWloGBgXNzc1dXVyIiIgAAAAAAAAAAACH5BAUKAAYALAAAAAAQABAAQANAaLrcWkBIQqkcZUHJOchagBUk6DwQoJLNNlXEZbrdgDHsqWvlnnYrXIQTi8kew4nAKLghicujJmKr5kLXnbaRAAA7
description: Short posts, streamed from Bluesky.
modified_timestamp: 2026-11-08T17:34:25+02:00
created_timestamp: 2026-11-07T01:00:25+02:00
---
	
A stream of messages from my [BlueSky](https://bsky.app/profile/0xff.nu) account.

<div class="micro-stream" id="micro-stream"></div>
<script>
(function () {
  var root = document.currentScript && document.currentScript.closest(".modal-body");
  var box = root ? root.querySelector(".micro-stream") : document.getElementById("micro-stream");
  if (!box || box.dataset.mounted) return;
  box.dataset.mounted = "1";
  var status = document.createElement("p");
  status.className = "stream-status";
  status.textContent = "Loading posts...";
  box.appendChild(status);
  fetch("https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=0xff.nu&limit=20")
    .then(function (r) { if (!r.ok) throw new Error("feed " + r.status); return r.json(); })
    .then(function (data) {
      var feed = (data.feed || []).filter(function (i) { return i.post && i.post.record && i.post.record.text; });
      if (!feed.length) { status.textContent = "No posts yet."; return; }
      status.remove();
      feed.forEach(function (item) {
        var rkey = item.post.uri.split("/").pop();
        var handle = (item.post.author && item.post.author.handle) || "0xff.nu";
        var rec = item.post.record;
        var a = document.createElement("a");
        a.className = "micro-post";
        a.href = "https://bsky.app/profile/" + handle + "/post/" + rkey;
        a.target = "_blank";
        a.rel = "noopener";
        var kind = "post";
        if (item.reason) kind = "repost";
        else if (rec.reply) kind = "reply";
        else if (rec.embed && String(rec.embed["$type"]).indexOf("record") > -1) kind = "quote";
        var when = document.createElement("time");
        when.className = "micro-when";
        when.dateTime = rec.createdAt;
        when.textContent = rec.createdAt.slice(0, 16).replace("T", " ") + " - " + kind;
        if (rec.reply && rec.reply.parent && rec.reply.parent.uri) when.dataset.parent = rec.reply.parent.uri;
        var text = document.createElement("span");
        text.className = "micro-text";
        text.textContent = rec.text;
        a.appendChild(when);
        a.appendChild(text);
        box.appendChild(a);
      });
      box.querySelectorAll("time[data-parent]").forEach(function (t) {
        fetch("https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=" + encodeURIComponent(t.dataset.parent) + "&depth=0")
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var h = j.thread && j.thread.post && j.thread.post.author && j.thread.post.author.handle;
            if (h) t.textContent += " to @" + h;
          })
          .catch(function () {});
      });
    })
    .catch(function (err) {
      status.textContent = "Could not load posts.";
      console.error(err);
    });
})();
</script>
