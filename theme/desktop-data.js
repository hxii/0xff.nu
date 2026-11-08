/* Build the desktop from Hajime's entry metadata and evaluated queries. */
(() => {
	const data = document.getElementById("entry-data");
	if (!data) return;
	const { entries, queries } = JSON.parse(data.textContent);
	const desktop = document.querySelector(".desktop");
	const esc = (value) =>
		String(value ?? "").replace(
			/[&<>"']/g,
			(c) =>
				({
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': "&quot;",
					"'": "&#39;",
				})[c],
		);
	const slug = (value) =>
		String(value)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "") || "note";
	const ref = (value) =>
		slug(
			String(value).replace(/\[|\]/g, "").split("|")[0].trim().split("/").pop(),
		);
	const icon = (name) =>
		`<img class="pix" src="icons/${esc(name)}.png" alt="" width="16" height="16">`;
	const noteIcon = (entry) =>
		entry.extra.stricon
			? `<img class="note-icon" src="data:image/gif;base64,${esc(entry.extra.stricon)}" alt="" width="16" height="16">`
			: icon(
					/^[a-z0-9-]+$/.test(entry.extra.icon || "")
						? entry.extra.icon
						: "file",
				);
	const visible = entries.filter(
		(entry) => !entry.tags.some((tag) => tag.toLowerCase() === "hide"),
	);
	const notes = visible.filter((entry) => entry.type !== "set");
	const folders = [];
	const claimed = new Set();
	function addFolder(name, spec, parent, members) {
		const path = parent ? `${parent.slug}/${slug(name)}` : slug(name);
		let folder = folders.find((item) => item.slug === path);
		if (!folder) {
			folder = {
				slug: path,
				title: spec.title || name,
				filter: spec.filter || "",
				description: spec.description || "",
				icon: spec.icon,
				stricon: spec.stricon,
				parent,
				children: [],
				folders: [],
			};
			folders.push(folder);
			if (parent) parent.folders.push(folder);
		}
		for (const entry of members) {
			if (!folder.children.includes(entry)) folder.children.push(entry);
			claimed.add(entry.key);
		}
		folder.children.sort((a, b) => b.date.localeCompare(a.date));
		return folder;
	}
	for (const query of queries) {
		const ids = new Set([
			...(query.matches || []),
			...(query.files || []).map(slug),
		]);
		const members = notes.filter((entry) => ids.has(entry.key.slice(5)));
		if (members.length) addFolder(query.name, query, null, members);
	}
	const buckets = [
		...new Set(notes.map((entry) => entry.extra.bucket).filter(Boolean)),
	].sort((a, b) => a.localeCompare(b));
	for (const bucket of buckets)
		addFolder(
			bucket,
			{ filter: `bucket:"${bucket}" && !type:set` },
			null,
			notes.filter((entry) => entry.extra.bucket === bucket),
		);
	for (const set of visible.filter((entry) => entry.type === "set")) {
		const ids = new Set([set.key.slice(5), slug(set.title)]);
		const members = notes.filter((entry) =>
			entry.parent.some((parent) => ids.has(ref(parent))),
		);
		let parent = set.parent
			.map(ref)
			.map((name) =>
				folders.find(
					(folder) => folder.slug === name || slug(folder.title) === name,
				),
			)
			.find(Boolean);
		if (!parent && set.extra.bucket)
			parent =
				folders.find((folder) => folder.slug === slug(set.extra.bucket)) ||
				addFolder(set.extra.bucket, {}, null, []);
		const folder = addFolder(
			set.title,
			{ icon: set.extra.icon, stricon: set.extra.stricon },
			parent,
			members,
		);
		if (parent)
			parent.children = parent.children.filter(
				(entry) => !folder.children.includes(entry),
			);
	}
	const attrs = (item) =>
		` data-title="${esc(item.title)}" data-date="${esc(item.day || item.date || "")}" data-tags="${esc((item.tags || []).join(","))}" data-desc="${esc(item.description || "")}"`;
	const foldersHtml = folders
		.map((folder) => {
			const safe = folder.slug.replaceAll("/", "-");
			const sub = folder.folders
				.map(
					(child) =>
						`<div class="tile" id="sub-${safe}-${esc(child.slug.replaceAll("/", "-"))}" data-key="folder:${esc(child.slug)}"${attrs({ ...child, day: child.children[0]?.date })}><span class="tile-icon">${child.stricon ? noteIcon({ extra: child }) : icon(child.icon || "file")}</span><span class="tile-title">${esc(child.title)}</span><span class="tile-date">${esc(child.children[0]?.date || "")}</span></div>`,
				)
				.join("");
			const tiles = folder.children
				.map((entry) => {
					const id = entry.key.slice(5);
					const picture =
						entry.type === "image"
							? `<span class="tile-icon tile-lqip" data-lqip="${esc(id)}"><span class="lqip"></span></span>`
							: `<span class="tile-icon">${noteIcon(entry)}</span>`;
					return `<a class="tile" id="row-${safe}-${esc(id)}" data-key="${esc(entry.key)}" style="view-transition-name:note-${esc(id)}" data-tags="${esc(entry.tags.join(","))}" data-desc="${esc(entry.description)}" href="${esc(entry.url)}">${picture}<span class="tile-title">${esc(entry.title)}</span><span class="tile-date">${esc(entry.date)}</span></a>`;
				})
				.join("");
			const strip = folder.filter
				? `<div class="modal-info"><span class="mi-label">FLTR:</span><span class="mi-query">${esc(folder.filter)}</span><span class="mi-label">SRT:</span><span class="mi-query">date</span><span class="mi-label">CNT:</span><span class="mi-count">${folder.children.length}</span></div>`
				: "";
			return `<template class="modal-tpl" data-key="folder:${esc(folder.slug)}"><div class="modal" data-key="folder:${esc(folder.slug)}"><div class="modal-head"><span class="title">${esc(folder.title)}</span></div>${strip}<div class="modal-body"><div class="folder-grid">${sub}${tiles}</div></div><div class="grip"></div></div></template>`;
		})
		.join("");
	const objects = [
		...folders
			.filter((folder) => !folder.parent)
			.map((folder) => ({
				...folder,
				kind: "folder",
				key: `folder:${folder.slug}`,
				id: `item-folder-${folder.slug}`,
				day: folder.children[0]?.date,
				icon: folder.stricon
					? `<img class="note-icon" src="data:image/gif;base64,${esc(folder.stricon)}" alt="" width="16" height="16">`
					: icon(folder.icon || "folder"),
				openIcon: folder.icon || folder.stricon ? "" : icon("folder-open"),
			})),
		...notes
			.filter((entry) => !claimed.has(entry.key))
			.map((entry) => ({
				...entry,
				kind: "note",
				id: `item-note-${entry.key.slice(5)}`,
				icon: noteIcon(entry),
			})),
		{
			kind: "system",
			key: "about",
			id: "item-about",
			title: "About This System",
			description:
				"How this desktop is put together. Stats, background and version.",
			icon: icon("about"),
		},
		{
			kind: "system",
			key: "find",
			id: "item-find",
			title: "Find",
			description: "Search every published note.",
			icon: icon("find"),
		},
	];
	const objectHtml = objects
		.map((item, i) => {
			const tag = item.url ? "a" : "div";
			const icons = item.openIcon
				? `<span class="icon closed">${item.icon}</span><span class="icon open">${item.openIcon}</span>`
				: `<span class="icon">${item.icon}</span>`;
			return `<${tag} class="obj" id="${esc(item.id)}" data-kind="${item.kind}" data-key="${esc(item.key)}"${attrs(item)}${item.url ? ` data-url="${esc(item.url)}" href="${esc(item.url)}"` : ""} style="left:${20 + (i % 4) * 160}px;top:${20 + Math.floor(i / 4) * 120}px;">${icons}<div class="label">${esc(item.title)}</div><span class="sel-overlay"></span></${tag}>`;
		})
		.join("");
	const find = `<template class="modal-tpl" data-key="find"><div class="modal" data-key="find"><div class="modal-head"><span class="title">Find</span></div><div class="modal-body"><div class="body"><input class="find-field" type="search" placeholder="Search title, tag or filename" aria-label="Search notes"><ul class="find-results"></ul></div></div><div class="grip"></div></div></template>`;
	const summary = `${folders.filter((folder) => !folder.parent).length} collections  ·  ${visible.length} notes  ·  ${new Set(visible.flatMap((entry) => entry.tags)).size} tags  ·  ${entries.length - visible.length} hidden`;
	desktop.insertAdjacentHTML(
		"afterbegin",
		`${objectHtml}<div class="templates">${foldersHtml}${find}</div><div hidden id="desktop-summary">${esc(summary)}</div>`,
	);
})();
