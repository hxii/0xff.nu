/* Headless smoke test for html/site.js (needs jsdom).
   Asserts the IDEA.md interaction contract. The corpus is whatever
   source/ holds, so the test reads the keys out of the built page
   instead of naming notes.
     - three exclusive states: unselected / selected / opened
     - a folder window lists its notes as a grid
     - double clicking an object opens the note on top
     - windows are movable and resizable (clamped)
     - closing a window detaches it and reverts the opened state
     - metadata, markdown and assets survive the build

   Run: hajime build && node test/smoke.mjs */

import { existsSync, readFileSync, statSync } from "node:fs";
import { JSDOM } from "jsdom";

const DIST = new URL("../html/", import.meta.url).pathname;
const html = readFileSync(`${DIST}index.html`, "utf-8");
const siteSrc = readFileSync(`${DIST}site.js`, "utf-8");
const css = readFileSync(`${DIST}desktop.css`, "utf-8");

// a real origin, so localStorage works
const dom = new JSDOM(html, {
	runScripts: "outside-only",
	url: "http://localhost/",
});
const { window } = dom;
// jsdom has no fetch. A note window loads its own page from html/, so the
// stub reads that file from disk: the same page a browser would fetch.
window.fetch = async (url) => {
	let path =
		DIST + new URL(url, "http://localhost/").pathname.replace(/^\//, "");
	if (existsSync(path) && statSync(path).isDirectory()) path += "index.html";
	if (!existsSync(path))
		return { ok: false, status: 404, text: async () => "" };
	return {
		ok: true,
		status: 200,
		text: async () => readFileSync(path, "utf-8"),
	};
};
const pageErrors = [];
const MQL = { matches: false, addEventListener() {}, removeEventListener() {} };
window.addEventListener("error", (e) => {
	pageErrors.push(String(e.message));
});

window.noteIndex = JSON.parse(
	window.document.getElementById("note-index").textContent,
);
window.eval(readFileSync(`${DIST}desktop-data.js`, "utf-8"));
window.matchMedia = (q) =>
	q.includes("max-width: 720px")
		? MQL
		: { matches: false, addEventListener() {}, removeEventListener() {} };
window.eval(siteSrc); // run the runtime IIFE so listeners attach
const document = window.document;

// a note window is fetched, then mounted: wait until the window count is
// the expected one, so the check runs on the real condition, not a timer
const waitForModals = async (count) => {
	for (
		let i = 0;
		i < 400 && document.querySelectorAll(".modal").length !== count;
		i++
	) {
		await new Promise((r) => setTimeout(r, 5));
	}
};

// a note page is fetched, then swapped into the open window: wait until
// the front window names the key, so the check runs on the real condition
const waitForKey = async (k) => {
	for (let i = 0; i < 400 && topModal()?.dataset.key !== k; i++) {
		await new Promise((r) => setTimeout(r, 5));
	}
};

let passed = 0;
function ok(msg) {
	passed++;
	console.log(`  ok - ${msg}`);
}
function assert(cond, msg) {
	if (!cond) throw new Error(`FAIL: ${msg}`);
	passed++;
	console.log(`  ok - ${msg}`);
}

/* helpers ------------------------------------------------------------ */

const byKey = (key) => document.querySelector(`.obj[data-key="${key}"]`);
const topModal = () => {
	const all = document.querySelectorAll(".modal");
	return all[all.length - 1] || null;
};
const modalCount = () => document.querySelectorAll(".modal").length;
const cssHas = (rule) => css.includes(rule);
const closeModalOf = (modal) => modal.querySelector(".close").click();
const closeAll = () => {
	let modal = document.querySelector(".modal");
	while (modal) {
		modal.querySelector(".close").click();
		modal = document.querySelector(".modal");
	}
};
const _modalTitled = (text) =>
	[...document.querySelectorAll(".modal")].find((m) =>
		m
			.querySelector(".title")
			.textContent.toLowerCase()
			.includes(text.toLowerCase()),
	);
const click = (el) =>
	el.dispatchEvent(
		new window.MouseEvent("click", { bubbles: true, cancelable: true }),
	);
const dblclick = (el) =>
	el.dispatchEvent(
		new window.MouseEvent("dblclick", { bubbles: true, cancelable: true }),
	);
const pointer = (el, type, x, y) =>
	el.dispatchEvent(
		new window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y }),
	);

/* the corpus ------------------------------------------------------------ */

// the first folder and its first note, read out of the built page
const folderKeys = [
	...document.querySelectorAll('.obj[data-key^="folder:"]'),
].map((el) => el.dataset.key);
assert(folderKeys.length > 0, "the desktop has folders");
const folder = byKey(folderKeys[0]);
const folderKey = folder.dataset.key;
const folderSlug = folderKey.replace("folder:", "");

// the notes of a folder live inside its template until it is opened
const folderTpl = document.querySelector(
	`template.modal-tpl[data-key="${folderKey}"]`,
);
assert(!!folderTpl, "the folder has a window template");
const child = [
	...folderTpl.content.querySelectorAll('a.tile[data-key^="note:"]'),
].find((tile) => !tile.querySelector(".tile-lqip"));
assert(!!child, "a folder window lists its notes as tiles");
const childKey = child.dataset.key;
ok(`corpus: ${folderKeys.length} folders, first is ${folderKey}`);

/* every object has a window --------------------------------------------- */

const objKeys = [...document.querySelectorAll(".obj")].map(
	(el) => el.dataset.key,
);
const tplKeys = [...document.querySelectorAll("template.modal-tpl")].map(
	(el) => el.dataset.key,
);
for (const key of objKeys) {
	const el = document.querySelector(`.obj[data-key="${key}"]`);
	// a folder/system object opens a template window; a loose note is a
	// link that opens its fetched page, so it carries a URL, not a template
	assert(
		tplKeys.includes(key) || el.matches("a[data-url]"),
		`object "${key}" has a window template or a page of its own`,
	);
}
assert(
	new Set(tplKeys).size === tplKeys.length,
	"no duplicate window templates",
);

/* state 1 + 2: single click selects -------------------------------------- */

click(folder);
assert(folder.classList.contains("selected"), "single click selects the item");
assert(
	cssHas(".obj.selected .sel-overlay"),
	"the stylesheet shows the overlay when selected",
);
assert(
	!folder.classList.contains("opened"),
	"selected and opened are exclusive",
);

click(document.body);
assert(
	!folder.classList.contains("selected"),
	"click on the desktop clears the selection",
);

/* state 3: double click opens ------------------------------------------- */

