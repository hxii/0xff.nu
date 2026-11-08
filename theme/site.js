(() => {
  var W_MIN = 300, H_MIN = 180;
  var DRAG_THRESHOLD = 3; // px before a press becomes a drag

  function defaultView() {
    return {
      width: Math.max(W_MIN, Math.floor(modalLayer.clientWidth / 2)),
      height: Math.max(H_MIN, Math.floor(modalLayer.clientHeight / 2)),
    };
  }

  function maxView() {
    return {
      width: Math.max(W_MIN, modalLayer.clientWidth - 8),
      height: Math.max(H_MIN, modalLayer.clientHeight - 8),
    };
  }

  function openAtDefault(modal) {
    // the About panel is a small fixed card; CSS owns its size
    if (modal.classList.contains("about")) return;
    var v = defaultView();
    modal.style.width = v.width + "px";
    modal.style.height = v.height + "px";
    return v;
  }

  var modalLayer = document.querySelector(".modal-layer");
  var popup = document.querySelector(".popup");
  var modals = []; // stack, top = most recent
  var modalSeq = 0; // names each window, so a link can name its host
  var frontTitle = document.getElementById("front-title");

  // on a phone the desktop is a list: nothing drags, a tap opens
  var NARROW = window.matchMedia ? window.matchMedia("(max-width: 720px)") : { matches: false };

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // desktop objects and find results ship their metadata as data-*;
  // tiles only ship tags and desc, so title and date come from the
  // visible .tile-title / .tile-date text
  function noteData(el) {
    var titleEl = el.querySelector ? el.querySelector(".tile-title") : null;
    var dateEl = el.querySelector ? el.querySelector(".tile-date") : null;
    return {
      key: el.dataset.key || "",
      title: el.dataset.title || (titleEl ? titleEl.textContent.trim() : ""),
      date: el.dataset.date || (dateEl ? dateEl.textContent.trim() : ""),
      tags: el.dataset.tags || "",
      desc: el.dataset.desc || "",
    };
  }

  function showPopup(item) {
    if (!popup) return;
    var data = noteData(item);
    var day = data.date;
    var tags = data.tags ? (item.dataset.tags ? data.tags.split(",").map((t) => `#${t}`).join(" ") : data.tags) : "";
    var desc = data.desc;
    var title = data.title;
    var count = item.dataset.count;

    var rows = "";
    if (day) rows += `<dt>date</dt><dd>${esc(day)}</dd>`;
    if (tags) {
      rows += `<dt>tags</dt><dd>${esc(tags)}</dd>`;
    }
    if (count) rows += `<dt>contents</dt><dd>${esc(count)} notes</dd>`;
    if (item.dataset.filter) {
      rows +=
        "<dt>" +
        esc(item.dataset.filterLabel || "filter") +
        '</dt><dd><code class="p-query">' +
        esc(item.dataset.filter) +
        "</code></dd>";
    }

    if (item.dataset.key) {
      rows +=
        '<dt>link</dt><dd><button class="p-link" type="button" data-key="' +
        esc(item.dataset.key) +
        '">#' +
        esc(item.dataset.key) +
        "</button></dd>";
    }

    var html = `<div class="p-title">${esc(title)}</div>`;
    if (rows) html += `<dl class="p-grid">${rows}</dl>`;
    if (desc) html += `<div class="p-desc">${esc(desc)}</div>`;
    popup.innerHTML = html;
    popup.classList.add("open");

    var link = popup.querySelector(".p-link");
    if (link) {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
        var url = `${location.href.split("#")[0]}#${link.dataset.key}`;
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(url);
        }
        link.textContent = "copied";
        setTimeout(() => {
          link.textContent = `#${link.dataset.key}`;
        }, 1200);
      });
    }

    // next to the object: right if there is room, otherwise left.
    // an object inside a window puts the popup beside the window, so
    // it never covers the notes.
    var box = item.getBoundingClientRect();
    var width = popup.offsetWidth;
    var height = popup.offsetHeight;
    var parent = closest(item, ".modal");
    var left;
    var top2 = box.top;

    if (parent) {
      var pr = parent.getBoundingClientRect();
      left = pr.right + 8;
      if (left + width > window.innerWidth - 8) left = pr.left - width - 8;
      top2 = pr.top;
    } else {
      left = box.right + 10;
      if (left + width > window.innerWidth - 8) left = box.left - width - 10;
      if (left < 8) left = Math.max(8, box.left);
    }

    if (top2 + height > window.innerHeight - 8) top2 = window.innerHeight - height - 8;
    popup.style.left = `${Math.max(8, left)}px`;
    popup.style.top = `${Math.max(8, top2)}px`;
  }

  function hidePopup() {
    if (!popup) return;
    popup.classList.remove("open");
  }

  // Search template contents; a note can appear in more than one folder.
  function setupFind(modal) {
    var field = modal.querySelector(".find-field");
    var results = modal.querySelector(".find-results");
    if (!field || !results) return;

    var rows = [];
    document.querySelectorAll(".templates template").forEach((box) => {
      box.content.querySelectorAll(".tile").forEach((row) => {
        rows.push(row);
      });
    });

    function titleOf(row) {
      return noteData(row).title || row.dataset.key;
    }

    // a result carries the same data as a tile, so the existing
    // click handlers treat it as one and open the note
    function addResult(row) {
      var data = noteData(row);
      var item = document.createElement("li");
      item.className = "row";
      item.dataset.key = data.key;
      item.dataset.date = data.date;
      item.dataset.tags = row.dataset.tags || data.tags.replace(/#/g, "").split(/\s+/).filter(Boolean).join(",");
      item.dataset.desc = data.desc;
      item.dataset.title = data.title;
      item.textContent = data.title;
      results.appendChild(item);
    }

    function renderResults(query) {
      var term = (query || "").toLowerCase().trim();
      var seen = new Set();
      var shown = 0;
      var row;
      var key;
      var words;
      var none;
      results.replaceChildren();
      if (!term) return;
      for (var i = 0; i < rows.length; i++) {
        if (shown >= 50) break;
        row = rows[i];
        key = row.dataset.key;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        var data = noteData(row);
        words = data.title + " " + data.tags + " " + data.desc + " " + data.date;
        if (words.toLowerCase().indexOf(term) < 0) continue;
        addResult(row);
        shown++;
      }
      if (shown) return;
      none = document.createElement("li");
      none.className = "find-empty";
      none.textContent = "No matches";
      results.appendChild(none);
    }

    field.addEventListener("input", () => {
      renderResults(field.value);
    });
    field.focus();
  }

  function closest(target, sel) {
    return target?.closest ? target.closest(sel) : null;
  }

  var noteIndexCache = null;
  var pendingNotes = new Set();

  function noteRecords() {
    if (noteIndexCache) return noteIndexCache;
    var index = document.getElementById("note-index");
    noteIndexCache = window.noteIndex || (index ? JSON.parse(index.textContent) : []);
    return noteIndexCache;
  }

  function noteUrlForKey(key) {
    if (!key?.startsWith("note:")) return null;
    var record = noteRecords().find((note) => note.key === key);
    return record?.url || null;
  }

  var notePaths = null;

  function keyForLink(anchor) {
    var href = anchor.getAttribute("href") || "";
    if (!href || href.charAt(0) === "#") return null;
    var url;
    try {
      url = new URL(href, location.href);
    } catch {
      return null;
    }
    if (url.origin !== location.origin) return null;
    if (!notePaths) {
      notePaths = {};
      noteRecords().forEach((note) => {
        var path = new URL(note.url, location.href).pathname
          .replace(/\/index\.html$/, "")
          .replace(/\/$/, "");
        notePaths[path.toLowerCase()] = note.key;
      });
    }
    var path = url.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "");
    return notePaths[path.toLowerCase()] || null;
  }

  // A link inside a note body that names another note opens it as a
  // window, so the desktop stays in place. External links, images,
  // in-page anchors and unknown paths keep their normal behavior.
  function openLinkedNote(anchor, key, host) {
    var url;
    try {
      url = new URL(anchor.href, location.href);
    } catch {
      return;
    }
    if (host && modals.indexOf(host) >= 0) raise(host);
    var win = host || modals[modals.length - 1];
    var dest = win
      ? navigate(win, key, host ? host.id : null)
      : openModal(key, host ? host.id : null);
    dest.then(() => {
      var id = url.hash ? decodeURIComponent(url.hash.slice(1)) : "";
      var target = id && document.getElementById(id);
      var child = modals[modals.length - 1];
      if (target && child && child.dataset.key === key && child.contains(target)) {
        target.scrollIntoView();
      }
    });
  }

  // a cloned note keeps its scripts inert: re-create them so they run
  function runScripts(root) {
    root.querySelectorAll("script").forEach((old) => {
      var s = document.createElement("script");
      for (var i = 0; i < old.attributes.length; i++) s.setAttribute(old.attributes[i].name, old.attributes[i].value);
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
  }

  async function fetchNoteWindow(url) {
    var response = await fetch(url);
    if (!response.ok) throw new Error(`note page returned ${response.status}`);
    var page = new DOMParser().parseFromString(await response.text(), "text/html");
    var source = page.querySelector(".static-note");
    if (!source) throw new Error(`note page has no .static-note: ${url}`);
    var modal = source.cloneNode(true);
    modal.classList.remove("static-note", "is-front");
    modal.removeAttribute("style");
    if (modal.querySelector(".image-view")) modal.classList.add("iv");
    return modal;
  }

  function wireViewerInfo(modal) {
    var info = document.createElement("span");
    info.className = "iv-info";
    info.setAttribute("aria-label", "Info");
    info.title = "Info";
    info.addEventListener("click", (e) => {
      e.stopPropagation();
      modal.classList.toggle("show-info");
    });
    modal.querySelector(".modal-head").appendChild(info);
  }

  function tpl(key) {
    var node = document.querySelector(`.modal-tpl[data-key="${CSS.escape(key)}"]`);
    if (!node) throw new Error(`modal template missing for "${key}"`);
    return node.content.firstElementChild.cloneNode(true);
  }

  function ownerEl(modal) {
    return modal.dataset.owner ? document.getElementById(modal.dataset.owner) : null;
  }

  function removeModal(modal) {
    var owner = modal.ownerNode || ownerEl(modal);
    if (owner) owner.classList.remove("opened");
    if (modal._loadingToken) modal._loadingToken.cancelled = true;
    modal._loadingKey = null; // a closed window's page must not land
    modal._loadingPromise = null;
    modal.remove();
  }

  // Closing a window closes the windows it fathered: their owner
  // object left the document with it.
  function closeModal(modal) {
    var i = modals.indexOf(modal);
    if (i >= 0) modals.splice(i, 1);
    removeModal(modal);
    modals = modals.filter((m) => {
      if (m.ownerNode && !m.ownerNode.isConnected) {
        m.remove();
        return false;
      }
      return true;
    });
    markFront();
    var top = modals[modals.length - 1];
    writeHash(top ? top.dataset.key : "");
  }

  function hideTop() {
    var top = modals[modals.length - 1];
    if (top) closeModal(top);
  }

  // Stack order and DOM order stay the same, so the visible top window
  // is always the one the stack means. A window is never moved in the
  // DOM between mousedown and mouseup — Chrome cancels the click.
  function raise(modal) {
    var i = modals.indexOf(modal);
    if (i >= 0) modals.splice(i, 1);
    modals.push(modal);
    if (modalLayer.lastElementChild !== modal) modalLayer.appendChild(modal);
    markFront();
  }

  function markFront() {
    var top = modals[modals.length - 1];
    for (var i = 0; i < modals.length; i++) {
      modals[i].classList.toggle("is-front", modals[i] === top);
      modals[i].dataset.depth = modals.length - 1 - i; // 0 = front window
    }
    modalLayer.classList.toggle("has-stack", modals.length > 1);
    if (!frontTitle) return;
    var title = top?.querySelector(".modal-head .title");
    frontTitle.textContent = title ? title.textContent.trim() : "";
  }

  function placeModal(modal, ownerId, key) {
    // a maximized window already fills the desktop: there is no
    // "beside the owner" left to compute. Unset on restore so
    // the window resumes normal placement on the next
    // maximize/drag cycle.
    if (modal.dataset.max === "1") {
      modal.style.left = "4px";
      modal.style.top = "4px";
      return;
    }
    // The About window belongs in a corner: it is open from the start,
    // like a screen saver, and should not sit on top of the icons.
    if (key === "about") {
      modal.style.left = `${Math.max(4, modalLayer.clientWidth - modal.offsetWidth - 16)}px`;
      modal.style.top = `${Math.max(4, modalLayer.clientHeight - modal.offsetHeight - 16)}px`;
      return;
    }
    // Put the window beside what opened it, so both stay visible:
    // beside the desktop item, or beside the folder window that
    // holds the project. Stacked windows cascade from there.
    var n = modals.length;
    var item = ownerId ? document.getElementById(ownerId) : null;
    var x = 60 + n * 26;
    var y = 30 + n * 22;
    if (item) {
      var parent = closest(item, ".modal");
      if (parent) {
        var pr = parent.getBoundingClientRect();
        var lr = modalLayer.getBoundingClientRect();
        x = pr.right - lr.left + 12;
        y = pr.top - lr.top;
        if (x + modal.offsetWidth + 12 > lr.width) {
          x = pr.left - lr.left;
          y = pr.bottom - lr.top + 12;
        }
      } else {
        var right = item.offsetLeft + item.offsetWidth + 20;
        var below = item.offsetTop + item.offsetHeight + 20;
        if (right + modal.offsetWidth + 20 < modalLayer.clientWidth) x = right;
        else if (below + modal.offsetHeight + 20 < modalLayer.clientHeight) {
          x = item.offsetLeft;
          y = below;
        } else {
          x = Math.max(10, item.offsetLeft - modal.offsetWidth - 20);
          y = item.offsetTop;
        }
      }
    }
    x = Math.max(4, Math.min(x, modalLayer.clientWidth - modal.offsetWidth - 4));
    y = Math.max(4, Math.min(y, modalLayer.clientHeight - modal.offsetHeight - 4));
    modal.style.left = `${x}px`;
    modal.style.top = `${y}px`;
  }

  async function openModal(key, ownerId) {
    // a note opens one window; a second look just raises it
    for (var i = 0; i < modals.length; i++) {
      if ((modals[i]._openedKey || modals[i].dataset.key) === key) {
        raise(modals[i]);
        return;
      }
    }
    var modal;
    if (key.startsWith("note:")) {
      if (pendingNotes.has(key)) return;
      pendingNotes.add(key);
      try {
        var url = noteUrlForKey(key);
        if (!url) return;
        modal = await fetchNoteWindow(url);
      } catch (err) {
        console.error("Failed to open note ", key, err);
        return;
      } finally {
        pendingNotes.delete(key);
      }
    } else {
      modal = tpl(key);
    }
    modal.dataset.key = key;
    modal._openedKey = key; // saved geometry belongs to this key, not
    // the page the window has navigated to in the meantime
    if (!modal.id) {
      modalSeq += 1;
      modal.id = `window-${modalSeq}`;
    }
    if (ownerId) {
      modal.dataset.owner = ownerId;
      modal.ownerNode = document.getElementById(ownerId);
    }
    modal.style.display = "flex";
    modalLayer.appendChild(modal);
    runScripts(modal);
    if (!modal.classList.contains("iv")) openAtDefault(modal);
    placeModal(modal, ownerId, key);
    wireModal(modal);
    modals.push(modal);
    modal.history = [];
    markFront();
    writeHash(key);
  }

  // One window, many pages: opening an entry swaps the contents of the
  // open window instead of stacking a new one, so the folder stays
  // inside its frame and the nesting reads as hierarchy. The window
  // keeps a history of pages; back pops one, close clears the whole
  // window. An image entry keeps its own viewer window instead:
  // wireModal only wires the viewer branch at creation time.
  function snapshot(node, key, clone) {
    var info = node.querySelector(".modal-info");
    var body = node.querySelector(".modal-body");
    // a live modal's page title sits in its own row under the head;
    // a fetched page carries its title in the head itself
    var stackEl = node._stackEl;
    var rows = stackEl ? [...stackEl.querySelectorAll(".page-title")] : [];
    var title =
      rows.length > 0
        ? rows[rows.length - 1].querySelector(".pt-title")?.innerHTML || ""
        : node.querySelector(".modal-head .title")?.innerHTML || "";
    return {
      key: key,
      title: title,
      info: info ? (clone ? info.cloneNode(true) : info) : null,
      body: body ? (clone ? body.cloneNode(true) : body) : null,
      iv: node.classList.contains("iv"),
    };
  }

  function showPage(modal, page) {
    modal.dataset.key = page.key;
    // the head title belongs to the container and never changes;
    // each entry in the history plus the current page gets its
    // own row in the title stack under the head
    renderStack(modal, page);
    var infoEl = modal.querySelector(".modal-info");
    if (infoEl && page.info) infoEl.replaceWith(page.info);
    else if (!infoEl && page.info) {
      var anchor = modal._stackEl || modal.querySelector(".modal-head");
      anchor.after(page.info);
    } else if (infoEl && !page.info) infoEl.remove();
    var bodyEl = modal.querySelector(".modal-body");
    if (bodyEl && page.body) bodyEl.replaceWith(page.body);
    else if (bodyEl && !page.body) bodyEl.remove();
    // an image page brings its own sizing into the window, but
    // the inline half-desktop size still owns the geometry
    modal.classList.toggle("iv", !!page.iv);
    var viewerInfo = modal.querySelector(".iv-info");
    if (viewerInfo) viewerInfo.remove();
    if (page.iv) wireViewerInfo(modal);
    setupFind(modal); // Restored search fields are clones without listeners.
    runScripts(modal);
    markFront();
    writeHash(page.key);
  }

  function navigate(modal, key, ownerId) {
    // one fetch at a time per window: a second tap on the same tile
    // while a page is still loading joins the first request. Each
    // request carries a token, and only the current token may write
    // the page or clear the loading state: an older request for A
    // must not land after navigation A, B, A, and Back or Close
    // invalidates whatever is still flying.
    if (key.startsWith("note:") && modal._loadingKey === key)
      return modal._loadingPromise || Promise.resolve(); // same page: join it
    if (modal._loadingToken) modal._loadingToken.cancelled = true; // a different page takes over
    if (key.startsWith("note:")) {
      var url = noteUrlForKey(key);
      if (!url) return Promise.resolve();
      var token = { cancelled: false };
      modal._loadingToken = token;
      modal._loadingKey = key;
      modal._loadingPromise = fetchNoteWindow(url)
        .then((node) => {
          if (token.cancelled || modal._loadingToken !== token) return;
          modal.history.push(snapshot(modal, modal.dataset.key, true));
          showPage(modal, snapshot(node, key, false));
        })
        .catch((err) => console.error("Failed to open note ", key, err))
        .then(() => {
          if (modal._loadingToken === token) {
            modal._loadingToken = null;
            modal._loadingKey = null;
            modal._loadingPromise = null;
          }
        });
      return modal._loadingPromise;
    }
    modal._loadingToken = null; // a folder page is instant; nothing flies
    modal._loadingKey = null;
    modal._loadingPromise = null;
    var node = tpl(key);
    modal.history.push(snapshot(modal, modal.dataset.key, true));
    showPage(modal, snapshot(node, key, false));
    return Promise.resolve();
  }

  // jump back to a specific history depth: history[i] is the page
  // saved when we left it, so restore that page and drop everything
  // after it
  function popTo(modal, i) {
    if (!modal.history || i < 0 || i >= modal.history.length) return;
    if (modal._loadingToken) modal._loadingToken.cancelled = true;
    modal._loadingToken = null; // a page still flying in must not land
    modal._loadingKey = null;
    modal._loadingPromise = null;
    var page = modal.history[i];
    modal.history.length = i;
    showPage(modal, page);
  }

  // one entry-bar row per entry in modal.history plus the current
  // page. history[0] is the root (the head owns its title), so the
  // rows start at history[1] and end with the page being shown.
  // Each row's back button jumps to that row's depth.
  function renderStack(modal, page) {
    var stackEl = modal._stackEl;
    if (!stackEl) return;
    stackEl.innerHTML = "";
    var rows = [];
    if (modal.history && modal.history.length) {
      for (let i = 1; i < modal.history.length; i++) {
        rows.push({ key: modal.history[i].key, title: modal.history[i].title, depth: i });
      }
      rows.push({ key: page.key, title: page.title, depth: modal.history.length });
    }
    for (let i = 0; i < rows.length; i++) {
      var row = rows[i];
      var el = document.createElement("div");
      el.className = "page-title";
      el.dataset.levelKey = row.key;
      var b = document.createElement("span");
      b.className = "back";
      b.setAttribute("aria-label", "Back");
      b.title = "Back";
      var target = row.depth - 1;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        popTo(modal, target);
      });
      el.appendChild(b);
      var t = document.createElement("span");
      t.className = "pt-title";
      t.innerHTML = row.title;
      el.appendChild(t);
      stackEl.appendChild(el);
    }
  }

  function toggleRow(row) {
    if (row.classList.contains("selected")) {
      row.classList.remove("selected");
      hidePopup();
      return;
    }
    document.querySelectorAll(".tile.selected, .find-results li.selected").forEach((r) => {
      r.classList.remove("selected");
    });
    row.classList.add("selected");
    showPopup(row);
  }

  function toggleSelected(item) {
    // an open object keeps its state: clicking it brings its window
    // to the front and shows the metadata, nothing else
    if (item.classList.contains("opened")) {
      for (var i = 0; i < modals.length; i++) {
        if (modals[i].dataset.owner === item.id) {
          raise(modals[i]);
          showPopup(item);
          return;
        }
      }
    }
    if (item.classList.contains("selected")) {
      item.classList.remove("selected");
      hidePopup();
    } else {
      clearSelected();
      item.classList.remove("opened"); // the three states are exclusive
      item.classList.add("selected");
      showPopup(item);
    }
  }

  function clearSelected() {
    document.querySelectorAll(".obj.selected, .row.selected").forEach((i) => {
      i.classList.remove("selected");
    });
    hidePopup();
  }

  /* --- dragging -------------------------------------------------------
     Listeners live on window only while a press is active, and pointer
     capture is never used: capturing would retarget the following
     click and break the close button. */

  // A drag that ends outside the window makes the browser fire a click
  // on whatever is under the pointer — the desktop, say — and that
  // click would close the window. The click after a real drag is
  // swallowed.
  var dragging = false;

  function dragTo(e, press, target, host) {
    if (press.dx === undefined) {
      var r = target.getBoundingClientRect();
      press.dx = e.clientX - r.left;
      press.dy = e.clientY - r.top;
    }
    target.style.left = `${e.clientX - press.dx - host.left}px`;
    target.style.top = `${e.clientY - press.dy - host.top}px`;
  }

  function draggable(el, onMove) {
    var press = null;

    function move(e) {
      if (!press) return;
      if (!press.active) {
        var dx = e.clientX - press.x,
          dy = e.clientY - press.y;
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
        press.active = true;
        dragging = true;
        e.preventDefault();
      }
      onMove(e, press);
    }

    function up() {
      press = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      saveState();
    }

    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      if (NARROW.matches) return; // a phone scrolls, it does not drag
      press = {
        x: e.clientX,
        y: e.clientY,
        active: false,
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }

  function wireModal(modal) {
    var clamp = (n, min, max) => Math.min(max, Math.max(min, n));

    // --- maximize: fill the desktop, toggle back to the size it
    // had. The pre-maximize geometry is captured at the moment
    // Maximize is pressed and lives in _restore. A reload starts
    // the window at the default size again, so Restore never
    // points at a remembered maximized flag.
    function toggleMax() {
      if (modal.dataset.max === "1") {
        var r = modal._restore || {};
        if (r.width) modal.style.width = r.width;
        if (r.height) modal.style.height = r.height;
        if (r.left) modal.style.left = r.left;
        if (r.top) modal.style.top = r.top;
        delete modal.dataset.max;
      } else {
        modal._restore = {
          width: modal.style.width || modal.offsetWidth + "px",
          height: modal.style.height || modal.offsetHeight + "px",
          left: modal.style.left,
          top: modal.style.top,
        };
        var v = maxView();
        modal.style.width = v.width + "px";
        modal.style.height = v.height + "px";
        modal.style.left = "4px";
        modal.style.top = "4px";
        modal.dataset.max = "1";
      }
      updateMaxBtn();
      saveState();
    }
    function updateMaxBtn() {
      var label = modal.dataset.max === "1" ? "Restore" : "Maximize";
      if (modal._maxBtn) {
        modal._maxBtn.title = label;
        modal._maxBtn.setAttribute("aria-label", label);
      }
    }
    modal._maxBtn = document.createElement("span");
    modal._maxBtn.className = "max";
    modal._maxBtn.setAttribute("aria-label", "Maximize");
    modal._maxBtn.title = "Maximize";
    if (modal.dataset.max === "1") updateMaxBtn();
    modal._maxBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMax();
    });

    var head = modal.querySelector(".modal-head");
    // dragging a maximized window un-pins it: it is no longer
    // maximized, so it comes back to _restore on the next
    // Maximize, and the button flips back to Maximize. The window
    // keeps its current size; Restore is a no-op until the next
    // resize.
    function unmax() {
      if (modal.dataset.max === "1") {
        delete modal.dataset.max;
      }
      updateMaxBtn();
    }
    draggable(head, (e, press) => {
      unmax();
      dragTo(e, press, modal, modalLayer.getBoundingClientRect());
    });

    var grip = modal.querySelector(".grip");
    var rec = null;
    var onMove = (e) => {
      if (!rec) return;
      var maxW = Math.max(W_MIN, modalLayer.clientWidth - modal.offsetLeft - 4);
      var maxH = Math.max(H_MIN, modalLayer.clientHeight - modal.offsetTop - 4);
      modal.style.width = `${clamp(rec.w + (e.clientX - rec.x), W_MIN, maxW)}px`;
      modal.style.height = `${clamp(rec.h + (e.clientY - rec.y), H_MIN, maxH)}px`;
    };
    var onUp = () => {
      rec = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      saveState();
    };
    if (grip)
      grip.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        dragging = true;
        unmax();
        rec = {
          w: modal.offsetWidth,
          h: modal.offsetHeight,
          x: e.clientX,
          y: e.clientY,
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      });

    var close = document.createElement("span");
    close.className = "close";
    close.setAttribute("aria-label", "Close");
    close.title = "Close";
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal(modal);
    });

    if (modal.classList.contains("iv")) {
      // a viewer keeps its title band like any other window: the
      // close and info buttons sit in the head, not over the picture.
      // Close is the only way out, so no back box.
      head.insertBefore(close, head.firstChild);
      wireViewerInfo(modal);
      var pic = modal.querySelector(".modal-body img");
      if (pic) {
        pic.addEventListener("dragstart", (e) => e.preventDefault());
        draggable(pic, (e, press) => dragTo(e, press, modal, modalLayer.getBoundingClientRect()));
        // the window size comes from CSS, so the picture cannot change
        // it; re-place only to keep it centered
        if (!pic.complete)
          pic.addEventListener("load", () => {
            placeModal(modal, modal.dataset.owner, modal.dataset.key);
          });
      }
    } else {
      // close sits at the left of the head; maximize sits beside
      // it and the entry bar's back square takes the same 16px
      // slot under it, so the titles align
      head.insertBefore(close, head.firstChild);
      head.insertBefore(modal._maxBtn, close.nextSibling);
      // the entry bar: a stack of titlebars under the container
      // title, one row per entry in the history plus the current
      // page, each carrying its own back square
      var stackEl = document.createElement("div");
      stackEl.className = "page-title-stack";
      modal._stackEl = stackEl;
      head.after(stackEl);
    }
    setupFind(modal);
  }

  function writeHash(key) {
    var hash = `#${key}`;
    if (location.hash === hash) return;
    location.hash = key;
  }

  function readHash() {
    var key;
    try {
      key = decodeURIComponent(location.hash.replace(/^#/, ""));
    } catch {
      return null;
    }
    if (!key) return null;
    if (key.startsWith("note:")) {
      return noteRecords().some((n) => n.key === key) ? key : null;
    }
    var known = false;
    document.querySelectorAll(".modal-tpl").forEach((t) => {
      if (t.dataset.key === key) known = true;
    });
    return known ? key : null;
  }

  window.addEventListener("hashchange", () => {
    var key = readHash();
    if (key && window.umami) umami.track(location.pathname + "#" + key);
    if (!key) {
      // only an empty address closes everything. An in-page anchor
      // (#work, #philosophy) is not a window key: it must leave the
      // open windows alone and let the browser scroll the note.
      if (!location.hash || location.hash === "#") {
        while (modals.length) hideTop();
      }
      return;
    }
    var top = modals[modals.length - 1];
    if (top) {
      if (top.dataset.key === key) return; // already the page in front
      if (modals.some((m) => m.dataset.key === key)) return; // already open
      navigate(top, key);
    } else {
      openModal(key);
    }
  });

  (function openFromHash() {
    var key = readHash();
    if (key) openModal(key);
  })();

  /* --- what the desktop remembers -----------------------------------
   * Only the objects' positions are remembered. Window geometry
   * is not: every window opens at the default half-desktop size,
   * so a stored view would fight the one entry-size path. */

  var STORE = "project-desktop";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || {};
    } catch (_e) {
      return {};
    }
  }

  function saveState() {
    var state = loadState();
    // the store is merged, never cleared: a window that is closed
    // keeps what was remembered about it
    state.positions = state.positions || {};
    document.querySelectorAll(".desktop > .obj").forEach((item) => {
      state.positions[item.id] = { left: item.style.left, top: item.style.top };
    });
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch (_e) {
      /* a full disk or a private window: the desktop still works */
    }
  }

  (function restoreState() {
    var state = loadState();
    var items = Array.prototype.slice.call(document.querySelectorAll(".desktop > .obj"));
    if (state.positions) {
      items.forEach((item) => {
        var pos = state.positions[item.id];
        if (!pos) return;
        item.style.left = pos.left;
        item.style.top = pos.top;
      });
    }
    // a new object has no saved spot: its default cell may be taken
    // by an object the hand moved. Only then does it look for the
    // first free cell — an untouched desktop keeps its authored grid.
    var fresh = items.filter((item) => !state.positions?.[item.id]);
    if (!fresh.length) return;
    var STEP_X = 160;
    var STEP_Y = 120;
    var X0 = 20;
    var Y0 = 20;
    var cols = Math.max(1, Math.floor((innerWidth - X0) / STEP_X));
    var taken = items.filter((item) => fresh.indexOf(item) === -1);
    var freeOf = (rect, others) =>
      others.every((other) => {
        var o = other.getBoundingClientRect();
        return (
          rect.right <= o.left + 1 ||
          rect.left >= o.right - 1 ||
          rect.bottom <= o.top + 1 ||
          rect.top >= o.bottom - 1
        );
      });
    fresh.forEach((item) => {
      var home = { left: item.style.left, top: item.style.top };
      if (freeOf(item.getBoundingClientRect(), taken)) {
        taken.push(item);
        return;
      }
      for (var row = 0; row < 40; row++) {
        var placed = false;
        for (var col = 0; col < cols; col++) {
          item.style.left = `${X0 + col * STEP_X}px`;
          item.style.top = `${Y0 + row * STEP_Y}px`;
          if (freeOf(item.getBoundingClientRect(), taken)) {
            taken.push(item);
            placed = true;
            break;
          }
        }
        if (placed) return;
      }
      item.style.left = home.left;
      item.style.top = home.top;
    });
  })();

  window.desktop = {
    save: () => {
      saveState();
    },
  };

  // a direct visit to an image page: the static viewer gets its
  // buttons too; close goes back to the desktop
  (function wireStaticViewer() {
    var viewer = document.querySelector(".static-note.iv");
    if (!viewer) return;
    var close = document.createElement("span");
    close.className = "close";
    close.setAttribute("aria-label", "Close");
    close.title = "Close";
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      location.href = "/";
    });
    var head = viewer.querySelector(".modal-head");
    head.insertBefore(close, head.firstChild);
    wireViewerInfo(viewer);
  })();

  // The click that ends a drag is swallowed. The next press clears the
  // flag, so a click that comes later is never lost. The capture phase
  // puts this before the pointerdown that starts the next drag.
  document.addEventListener(
    "pointerdown",
    () => {
      dragging = false;
    },
    true,
  );

  document.addEventListener("click", (e) => {
    if (dragging) {
      dragging = false;
      return;
    }
    // a note link inside a window or the menu bar opens a window when
    // it names a built note, so the desktop stays in place. Other
    // links (home, the webring, an unknown path) keep their behavior.
    var anchor = closest(e.target, "a");
    var host;
    var noteKey;
    var linkChrome;
    if (anchor) {
      host = closest(anchor, ".modal");
      linkChrome = closest(anchor, ".menubar") || (host && closest(anchor, ".modal-body"));
      if (linkChrome && !anchor.classList.contains("tile")) {
        noteKey = keyForLink(anchor);
        if (noteKey) {
          e.preventDefault();
          openLinkedNote(anchor, noteKey, host);
          return;
        }
      }
      // links inside rows or note objects never navigate
      if (anchor.dataset.key) {
        e.preventDefault();
      }
    }
    // the menu bar is not the desktop: its buttons never close a window
    if (closest(e.target, ".menubar")) return;
    var item = closest(e.target, ".obj");
    var modal = closest(e.target, ".modal");
    if (modal?.isConnected && modals.indexOf(modal) >= 0) raise(modal);
    var row = closest(e.target, ".tile, li[data-key]");
    if (row) {
      toggleRow(row);
      return;
    }
    if (item) {
      toggleSelected(item);
      return;
    }
    if (modal) {
      hidePopup();
      return;
    }
    if (modals.length) hideTop();
    clearSelected();
  });

  // on a phone there is no double click: the first tap opens;
  // a desktop double click does the same. Both mean openFrom().
  function openFrom(e) {
    var item = closest(e.target, ".obj");
    var row = closest(e.target, ".tile[data-key], li[data-key]");
    if (!item && !row) return;
    var key = item ? item.dataset.key : row.dataset.key;
    // a click inside an open window navigates that window; an object
    // on the desktop always opens its own window
    if (closest(e.target, ".modal") && modals.length)
      navigate(modals[modals.length - 1], key, item ? item.id : row ? row.id : null);
    else openModal(key, item ? item.id : row ? row.id : null);
    if (item) {
      item.classList.remove("selected");
      item.classList.add("opened");
    }
    hidePopup();
  }

  document.addEventListener("click", (e) => {
    if (NARROW.matches) openFrom(e);
  });

  // a double click is two clicks: on a phone the click already
  // opened, so the dblclick pass must not open again
  document.addEventListener("dblclick", (e) => {
    if (!NARROW.matches) openFrom(e);
  });

  document.querySelectorAll(".desktop > .obj").forEach((item) => {
    draggable(item, (e, press) => dragTo(e, press, item, item.parentElement.getBoundingClientRect()));
  });

  window.addEventListener("drag", (e) => {
    if (e.dataTransfer) e.preventDefault();
  });

  function startClock() {
    var el = document.getElementById("clock");
    if (!el) return;
    var now = new Date();
    el.textContent =
      String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  }
  startClock();
  setInterval(startClock, 10000);
})();