dblclick(folder);
assert(modalCount() === 1, "double click opens one window");
assert(
	folder.classList.contains("opened"),
	"double click marks the item as opened",
);
assert(!folder.classList.contains("selected"), "opened replaces selected");

const folderModal = topModal();
assert(!!folderModal.querySelector(".grip"), "window has a resize grip");
assert(!!folderModal.querySelector(".close"), "window has a close button");

/* the notes inside ------------------------------------------------------ */

assert(!!child, "the folder window lists notes as rows");
assert(child.dataset.key === childKey, "a note tile carries its key");
assert(!!child.querySelector(".tile-title"), "a note tile has a name");
const day = child.querySelector(".tile-date").textContent.trim();
assert(/\d{4}-\d{2}-\d{2}/.test(day), "a note tile carries its date");

/* every folder table is newest first ------------------------------------ */

// the templates hold every folder's table; the dates a row shows must
// only go down, and a row without a date sits last
for (const tpl of document.querySelectorAll("template.modal-tpl")) {
	const key = tpl.dataset.key || "";
	if (!key.startsWith("folder:")) continue;
	const dates = [
		...tpl.content.querySelectorAll('.tile:not([data-key^="folder:"])'),
	].map((r) => r.querySelector(".tile-date").textContent.trim() || null);
	const dated = dates.filter(Boolean);
	const sorted = dated.every((d, i) => i === 0 || dated[i - 1] >= d);
	assert(sorted, `${key} lists its dated notes newest first`);
	const lastDated = dates.reduce((last, d, i) => (d ? i : last), -1);
	const firstUndated = dates.indexOf(null);
	assert(
		firstUndated === -1 || firstUndated > lastDated,
		`${key} keeps undated notes last`,
	);
}

// a nested container is a tile inside its parent window
const nestedTpls = [...document.querySelectorAll("template.modal-tpl")].filter(
	(t) => (t.dataset.key || "").includes("/"),
);
if (!nestedTpls.length) console.log("no nested containers: nesting untested");
for (const tpl of nestedTpls) {
	const slug = tpl.dataset.key.slice("folder:".length);
	const parent = slug.slice(0, slug.lastIndexOf("/"));
	const parentTpl = document.querySelector(
		`template.modal-tpl[data-key="folder:${parent}"]`,
	);
	assert(!!parentTpl, `nested folder ${slug} has a parent window`);
	assert(
		!!parentTpl.content.querySelector(`.tile[data-key="folder:${slug}"]`),
		`nested folder ${slug} is a tile in ${parent}`,
	);
}

// set members are carved out of the parent folder (no row in both)
for (const tpl of nestedTpls) {
	const slug = tpl.dataset.key.slice("folder:".length);
	const parentSlug = slug.slice(0, slug.lastIndexOf("/"));
	const parentTpl = document.querySelector(
		`template.modal-tpl[data-key="folder:${parentSlug}"]`,
	);
	if (!parentTpl) continue;
	const parentNotes = new Set(
		[...parentTpl.content.querySelectorAll('.tile[data-key^="note:"]')].map(
			(t) => t.dataset.key,
		),
	);
	for (const t of tpl.content.querySelectorAll('.tile[data-key^="note:"]')) {
		assert(
			!parentNotes.has(t.dataset.key),
			`${t.dataset.key} is not in both ${parentSlug} and ${slug}`,
		);
	}
}

const live = document.querySelector(`.tile[data-key="${childKey}"]`);
assert(!!live, "the note tile is in the open window");

/* one navigation per tile: a second tap while the page is still
   loading must not stack a second page or fire a second fetch. The
   narrow path (one tap opens) is what a phone uses, so matchMedia
   reports narrow and the fetch resolves on demand. ----------------- */
MQL.matches = true; // a phone: one tap opens, no dblclick pass
let gate = null;
let noteFetches = 0;
const realFetch = window.fetch;
const childPath = new URL(
	window.noteIndex.find((n) => n.key === childKey).url,
	"http://localhost/",
).pathname;
window.fetch = async (url) => {
	if (new URL(url, "http://localhost/").pathname === childPath) {
		noteFetches++;
		await new Promise((r) => (gate = r)); // hold the page in flight
	}
	return realFetch(url);
};
click(live); // tap one: starts the fetch, now held
click(live); // tap two: must join the first, not start a second
dblclick(live); // the dblclick pass must not fire on narrow viewports
assert(noteFetches === 1, "two taps start one fetch");
gate(); // release the page
await waitForKey(childKey);
await new Promise((r) => setTimeout(r, 50)); // let a duplicate fetch surface if the guard leaks
assert(noteFetches === 1, "a tile tapped twice loads its page once");
assert(
	topModal().history.length === 1,
	"a tile tapped twice leaves one history entry",
);
assert(
	topModal().querySelectorAll(".page-title").length === 1,
	"a tile tapped twice shows one title row",
);
// back to the folder: the row's back button pops the note page
click(topModal().querySelector(".page-title .back"));
await new Promise((r) => setTimeout(r, 50));
assert(
	topModal().dataset.key.startsWith("folder:"),
	"back from the note shows the folder grid again",
);
const liveTile = topModal().querySelector(`.tile[data-key="${childKey}"]`);
assert(
	!!liveTile && liveTile.isConnected,
	"the folder window shows its tile again",
);
MQL.matches = false; // back to the desktop: double click opens
window.fetch = realFetch;
dblclick(liveTile);
await waitForKey(childKey); // the note page is fetched before it swaps in
assert(
	modalCount() === 1,
	"double click on a note swaps it into the same window",
);
const noteModal = topModal();
assert(noteModal.dataset.key === childKey, "the window now shows the note");
assert(
	noteModal.querySelector(".modal-head .title").textContent.length > 0,
	"the note window shows a title",
);
assert(
	!!noteModal.querySelector(".modal-body .body"),
	"the note window shows content",
);

/* closing detaches the node and reverts the opened state ------------------ */

click(folder); // clicking an opened object raises its window
assert(
	folder.classList.contains("opened") && !folder.classList.contains("selected"),
	"an opened object stays opened when clicked again",
);
assert(
	topModal().querySelector(".title").textContent.length > 0,
	"clicking an opened object raises its window",
);

closeModalOf(topModal()); // the folder window is on top now
assert(modalCount() === 0, "closing the folder window closes its note with it");
assert(
	!document.contains(noteModal),
	"closed window is detached from the document",
);
assert(
	!folder.classList.contains("opened"),
	"closing reverts the opened state",
);

/* an object opens at most one window --------------------------------------- */

dblclick(folder);
dblclick(folder);
assert(
	modalCount() === 1,
	"double clicking the same object does not open two windows",
);

// the system window may already be open: opening it from the
// desktop must not add a second one
const about = byKey("about");
if (about) {
	dblclick(about);
	const opened = modalCount();
	dblclick(about);
	assert(
		modalCount() === opened,
		"an object that is already open does not open a second window",
	);
}

/* stack order equals DOM order --------------------------------------------- */

const other = byKey(folderKeys[1] || folderKeys[0]);
dblclick(other);
const last = topModal();
assert(!!last, "the last window in the document is the stack top");
dblclick(folder);
assert(
	topModal() !== last,
	"re-opening an object raises its window to the front",
);
closeAll();

/* a preview dies with the window that holds it ----------------------------- */

dblclick(folder);
const inside = topModal().querySelector(
	`.tile[id^="row-${folderSlug.replaceAll("/", "-")}"]`,
);
assert(!!inside, "the opened folder shows its notes");
dblclick(inside);
await waitForKey(inside.dataset.key);
assert(
	modalCount() === 1,
	"the note replaces the folder grid in the same window",
);
const headTitle = topModal().querySelector(".modal-head .title").textContent;
assert(
	headTitle.includes(folder.querySelector(".label").textContent),
	"the container title survives the swap",
);
const pageRow = topModal().querySelector(".page-title");
assert(
	!!pageRow &&
		pageRow.style.display !== "none" &&
		pageRow.textContent.length > 0,
	"the entry title shows under the container title",
);
assert(
	topModal().querySelectorAll(".page-title").length ===
		topModal().history.length,
	"one entry row per history depth",
);
const bk = topModal().querySelector(".page-title .back");
assert(!!bk && bk.style.display !== "none", "back appears past the first page");
assert(!!bk.closest(".page-title"), "back sits in the entry bar");
click(bk);
assert(modalCount() === 1, "back keeps the same window");
assert(
	!!topModal().querySelector(".tile[data-key]"),
	"back restores the folder grid",
);
assert(
	topModal().querySelector(".modal-head .title").textContent === headTitle,
	"back keeps the container title",
);
assert(
	topModal().querySelectorAll(".page-title").length === 0,
	"no row on the first page",
);
assert(
	window.location.hash === `#folder:${folderSlug}`,
	"back puts the folder in the address bar",
);
// a window that has navigated still raises by its opening key
click(folder);
dblclick(folder);
assert(
	modalCount() === 1,
	"clicking the folder again does not open a second window",
);
closeModalOf(topModal());
assert(
	modalCount() === 0,
	"closing the single window closes the note inside it too",
);

/* the metadata popup ------------------------------------------------------- */

const popupEl = document.querySelector(".popup");
assert(!!popupEl, "the popup panel exists");
click(folder);
assert(
	popupEl.classList.contains("open"),
	"selecting an object opens the popup",
);
assert(
	popupEl.textContent.includes(folder.querySelector(".label").textContent),
	"the popup shows the object title",
);
assert(
	popupEl.querySelectorAll("dt").length > 0,
	"the popup shows a grid of values",
);
click(document.querySelector(".desktop"));
assert(
	!popupEl.classList.contains("open"),
	"clicking the desktop closes the popup",
);

/* a folder window is a grid ---------------------------------------------- */

assert(cssHas(".folder-grid"), "a folder window shows a grid");
assert(
	/\.folder-grid\s*\{[^}]*display:\s*grid/.test(css),
	"the grid is always visible",
);
assert(cssHas("&.selected"), "a selected tile is marked");

/* metadata, markdown and the status bar ------------------------------------- */

// notes live inside their folder's template, the desktop holds the folders
const sample = document
	.querySelector('template.modal-tpl[data-key^="folder:"]')
	.content.querySelector(".tile");
const sampleDay = sample.querySelector(".tile-date").textContent.trim();
assert(/\d{4}-\d{2}-\d{2}/.test(sampleDay), "notes know their date");
assert(sample.dataset.age === undefined, "notes carry no age any more");
assert(
	sample.querySelector(".tile-title").textContent.trim().length > 0,
	"notes carry a title",
);
assert(sample.hasAttribute("data-tags"), "notes carry their tags as data");

// a folder object shows closed/open icons; a configured icon replaces both.
// Buckets are no longer desktop objects: the bucket root is, and a bucket
// lives one level down inside it.
const folderObj = byKey("folder:buckets");
assert(
	!!folderObj.querySelector(".icon.closed img[src$='folder.png']"),
	"a folder object has a closed folder icon",
);
assert(
	!!folderObj.querySelector(".icon.open img[src$='folder-open.png']"),
	"a folder object has an open folder icon",
);
const styled = byKey("folder:latest");
assert(
	!styled.querySelector(".icon.closed") && !styled.querySelector(".icon.open"),
	"a configured icon replaces closed and open",
);
assert(
	!!styled.querySelector(".icon img[src$='folder-open.png']"),
	"a configured icon shows its picture",
);

assert(!document.querySelector(".statusbar"), "there is no status bar");

/* the rendered markdown ----------------------------------------------------- */

// every note lives on its own page now: read them from html/
const noteIndex = window.noteIndex;
const notePages = noteIndex
	.map((n) => {
		let p =
			DIST + new URL(n.url, "http://localhost/").pathname.replace(/\/+$/, "");
		if (existsSync(p) && statSync(p).isDirectory()) p += "/index.html";
		return readFileSync(p, "utf-8");
	})
	.map((page) => new JSDOM(page).window.document);
const bodies = notePages
	.map((d) => d.querySelector(".static-note .body"))
	.filter(Boolean);
assert(bodies.length > 0, "notes render a body");
const allHtml = bodies.map((b) => b.innerHTML).join("\n");
// code blocks keep their literal text, so they are not counted
const prose = allHtml
	.replace(/<pre[\s\S]*?<\/pre>/g, "")
	.replace(/<code>[\s\S]*?<\/code>/g, "");
assert(!/src="null"/.test(allHtml), "no image points at a missing file");
// Hajime publishes raw HTML from a note on purpose (a tweet embed, say),
// so a script in a note body is the author's business. What must never
// happen is a script escaping a code block, where it is only text.
assert(
	bodies.every((b) => !b.querySelector("pre script, code script")),
	"no script lands inside a code block",
);
assert(!/\[\[/.test(prose), "no wikilink markers survive outside code");
assert(!/\{(\.|\s*style)/.test(prose), "no Obsidian attribute blocks survive");
assert(
	/<(p|ul|ol|h1|h2|h3|table|blockquote|pre)\b/.test(allHtml),
	"the notes are rendered as html",
);
// the note pages are rendered by Hajime, so these check Hajime's markup:
// a task list is a disabled checkbox, a callout is .admonition, a code
// fence is a bare <pre><code> with no language label.
assert(
	bodies.some((b) => b.querySelector("input[type=checkbox]")),
	"task list items render as checkboxes",
);
assert(
	bodies.some((b) => b.querySelector(".admonition")),
	"callouts render",
);
assert(
	bodies.some((b) => b.querySelector(".admonition-title")),
	"a callout shows its title",
);
assert(
	bodies.some((b) => b.querySelector("pre code")),
	"a code block renders",
);

/* assets ------------------------------------------------------------------- */

const images = notePages
	.flatMap((d) => [...d.querySelectorAll("img")])
	.map((img) => img.getAttribute("src"));
for (const src of images) {
	// a src that starts with "/" is a file on the old site (0xff.nu/i/…),
	// not one this build publishes
	if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("/"))
		continue;
	// the src is url-encoded, the file on disk is not
	const file = DIST + decodeURIComponent(src.replace(/^\//, ""));
	assert(existsSync(file), `asset ${src} was published`);
}
ok(`checked ${images.length} images`);

/* links in a note body -----------------------------------------------------
 * The bodies are Hajime's: a link the author wrote as /slug stays /slug.
 * Nothing rewrites it to the site in config/site.json any more, so there
 * is nothing here to assert about the prefix. */

/* the template store renders nothing -------------------------------------- */

assert(
	document.querySelector(".templates").textContent.trim() === "",
	"the template store renders no stray text",
);
assert(
	document.querySelector(".templates").getBoundingClientRect().height === 0,
	"the template store takes no space",
);

/* the desktop tile --------------------------------------------------------- */

assert(existsSync(`${DIST}pattern.svg`), "the desktop tile is published");
assert(
	cssHas("url(pattern.svg)") || cssHas('url("pattern.svg")'),
	"the desktop is tiled with the pattern",
);
assert(cssHas("4px 4px"), "the tile repeats on a 4px grid");

/* the note window has a metadata strip -------------------------------------- */
assert(notePages.length > 0, "note pages exist");
// the #note-index script and site.js must sit outside .static-note:
// a note page where an unclosed element in the body swallows the
// document (e.g. a literal <insert ...> typed as text) puts both
// scripts inside the modal, and runScripts() then re-loads site.js
// in a loop. This parses every note page so a new malformed note
// fails the build instead of the browser.
for (const doc of notePages) {
	const note = doc.querySelector(".static-note");
	assert(!!note, "every note page has a .static-note window");
	assert(!note.querySelector("#note-index"), "no #note-index script inside .static-note");
	assert(
		!note.querySelector('script[src*="site.js"]'),
		"no site.js script inside .static-note",
	);
	const idx = doc.querySelector("#note-index");
	assert(!!idx, "every note page carries its #note-index script");
	const parsed = JSON.parse(idx.textContent);
	assert(Array.isArray(parsed) && parsed.length > 0, "#note-index parses as a non-empty array");
	assert(
		!doc.querySelector(".static-note").contains(idx),
		"#note-index is outside .static-note",
	);
}
assert(
	notePages.some((d) => d.querySelector(".static-note .modal-info")),
	"a note window has a metadata strip",
);
assert(
	notePages.some((d) => d.querySelector(".static-note .mi-tag")),
	"the strip shows the tags",
);

/* deep links ---------------------------------------------------------------- */

assert(
	/currentColor|#000000|#ffffff|#f4f1ea/.test(
		readFileSync(`${DIST}pattern.svg`, "utf-8"),
	),
	"the tile is drawn in the palette",
);

const aboutTpl = document.querySelector('template.modal-tpl[data-key="about"]');
assert(!!aboutTpl, "the system window has a template");
assert(
	!!aboutTpl.content.querySelector(".modal.about"),
	"the system window is a small panel",
);
assert(
	!document.querySelector('template.modal-tpl[data-key="status"]'),
	"no separate status window",
);
const aboutBody = aboutTpl.content.querySelector(".modal-body");
assert(
	!!aboutBody.querySelector(".about-head pre"),
	"about shows the ASCII logo",
);
assert(
	!!aboutBody.querySelector(".about-head"),
	"about shows the head",
);
assert(
	!aboutBody.querySelector(".folder-table"),
	"about is static, no build stats",
);
closeAll();
dblclick(document.querySelector('.obj[data-key="about"]'));
await waitForModals(1);
// jsdom has no layout (offsetWidth is 0), so the real 520x420 size is proven in the browser; here we assert the rule.
assert(
	topModal().classList.contains("about"),
	"about opens as the about panel",
);
assert(
	topModal().style.width === "" && topModal().style.height === "",
	"about keeps its CSS size",
);
assert(
	/\.modal\.about\s*\{[^}]*width:\s*520px/.test(css),
	"the about panel is a small fixed card",
);
closeAll();

/* links in a note body ----------------------------------------------------- */

closeAll();
dblclick(folder);
const hostWindow = topModal();
assert(
	hostWindow.id.startsWith("window-"),
	"a window names itself for its links",
);

const hostRow = hostWindow.querySelector('.tile[data-key^="note:"]');
const hostKey = hostRow.dataset.key;
dblclick(hostRow);
await waitForKey(hostKey);
const noteWindow = topModal();
assert(
	!!noteWindow.querySelector(".modal-body"),
	"the note has a body to link from",
);

// a link to a different published note opens that note as a window
const target = noteIndex.find((n) => n.key !== hostKey);
const link = document.createElement("a");
link.setAttribute("href", new URL(target.url, "http://localhost/").pathname);
link.textContent = "other note";
noteWindow.querySelector(".modal-body").appendChild(link);
click(link);
await waitForKey(target.key);
assert(modalCount() === 1, "a link in a note swaps the same window");
assert(
	topModal().dataset.key === target.key,
	"the opened window is the linked note",
);

// an in-page anchor is not a note link and stays put
const anchor = document.createElement("a");
anchor.setAttribute("href", "#none");
anchor.textContent = "same page";
topModal().querySelector(".modal-body").appendChild(anchor);
click(anchor);
// the anchor sets a hash and fires hashchange: give it a tick to be
// sure it does not close the open windows
await new Promise((r) => setTimeout(r, 30));
assert(modalCount() === 1, "an in-page anchor does not open or close a window");
closeAll();

/* opening a window in the address bar is tracked in umami */
window.__tracked = [];
window.umami = { track: (u) => window.__tracked.push(u) };
window.location.hash = "";
await new Promise((r) => setTimeout(r, 30));
dblclick(folder);
await waitForModals(1);
// the address change fires hashchange a tick later: wait for the track
for (let i = 0; i < 100 && window.__tracked.length === 0; i++) {
	await new Promise((r) => setTimeout(r, 5));
}
assert(
	window.__tracked.length === 1,
	"opening a window is tracked once in umami",
);
assert(
	window.__tracked[0] === `/#${folderKey}`,
	"the tracked address names the open window",
);
closeAll();
delete window.umami;

/* the image viewer opens from a folder row ------------------------------- */

const imageRow = [...document.querySelectorAll("template.modal-tpl")]
	.map((t) => t.content.querySelector(".tile .tile-lqip"))
	.find(Boolean)
	?.closest("a.tile");
if (imageRow) {
	const folderKeyOfImage = [
		...document.querySelectorAll("template.modal-tpl"),
	].find((t) => t.content.contains(imageRow)).dataset.key;
	closeAll();
	dblclick(byKey(folderKeyOfImage));
	const host = topModal();
	const row = host.querySelector(`.tile[data-key="${imageRow.dataset.key}"]`);
	dblclick(row);
	await waitForKey(imageRow.dataset.key);
	assert(modalCount() === 1, "the image nests into the folder window");
	const viewer = topModal();
	assert(viewer.classList.contains("iv"), "an image note opens as a viewer");
	assert(
		!!viewer.querySelector(".modal-head .iv-info"),
		"the viewer has an info box",
	);
	assert(
		!!viewer.querySelector(".page-title .back"),
		"the viewer keeps the container back box",
	);
	click(viewer.querySelector(".iv-info"));
	assert(
		viewer.classList.contains("show-info"),
		"the info box shows the metadata",
	);
	click(viewer.querySelector(".page-title .back"));
	await waitForKey(folderKeyOfImage);
	assert(
		!topModal().classList.contains("iv"),
		"back leaves the viewer inside the folder",
	);
	assert(
		!!topModal().querySelector(".folder-grid"),
		"back restores the folder grid",
	);
	closeAll();
} else {
	ok("no image note in this corpus");
}

/* the menubar names the front window --------------------------------------- */

const titleEl = document.getElementById("front-title");
assert(!!titleEl, "the menubar has a front-title");
dblclick(folder);
assert(
	titleEl.textContent.trim() ===
		folder.querySelector(".label").textContent.trim(),
	"the front-title names the open window",
);
closeAll();
assert(
	titleEl.textContent === "",
	"the front-title clears when the desktop is empty",
);

/* the menu bar ------------------------------------------------------------- */

const helpBtn = document.querySelector('.menubar a[href="/help-desktop"]');
assert(!!helpBtn, "the menubar has a help button");
dblclick(folder);
click(helpBtn);
assert(modalCount() === 1, "a menubar button does not close a window");
closeAll();

/* buckets, hidden notes and image entries ---------------------------------- */

// the templates keep their markup in .content, not in the main tree
const tpls = [...document.querySelectorAll("template.modal-tpl")];

// a container is derived from a bucket value, not written by hand
assert(
	tpls.some(
		(t) =>
			t.dataset.key === "folder:buckets/rant" &&
			t.content.querySelector('.tile[data-key="note:adhd"]'),
	),
	"a bucket value makes its own container",
);

// an image note shows a placeholder swatch, and its rules are on the page
assert(
	tpls.some((t) => t.content.querySelector(".tile-lqip[data-lqip]")),
	"an image tile shows a lqip swatch",
);
assert(
	!!document.getElementById("lqip-css"),
	"the shared lqip rules are in the page",
);
assert(
	/\[data-lqip=/.test(document.getElementById("lqip-styles").textContent),
	"each image carries its own lqip rule",
);

// the image viewer: a framed window, with its info box in the head
assert(
	/\.modal\.iv\s*\{/.test(css),
	"the image viewer has its own stylesheet rule",
);
assert(
	notePages.some((d) => d.querySelector(".static-note.iv .modal-info")),
	"an image page carries a metadata strip for the info overlay",
);

// the menubar carries a note link (the ? help button): it opens a window
const notePath = (href) =>
	new URL(href, "http://localhost/").pathname
		.replace(/\/index\.html$/, "")
		.replace(/\/$/, "");
const builtPaths = new Set(noteIndex.map((n) => notePath(n.url)));
const linked = [...document.querySelectorAll(".menubar a")].find((a) =>
	builtPaths.has(notePath(a.getAttribute("href"))),
);
if (linked) {
	const key = noteIndex.find(
		(n) => notePath(n.url) === notePath(linked.getAttribute("href")),
	)?.key;
	closeAll();
	click(linked);
	await waitForModals(modalCount() + 1);
	assert(
		[...document.querySelectorAll(".modal")].some((m) => m.dataset.key === key),
		`a menubar note link opens ${key}`,
	);
	closeAll();
} else {
	ok("no menubar note link in this corpus");
}

// an in-page anchor is not a window key: it must not close a window
closeAll();
dblclick(folder);
const openBefore = modalCount();
window.location.hash = "some-anchor";
await new Promise((r) => setTimeout(r, 30));
assert(modalCount() === openBefore, "an unknown hash leaves the windows open");
window.location.hash = "about";
await new Promise((r) => setTimeout(r, 30));
assert(modalCount() === 1, "a known hash swaps the open window");
assert(
	!topModal().querySelector(".modal-info"),
	"a page without a metadata strip drops the old one",
);
window.location.hash = "";
await new Promise((r) => setTimeout(r, 30));
assert(modalCount() === 0, "an empty hash closes the windows");

/* the boot overlay ------------------------------------------------------------ */

assert(!!document.querySelector(".boot"), "the page has a boot overlay");
assert(cssHas("boot-out"), "the boot overlay crossfades away");

/* what the desktop remembers ---------------------------------------------------- */

// jsdom sizes every element at zero; give the desktop real edges,
// so max size and the resize clamp have something to measure
const layer = document.querySelector(".modal-layer");
Object.defineProperty(layer, "clientWidth", {
	value: 1000,
	configurable: true,
});
Object.defineProperty(layer, "clientHeight", {
	value: 700,
	configurable: true,
});

closeAll();

// open a folder: it opens at the default size, about half the
// desktop, so the Maximize button has somewhere to go.
dblclick(folder);
const folderWindow = topModal();
assert(!!folderWindow.querySelector(".tile"), "the folder window shows a grid");
pointer(byKey("folder:buckets"), "pointerdown", 10, 10);
pointer(byKey("folder:buckets"), "pointermove", 90, 90);
pointer(window, "pointerup", 90, 90);
dblclick(folder);
// every window opens at the default size and the button
// toggles it: the pre-maximize geometry is captured at the
// moment Maximize is pressed
assert(topModal().dataset.max !== "1", "the folder opens at the default size");
assert(
	parseInt(topModal().style.width, 10) === 500,
	"the folder opens at half desktop width",
);
assert(
	parseInt(topModal().style.height, 10) === 350,
	"the folder opens at half desktop height",
);
const toggleBtn = topModal().querySelector(".max");
assert(!!toggleBtn, "the maximize button is there");
const placedLeft = topModal().style.left,
	placedTop = topModal().style.top;
assert(
	placedLeft !== "4px" && placedTop !== "4px",
	"the folder is placed away from the corner before maximize",
);
toggleBtn.dispatchEvent(
	new window.MouseEvent("click", { bubbles: true, cancelable: true }),
);
assert(topModal().dataset.max === "1", "maximize spans the desktop");
assert(
	parseInt(topModal().style.width, 10) === 992,
	"max width is the desktop minus margins",
);
assert(
	parseInt(topModal().style.height, 10) === 692,
	"max height is the desktop minus margins",
);
assert(
	topModal().style.left === "4px" && topModal().style.top === "4px",
	"max pins the window to the corner",
);
assert(toggleBtn.title === "Restore", "the button flips to Restore");
toggleBtn.dispatchEvent(
	new window.MouseEvent("click", { bubbles: true, cancelable: true }),
);
assert(topModal().dataset.max !== "1", "restore comes back from max");
assert(
	parseInt(topModal().style.width, 10) === 500,
	"restore brings back the default size",
);
assert(
	parseInt(topModal().style.height, 10) === 350,
	"restore brings back the default height",
);
assert(topModal().style.left === placedLeft, "restore brings back the left");
assert(topModal().style.top === placedTop, "restore brings back the top");
assert(toggleBtn.title === "Maximize", "the button flips back to Maximize");
closeAll();

/* window is movable --------------------------------------------------------- */

dblclick(folder);
const m = topModal();
const before = m.style.left;
m.querySelector(".modal-head").dispatchEvent(
	new window.MouseEvent("pointerdown", {
		bubbles: true,
		clientX: 100,
		clientY: 100,
	}),
);
pointer(m, "pointermove", 400, 300);
assert(m.style.left !== before, "dragging the header moves the window");

/* window is resizable, clamped ----------------------------------------------- */

const grip = m.querySelector(".grip");
const _m1 = grip.offsetLeft,
	_m2 = grip.offsetTop;
grip.dispatchEvent(
	new window.MouseEvent("pointerdown", {
		bubbles: true,
		clientX: 0,
		clientY: 0,
	}),
);
pointer(window, "pointermove", 1000, 1000);
assert(parseInt(m.style.width, 10) <= 996, "width clamps at the desktop edge");
assert(
	parseInt(m.style.height, 10) <= 696,
	"height clamps at the desktop edge",
);
pointer(window, "pointermove", -1000, -1000);
assert(parseInt(m.style.width, 10) >= 300, "width clamps at 300");
assert(parseInt(m.style.height, 10) >= 180, "height clamps at 180");
pointer(window, "pointerup", 0, 0);
assert(modalCount() === 1, "the window survives a resize that ends outside it");

/* a drag must not swallow the next real click ----------------------------- */

pointer(document.body, "pointerdown", 5, 5);
pointer(document.body, "pointerup", 5, 5);
click(document.body);
assert(modalCount() === 0, "a click after a drag still closes the window");

/* desktop items are movable -------------------------------------------------- */

const file = byKey(folderKeys[1] || folderKeys[0]);
const leftBefore = file.style.left;
pointer(file, "pointerdown", 100, 100);
pointer(file, "pointermove", 300, 260);
pointer(window, "pointerup", 300, 260); // end the drag: it must not swallow later clicks
assert(file.style.left !== leftBefore, "desktop items are draggable");
const saved = JSON.parse(
	window.localStorage.getItem("project-desktop") || "{}",
);
assert(
	saved.positions?.[file.id],
	"a moved object keeps its place in the store",
);

/* an older request must not land after navigation A, B, A -------------- */

// every window is closed here: the race tests open their own folder
// a real drag ends with pointerup, and the following click clears the
// drag flag on the next pointerdown — mirror that here so the race
// block's clicks are not swallowed by the click-after-drag guard
pointer(document.body, "pointerdown", 5, 5);
pointer(document.body, "pointerup", 5, 5);
while (modalCount() > 0) closeModalOf(topModal());

// a folder with two note tiles, found through template.content
const raceFolderKey = folderKeys.find((key) => {
	const tpl = document.querySelector(
		`template.modal-tpl[data-key="${key}"]`,
	);
	if (!tpl) return false;
	return tpl.content.querySelectorAll('a.tile[data-key^="note:"]').length >= 2;
});
assert(!!raceFolderKey, "a folder with two notes exists for the race tests");
const raceFolder = byKey(raceFolderKey);
dblclick(raceFolder);
await waitForModals(1);
assert(modalCount() === 1, "the race folder window is open");
const raceWin = topModal();
const keyA = raceWin.querySelectorAll('a.tile[data-key^="note:"]')[0].dataset
	.key;
const keyB = raceWin.querySelectorAll('a.tile[data-key^="note:"]')[1].dataset
	.key;
const pathOf = (key) =>
	new URL(window.noteIndex.find((n) => n.key === key).url, "http://localhost/")
		.pathname;

// each request gets its own resolver: nothing is keyed by note alone
const raceResolvers = [];
const realFetch3 = window.fetch;
window.fetch = async (url) => {
	const path = new URL(url, "http://localhost/").pathname;
	if (path !== pathOf(keyA) && path !== pathOf(keyB)) return realFetch3(url);
	return new Promise((resolve) => {
		raceResolvers.push({
			path,
			go: () =>
				resolve({
					ok: true,
					status: 200,
					text: async () =>
						readFileSync(
							`${DIST + path.replace(/^\//, "")}index.html`,
							"utf-8",
						),
				}),
		});
	});
};
const started = (path) => raceResolvers.some((r) => r.path === path);
const resolveLast = (path) => {
	const i = raceResolvers.findIndex((r) => r.path === path);
	const r = raceResolvers.splice(i, 1)[0];
	r.go();
};
const _tileIn = () => topModal().querySelector('a.tile[data-key^="note:"]');

// A, then B, then resolve B, then resolve A: A must not steal the window
dblclick(topModal().querySelector(`.tile[data-key="${keyA}"]`));
await new Promise((r) => setTimeout(r, 10));
assert(started(pathOf(keyA)), "the first request started");
dblclick(topModal().querySelector(`.tile[data-key="${keyB}"]`));
await new Promise((r) => setTimeout(r, 10));
assert(started(pathOf(keyB)), "the second request started");
resolveLast(pathOf(keyB)); // B lands first
await waitForKey(keyB);
await new Promise((r) => setTimeout(r, 50)); // let B's .then chain settle
resolveLast(pathOf(keyA)); // stale A lands last
await new Promise((r) => setTimeout(r, 50));
assert(
	topModal().dataset.key === keyB,
	"a stale response does not steal the window",
);
assert(
	topModal().history.length === 1,
	"a stale response adds no history entry",
);
assert(
	pageErrors.length === 0,
	`no page errors after a stale landing: ${pageErrors.join("; ")}`,
);

// stay on B: add a link to A in B's body, click it (A starts,
// held), then Back, then release A. The folder must remain.
const backLink = document.createElement("a");
backLink.href = pathOf(keyA);
backLink.textContent = "to A";
topModal().querySelector(".modal-body").appendChild(backLink);
click(backLink);
await new Promise((r) => setTimeout(r, 10));
assert(topModal().dataset.key === keyB, "the held page has not landed yet");
click(topModal().querySelector(".page-title .back")); // back cancels A
await new Promise((r) => setTimeout(r, 10));
assert(
	raceResolvers.some((r) => r.path === pathOf(keyA)),
	"the held request is still pending after back",
);
resolveLast(pathOf(keyA)); // the held page lands after the back
await new Promise((r) => setTimeout(r, 50));
assert(
	topModal().dataset.key === raceFolderKey,
	"back cancels a page still in flight",
);
assert(
	pageErrors.length === 0,
	`no page errors after a cancelled landing: ${pageErrors.join("; ")}`,
);

// close while a page flies in: the window stays closed. Reopen the
// folder, start A from its tile, close, release A.
closeModalOf(topModal());
dblclick(raceFolder);
await waitForModals(1);
dblclick(topModal().querySelector(`.tile[data-key="${keyA}"]`));
await new Promise((r) => setTimeout(r, 10));
assert(started(pathOf(keyA)), "the held request started again");
closeModalOf(topModal());
resolveLast(pathOf(keyA)); // the held page lands after the close
await new Promise((r) => setTimeout(r, 50));
assert(modalCount() === 0, "close cancels a page still in flight");
assert(
	pageErrors.length === 0,
	`no page errors after a late landing: ${pageErrors.join("; ")}`,
);

window.fetch = realFetch3;

/* link previews ---------------------------------------------------------- */

// the desktop page carries a description and the Open Graph basics, and
// a note page carries its own description and title
const metaOf = (doc) => ({
	desc: doc.querySelector('meta[name="description"]')?.content || "",
	ogDesc: doc.querySelector('meta[property="og:description"]')?.content || "",
	ogTitle: doc.querySelector('meta[property="og:title"]')?.content || "",
	ogType: doc.querySelector('meta[property="og:type"]')?.content || "",
	ogUrl: doc.querySelector('meta[property="og:url"]')?.content || "",
	ogSite: doc.querySelector('meta[property="og:site_name"]')?.content || "",
});
const homeMeta = metaOf(document);
assert(homeMeta.desc.length > 0, "the desktop page has a description");
assert(
	homeMeta.desc === homeMeta.ogDesc,
	"the description and the og:description agree",
);
assert(homeMeta.ogType === "website", "the desktop page is og:type website");
assert(/^https?:\/\//.test(homeMeta.ogUrl), "the desktop page has an absolute og:url");
assert(homeMeta.ogSite.length > 0, "the desktop page names its og:site_name");
assert(homeMeta.ogTitle.length > 0, "the desktop page has an og:title");

const notePage = new JSDOM(readFileSync(`${DIST}saisho-edit/index.html`, "utf-8"));
const noteMeta = metaOf(notePage.window.document);
assert(noteMeta.ogType === "article", "a note page is og:type article");
assert(
	noteMeta.ogTitle === "Saisho Editor",
	"a note page carries its own title in og:title",
);
assert(
	noteMeta.desc === "A tiny editor for Saisho" && noteMeta.desc === noteMeta.ogDesc,
	"a note page carries its own description",
);
assert(
	noteMeta.ogUrl.endsWith("/saisho-edit/"),
	"a note page carries its own absolute og:url",
);

/* keyboard access and the bucket container ------------------------------ */

const keydown = (el, key) =>
	el.dispatchEvent(
		new window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
	);

// every non-link object is reachable and announces itself
for (const el of document.querySelectorAll(".obj")) {
	if (el.matches("a[data-url]")) continue;
	assert(
		el.getAttribute("role") === "button" && el.tabIndex === 0,
		`object ${el.dataset.key} is a focusable button`,
	);
	assert(
		(el.getAttribute("aria-label") || "").length > 0,
		`object ${el.dataset.key} has an accessible name`,
	);
}

// the buckets sit inside one container, one level down
const bucketRootTpl = document.querySelector(
	'template.modal-tpl[data-key="folder:buckets"]',
);
assert(!!bucketRootTpl, "the bucket container has a window");
assert(
	[...bucketRootTpl.content.querySelectorAll('.tile[data-key^="folder:"]')]
		.length > 0,
	"the bucket container lists its topic folders",
);
assert(
	byKey("folder:rant") === null,
	"a topic folder is no longer a desktop object",
);

// Enter opens the focused object, focus enters the window, Escape closes
// it and focus returns to the object that opened it
const kbdObj = byKey("folder:latest");
kbdObj.focus();
keydown(kbdObj, "Enter");
assert(topModal()?.dataset.key === "folder:latest", "Enter opens the object");
assert(
	topModal().getAttribute("role") === "dialog",
	"an open window is a dialog",
);
assert(
	(topModal().getAttribute("aria-label") || "").length > 0,
	"the dialog carries the window title as its name",
);
assert(
	topModal().contains(document.activeElement),
	"focus moves into the opened window",
);
assert(
	topModal().getAttribute("aria-modal") === null,
	"the window is not modal: the desktop stays reachable",
);
keydown(document.activeElement, "Escape");
assert(modalCount() === 0, "Escape closes the front window");
assert(
	document.activeElement === kbdObj,
	"focus returns to the object that opened the window",
);

// a second press on space does the same as Enter
kbdObj.focus();
keydown(kbdObj, " ");
assert(topModal()?.dataset.key === "folder:latest", "Space opens the object");
keydown(document.activeElement, "Escape");
assert(modalCount() === 0, "Escape closes the space-opened window");

// a second Enter on the same object raises its window and puts focus
// back inside it, without stealing the return target
kbdObj.focus();
keydown(kbdObj, "Enter");
const againWin = topModal();
assert(againWin?.dataset.key === "folder:latest", "a second Enter raises the window");
assert(
	againWin.contains(document.activeElement),
	"a raised window takes focus back",
);
keydown(document.activeElement, "Escape");
assert(modalCount() === 0, "the raised window closes");
assert(
	document.activeElement === kbdObj,
	"the raised window still returns focus to its object",
);

// a tile inside a window is keyboard-operable and navigates its own
// window, not whatever else is in front
dblclick(byKey("folder:buckets"));
const bucketWin = topModal();
assert(!!bucketWin.querySelector('.tile[data-key="folder:buckets/rant"]'), "the bucket window holds a topic tile");
const bucketTile = bucketWin.querySelector('.tile[data-key="folder:buckets/rant"]');
assert(bucketTile.getAttribute("role") === "button" && bucketTile.tabIndex === 0, "a folder tile is a focusable button");
bucketTile.focus();
keydown(bucketTile, "Enter");
assert(
	topModal() === bucketWin &&
		bucketWin.querySelector('.tile[data-key="note:adhd"]'),
	"Enter on a tile navigates the window that holds it",
);
assert(
	bucketWin.contains(document.activeElement),
	"focus stays in the window after navigating",
);
closeAll();

// Find results are focusable, and closing Find returns focus to the
// object on the desktop, not to the search field inside it
const findObj = byKey("find");
findObj.focus();
keydown(findObj, "Enter");
const findWin = topModal();
assert(findWin?.dataset.key === "find", "Enter opens Find");
const findField = findWin.querySelector(".find-field");
assert(document.activeElement === findField, "Find focuses its field");
findField.value = "adhd";
findField.dispatchEvent(new window.Event("input", { bubbles: true }));
const findRow = findWin.querySelector(".find-results li.row");
assert(!!findRow, "Find renders a result");
assert(
	findRow.getAttribute("role") === "button" && findRow.tabIndex === 0,
	"a Find result is a focusable button",
);
findRow.focus();
keydown(findRow, "Escape");
assert(modalCount() === 0, "Escape closes Find");
assert(
	document.activeElement === findObj,
	"closing Find returns focus to its desktop object, not its field",
);

// a press does not raise a window by focus: the window under the
// pointer must not move before the click lands
dblclick(byKey("folder:latest"));
const pressBack = topModal();
dblclick(byKey("find"));
const pressFront = topModal();
const pressTile = pressBack.querySelector(".tile[data-key]");
pointer(pressTile, "pointerdown", 20, 20); // a press, no release yet
pressTile.focus();
assert(
	pressFront.classList.contains("is-front"),
	"a press alone does not raise another window",
);
pointer(pressTile, "pointerup", 20, 20);
pressFront.focus(); // move focus away first: focus() is a no-op otherwise
pressTile.focus();
assert(
	pressBack.classList.contains("is-front"),
	"after the release, focus raises its window",
);
closeAll();

// two windows: focusing a control in the back window brings it to the
// front, and Escape closes that window
dblclick(byKey("folder:latest"));
const backWin = topModal();
dblclick(byKey("find"));
const frontWin = topModal();
assert(frontWin !== backWin, "two windows are open");
assert(!backWin.classList.contains("is-front"), "the last opened window is in front");
const backTile = backWin.querySelector(".tile[data-key]");
backTile.focus();
assert(
	backWin.classList.contains("is-front"),
	"focusing a control raises that window",
);
assert(
	backWin.contains(document.activeElement),
	"raising a window keeps its focused control",
);
keydown(document.activeElement, "Escape");
assert(modalCount() === 1, "Escape closes the window the focus is in");
assert(
	topModal() === frontWin,
	"the other window is still open",
);
closeAll();

// an old deep link to a bucket resolves through the container
window.location.hash = "#folder:rant";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
assert(
	topModal()?.dataset.key === "folder:buckets/rant",
	"an old #folder:rant link opens the nested folder",
);
window.location.hash = "";
window.dispatchEvent(new window.HashChangeEvent("hashchange"));
assert(modalCount() === 0, "an empty hash closes the windows");

// a direct visit to a note page shows a plain .obj link back to the
// desktop; it has no key, so Enter and click must stay the browser's
{
	const noteDom = new JSDOM(readFileSync(`${DIST}saisho-edit/index.html`, "utf-8"), {
		runScripts: "outside-only",
		url: "http://localhost/saisho-edit/",
	});
	const noteWindow = noteDom.window;
	const narrow = {
		matches: false,
		addEventListener() {},
		removeEventListener() {},
	};
	noteWindow.matchMedia = () => narrow;
	noteWindow.fetch = async () => ({ ok: false, status: 404, text: async () => "" });
	noteWindow.eval(readFileSync(`${DIST}site.js`, "utf-8"));
	const home = noteWindow.document.querySelector(".obj.home-object");
	assert(!!home, "a note page carries a Desktop link");
	assert(home.dataset.key === undefined, "the Desktop link is not a window key");
	const homeEnter = new noteWindow.KeyboardEvent("keydown", {
		key: "Enter",
		bubbles: true,
		cancelable: true,
	});
	home.dispatchEvent(homeEnter);
	assert(
		!homeEnter.defaultPrevented,
		"Enter on the Desktop link keeps the link's own navigation",
	);
	const homeClick = new noteWindow.MouseEvent("click", {
		bubbles: true,
		cancelable: true,
	});
	home.dispatchEvent(homeClick);
	assert(!homeClick.defaultPrevented, "a click on the Desktop link is not swallowed");
	assert(
		noteWindow.document.querySelectorAll(".modal-layer .modal").length === 1,
		"the Desktop link opens no window",
	);
	// on a phone the same click opens objects; a link with no key must
	// still be left to the browser
	narrow.matches = true;
	const tap = new noteWindow.MouseEvent("click", { bubbles: true, cancelable: true });
	home.dispatchEvent(tap);
	assert(!tap.defaultPrevented, "a phone tap on the Desktop link is not swallowed");
	assert(
		noteWindow.document.querySelectorAll(".modal-layer .modal").length === 1,
		"a phone tap on the Desktop link opens no window",
	);
	narrow.matches = false;
	noteWindow.close();
}


console.log("---");
assert(
	/^\d\d:\d\d$/.test(document.getElementById("clock").textContent),
	"the menubar shows a clock",
);
assert(
	pageErrors.length === 0,
	`the page threw no errors: ${pageErrors.join("; ")}`,
);
console.log(`SMOKE PASS (${passed} assertions)`);
dom.window.close();
