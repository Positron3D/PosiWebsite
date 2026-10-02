// ABOUTME: WYSIWYG blog editor: edit the rendered post directly; the saved file is Blog/*.md Markdown.
// ABOUTME: Renders with assets/py/blogmd.py via Pyodide (same as the build) and converts edits back with turndown.
(function () {
  "use strict";
  var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/";
  var PACKAGES = ["markdown==3.11", "pymdown-extensions==12.1", "Pygments==2.21.0"]; // keep in step with _build/requirements.txt
  var UPLOAD_URL = "https://github.com/Positron3D/PosiWebsite/upload/main/Blog";
  var STORE = "positron-blog-draft";
  var FIELDS = ["title", "date", "author", "summary", "cover", "tags"];
  var PLACEMENTS = ["left", "right", "center", "full", "wide"];

  var $ = function (id) { return document.getElementById(id); };
  var visual = $("ed-visual"), source = $("ed-body"), status = $("ed-status");
  var md = "";            // the post body in Markdown: the source of truth
  var mode = "visual";
  var images = {};        // file name -> {url: blob URL, file: Blob}, for images added or opened this session
  var selectedImg = null;
  var py = null, syncTimer = null;

  // ---------- small helpers ----------
  function field(k) { return $("ed-" + k).value.trim(); }
  function today() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); } // local date
  function slug() { return (field("title") || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled"; }
  function fileName() { return (field("date") || today()) + "-" + slug() + ".md"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function setStatus(msg, bad) { status.textContent = msg; status.classList.toggle("is-error", !!bad); }

  function compose() {
    var lines = FIELDS.filter(function (k) { return field(k); }).map(function (k) { return k + ": " + field(k).replace(/\n/g, " "); });
    if ($("ed-draft").checked) lines.push("draft: true");
    return lines.join("\n") + "\n\n" + md.replace(/^\s+/, "").replace(/\s+$/, "") + "\n";
  }

  // Run the build's renderer. Throws a readable message on front-matter errors.
  function pyRender(text) {
    py.globals.set("src", text);
    var out = py.runPython("import blogmd, json\nm, h = blogmd.render(src)\njson.dumps({'html': h, 'minutes': m['minutes'], 'tags': m['tags'], 'cover': m.get('cover', '')})");
    return JSON.parse(out);
  }
  // Render a body fragment (no front matter of its own).
  function renderBody(body) { return withBlobs(pyRender("title: x\ndate: 2000-01-01\nauthor: x\n\n" + body).html); }
  function withBlobs(html) {
    return html.replace(/(src|href)="Blog\/([^"]+)"/g, function (all, attr, name) { return images[name] ? attr + '="' + images[name].url + '"' : all; });
  }
  function errorText(e) {
    var msg = String(e.message || e).split("\n").filter(Boolean).pop();
    return msg.replace(/^blogmd\.PostError: /, "Fix before publishing: ");
  }

  // ---------- HTML -> Markdown (the inverse of blogmd.py's output) ----------
  var td = new window.TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced", bulletListMarker: "-", emDelimiter: "*", hr: "---" });
  td.use(window.turndownPluginGfm.tables);
  td.keep(["iframe"]);
  var abbrs = {};
  function has(node, cls) { return node.classList && node.classList.contains(cls); }
  function indent(text) { return text.replace(/^(?=.)/gm, "    "); }
  function inner(node) { return td.turndown(node.innerHTML || ""); }
  function blockOf(nodes) { var d = document.createElement("div"); nodes.forEach(function (n) { d.appendChild(n.cloneNode(true)); }); return td.turndown(d.innerHTML); }
  function srcOf(img) {
    var src = img.getAttribute("src") || "";
    for (var name in images) { if (images[name].url === src) return name; }
    return src.replace(/^Blog\//, "");
  }
  function imageMd(img) {
    var attrs = [];
    PLACEMENTS.forEach(function (p) { if (has(img, p)) attrs.push("." + p); });
    if (img.getAttribute("width")) attrs.push("width=" + img.getAttribute("width"));
    return "![" + (img.getAttribute("alt") || "") + "](" + srcOf(img) + ")" + (attrs.length ? "{" + attrs.join(" ") + "}" : "");
  }
  var RULES = {
    headerlink: { filter: function (n) { return n.nodeName === "A" && has(n, "headerlink"); }, replacement: function () { return ""; } },
    toc: { filter: function (n) { return n.nodeName === "DIV" && has(n, "toc"); }, replacement: function () { return "\n\n[TOC]\n\n"; } },
    image: { filter: "img", replacement: function (c, n) { return imageMd(n); } },
    figure: {
      filter: "figure",
      replacement: function (c, n) {
        var img = n.querySelector("img"), cap = n.querySelector("figcaption");
        return '\n\n<figure class="' + esc(n.className) + '" markdown>\n' + (img ? imageMd(img) + "\n" : "") +
          (cap ? "<figcaption>" + esc(cap.textContent.trim()) + "</figcaption>\n" : "") + "</figure>\n\n";
      }
    },
    mark: { filter: "mark", replacement: function (c) { return c ? "==" + c + "==" : ""; } },
    strike: { filter: ["del", "s", "strike"], replacement: function (c) { return c ? "~~" + c + "~~" : ""; } },
    insert: { filter: ["ins", "u"], replacement: function (c) { return c ? "^^" + c + "^^" : ""; } },
    sub: { filter: "sub", replacement: function (c) { return "~" + c.replace(/ /g, "\\ ") + "~"; } },
    footnoteRef: {
      filter: function (n) { return n.nodeName === "SUP" && n.querySelector("a.footnote-ref"); },
      replacement: function (c, n) { return "[^" + n.querySelector("a").getAttribute("href").replace(/^#fn:/, "") + "]"; }
    },
    sup: { filter: function (n) { return n.nodeName === "SUP" && !n.querySelector("a.footnote-ref"); }, replacement: function (c) { return "^" + c.replace(/ /g, "\\ ") + "^"; } },
    keys: {
      filter: function (n) { return n.nodeName === "SPAN" && has(n, "keys"); },
      replacement: function (c, n) {
        return "++" + Array.prototype.map.call(n.querySelectorAll("kbd"), function (k) {
          var cls = Array.prototype.find.call(k.classList, function (x) { return x.indexOf("key-") === 0; });
          return cls ? cls.slice(4) : k.textContent.trim().toLowerCase();
        }).join("+") + "++";
      }
    },
    admonition: {
      filter: function (n) { return n.nodeName === "DIV" && has(n, "admonition"); },
      replacement: function (c, n) {
        var type = Array.prototype.filter.call(n.classList, function (x) { return x !== "admonition"; })[0] || "note";
        var titleEl = n.querySelector(":scope > .admonition-title");
        var title = titleEl ? titleEl.textContent.trim() : "";
        var head = "!!! " + type + (title.toLowerCase() === type ? "" : ' "' + title.replace(/"/g, "'") + '"');
        var body = blockOf(Array.prototype.filter.call(n.children, function (x) { return x !== titleEl; }));
        return "\n\n" + head + "\n" + indent(body) + "\n\n";
      }
    },
    details: {
      filter: "details",
      replacement: function (c, n) {
        var sum = n.querySelector(":scope > summary");
        var head = "???" + (n.open ? "+" : "") + " " + (n.className.split(/\s+/)[0] || "note") + ' "' + (sum ? sum.textContent.trim().replace(/"/g, "'") : "") + '"';
        return "\n\n" + head + "\n" + indent(blockOf(Array.prototype.filter.call(n.children, function (x) { return x !== sum; }))) + "\n\n";
      }
    },
    tabs: {
      filter: function (n) { return n.nodeName === "DIV" && has(n, "tabbed-set"); },
      replacement: function (c, n) {
        var labels = n.querySelectorAll(":scope > .tabbed-labels > label");
        var blocks = n.querySelectorAll(":scope > .tabbed-content > .tabbed-block");
        var out = Array.prototype.map.call(labels, function (l, i) {
          return '=== "' + l.textContent.trim().replace(/"/g, "'") + '"\n' + indent(blocks[i] ? inner(blocks[i]) : "");
        });
        return "\n\n" + out.join("\n\n") + "\n\n";
      }
    },
    taskBox: {
      filter: function (n) { return n.nodeName === "LABEL" && has(n, "task-list-control"); },
      replacement: function (c, n) { var i = n.querySelector("input"); return i && i.checked ? "[x]" : "[ ]"; }
    },
    deflist: {
      filter: "dl",
      replacement: function (c, n) {
        return "\n\n" + Array.prototype.map.call(n.children, function (x) {
          return x.nodeName === "DT" ? x.textContent.trim() : ":   " + inner(x).replace(/\n/g, "\n    ");
        }).join("\n") + "\n\n";
      }
    },
    abbr: { filter: "abbr", replacement: function (c, n) { if (n.title) abbrs[n.textContent] = n.title; return c; } },
    footnotes: {
      filter: function (n) { return n.nodeName === "DIV" && has(n, "footnote"); },
      replacement: function (c, n) {
        return "\n\n" + Array.prototype.map.call(n.querySelectorAll("li[id^='fn:']"), function (li) {
          var copy = li.cloneNode(true);
          copy.querySelectorAll(".footnote-backref").forEach(function (b) { b.remove(); });
          return "[^" + li.id.slice(3) + "]: " + inner(copy).trim();
        }).join("\n") + "\n\n";
      }
    },
    // Pygments output: <div class="language-ini highlight"><pre><span></span><code>…spans…</code></pre></div>
    highlighted: {
      filter: function (n) { return n.nodeName === "DIV" && has(n, "highlight"); },
      replacement: function (c, n) {
        var m = /(?:^|\s)language-(\S+)/.exec(n.className), lang = m && m[1] !== "text" ? m[1] : "";
        var src = (n.querySelector("code") || n).cloneNode(true);
        src.querySelectorAll("br").forEach(function (br) { br.replaceWith("\n"); });
        var code = src.textContent.replace(/\n$/, "");
        var fence = /```/.test(code) ? "````" : "```";
        return "\n\n" + fence + lang + "\n" + code + "\n" + fence + "\n\n";
      }
    },
    video: { filter: function (n) { return n.nodeName === "DIV" && has(n, "video"); }, replacement: function (c, n) { return "\n\n" + n.outerHTML + "\n\n"; } },
    bareLink: {
      filter: function (n) { return n.nodeName === "A" && n.getAttribute("href") && n.getAttribute("href") === n.textContent; },
      replacement: function (c, n) { return n.getAttribute("href"); }
    }
  };
  Object.keys(RULES).forEach(function (k) { td.addRule(k, RULES[k]); }); // note: later rules win, so filters must not overlap

  function toMarkdown(root) {
    var clone = root.cloneNode(true);
    clone.querySelectorAll("th[style], td[style]").forEach(function (c) { if (c.style.textAlign) c.setAttribute("align", c.style.textAlign); });
    clone.querySelectorAll(".is-selected").forEach(function (c) { c.classList.remove("is-selected"); if (!c.className) c.removeAttribute("class"); });
    abbrs = {};
    var out = td.turndown(clone.innerHTML.replace(/\u200b/g, ""));
    var defs = Object.keys(abbrs).map(function (k) { return "*[" + k + "]: " + abbrs[k]; });
    return (out + (defs.length ? "\n\n" + defs.join("\n") : "")).replace(/^[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim(); // drop empty-paragraph blanks
  }

  // ---------- rendering and syncing ----------
  function save() { try { localStorage.setItem(STORE, compose()); } catch (e) { /* storage blocked: no autosave */ } }

  function refreshHeader() {
    $("ed-filename").textContent = "Blog/" + fileName();
    var tags = field("tags").split(",").map(function (t) { return t.trim(); }).filter(Boolean);
    var cover = field("cover"), coverSrc = cover ? ((images[cover] && images[cover].url) || (/^(https?:|\/|\.\.)/.test(cover) ? cover.replace(/^\.\.\//, "") : "Blog/" + cover)) : "";
    $("ed-head").innerHTML =
      "<h1>" + esc(field("title") || "Untitled") + "</h1>" +
      '<p class="post-meta">' + esc(field("date")) + " · " + esc(field("author")) + "</p>" +
      '<p class="post-tags">' + ($("ed-draft").checked ? '<span class="tag tag--draft">Draft</span>' : "") +
      tags.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</p>" +
      (coverSrc ? '<img class="post-cover" src="' + esc(coverSrc) + '" alt="">' : "");
  }

  function validate() {
    save();
    refreshHeader();
    refreshSave();
    if (!py) return;
    try { pyRender(compose()); setStatus("Saved in this browser · " + md.split(/\s+/).filter(Boolean).length + " words"); }
    catch (e) { setStatus(errorText(e), true); }
  }

  function renderVisual() {
    if (!py) return;
    try { visual.innerHTML = withBlobs(pyRender(compose()).html); }
    catch (e) { visual.innerHTML = withBlobs(renderBody(md)); }
    validate();
  }

  function fromVisual() { clearTimeout(syncTimer); syncTimer = setTimeout(function () { md = toMarkdown(visual); validate(); }, 300); }
  function fromSource() { md = source.value; clearTimeout(syncTimer); syncTimer = setTimeout(validate, 300); }

  function setMode(m) {
    if (m === mode) return;
    clearTimeout(syncTimer);
    if (mode === "visual") md = toMarkdown(visual); else md = source.value;
    mode = m;
    source.value = md;
    if (m === "visual") renderVisual();
    $("ed-visual-wrap").hidden = m !== "visual";
    source.hidden = m !== "markdown";
    document.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.mode === m)); });
    (m === "visual" ? visual : source).focus();
  }

  function load(text) {
    var parts = text.replace(/\r\n/g, "\n").split(/\n\s*\n/);
    var meta = {};
    if (/^[A-Za-z_]+:/.test(parts[0])) {
      parts.shift().split("\n").forEach(function (l) { var m = l.match(/^([A-Za-z_]+):\s*(.*)$/); if (m) meta[m[1].toLowerCase()] = m[2]; });
    }
    FIELDS.forEach(function (k) { $("ed-" + k).value = meta[k] || ""; });
    $("ed-draft").checked = /^(true|yes|1)$/i.test(meta.draft || "");
    md = parts.join("\n\n");
    source.value = md;
    if (mode === "visual") renderVisual(); else validate();
  }

  // ---------- commands: one registry for the toolbar, shortcuts and the "/" menu ----------
  // block: Markdown snippet (rendered and inserted in Visual mode, typed in Markdown mode)
  // exec:  [execCommand, value] for Visual mode; md: [before, sample, after] for Markdown mode
  var COMMANDS = {
    undo: { label: "Undo", keys: "Mod+Z", exec: ["undo"] },
    redo: { label: "Redo", keys: "Mod+Shift+Z", exec: ["redo"] },
    p: { label: "Text", keys: "Mod+Alt+0", exec: ["formatBlock", "p"], md: ["", "", ""], menu: "Plain paragraph" },
    h2: { label: "Heading", keys: "Mod+Alt+2", exec: ["formatBlock", "h2"], md: ["\n## ", "Heading", "\n"], menu: "Big section heading", auto: "##" },
    h3: { label: "Subheading", keys: "Mod+Alt+3", exec: ["formatBlock", "h3"], md: ["\n### ", "Subheading", "\n"], menu: "Smaller heading", auto: "###" },
    bold: { label: "Bold", keys: "Mod+B", exec: ["bold"], md: ["**", "bold", "**"], state: "bold" },
    italic: { label: "Italic", keys: "Mod+I", exec: ["italic"], md: ["*", "italic", "*"], state: "italic" },
    strike: { label: "Strikethrough", keys: "Mod+Shift+X", exec: ["strikeThrough"], md: ["~~", "struck", "~~"], state: "strikeThrough" },
    mark: { label: "Highlight", keys: "Mod+Shift+H", wrap: "mark", md: ["==", "highlight", "=="] },
    code: { label: "Inline code", keys: "Mod+E", wrap: "code", md: ["`", "code", "`"] },
    link: { label: "Link", keys: "Mod+K", run: function () { openLink(); }, md: ["[", "link text", "](https://)"] },
    ul: { label: "Bulleted list", keys: "Mod+Shift+8", exec: ["insertUnorderedList"], md: ["\n- ", "Item", "\n"], state: "insertUnorderedList", menu: "A simple list", auto: "-" },
    ol: { label: "Numbered list", keys: "Mod+Shift+7", exec: ["insertOrderedList"], md: ["\n1. ", "Item", "\n"], state: "insertOrderedList", menu: "A list with numbers", auto: "1." },
    task: { label: "Task list", block: "- [ ] To do\n- [x] Done", menu: "Checklist with tick boxes", auto: "[]" },
    quote: { label: "Quote", keys: "Mod+Shift+9", exec: ["formatBlock", "blockquote"], md: ["\n> ", "Quote", "\n"], menu: "Quote someone", auto: ">" },
    note: { label: "Note callout", block: "!!! note\n    Callout text.", menu: "Highlighted note box" },
    tip: { label: "Tip callout", block: '!!! tip "Pro tip"\n    Callout text.', menu: "Green tip box" },
    warning: { label: "Warning callout", block: "!!! warning\n    Callout text.", menu: "Amber warning box" },
    details: { label: "Collapsible section", block: '??? info "Click to expand"\n    Hidden until opened.', menu: "Hidden until clicked" },
    tabs: { label: "Tabs", block: '=== "Klipper"\n    ```ini\n    [printer]\n    ```\n\n=== "Marlin"\n    ```c\n    #define COREXY\n    ```', menu: "Switchable tabs, e.g. per firmware" },
    table: { label: "Table", block: "| Column | Column |\n|:--|:--|\n| Cell | Cell |", menu: "Rows and columns" },
    fence: { label: "Code block", block: "```ini\n[printer]\nkinematics: corexy\n```", menu: "Config, G-code or code", auto: "```" },
    image: { label: "Image", run: function () { $("ed-images").click(); }, menu: "Upload a photo (or drag one in)" },
    video: { label: "YouTube video", block: '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="What the video shows" allowfullscreen></iframe></div>', menu: "Embed a YouTube video" },
    toc: { label: "Table of contents", block: "[TOC]", menu: "Links to every heading" },
    hr: { label: "Divider", block: "---", menu: "Horizontal line", auto: "---" }
  };
  var IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);
  function keyLabel(k) { return k.replace("Mod", IS_MAC ? "⌘" : "Ctrl").replace("Alt", IS_MAC ? "⌥" : "Alt").replace("Shift", IS_MAC ? "⇧" : "Shift"); }
  var SHORTCUTS = {};
  Object.keys(COMMANDS).forEach(function (k) { if (COMMANDS[k].keys) SHORTCUTS[COMMANDS[k].keys.toLowerCase()] = k; });

  function insertSource(before, text, after) {
    var s = source.selectionStart, e = source.selectionEnd, sel = source.value.slice(s, e) || text;
    source.setRangeText(before + sel + after, s, e, "end");
    source.selectionStart = s + before.length; source.selectionEnd = s + before.length + sel.length;
    source.focus(); fromSource();
  }
  function wrapSelection(tag) {
    var sel = window.getSelection(), el = closestIn(sel.anchorNode, tag.toUpperCase());
    if (el) { // toggle off: unwrap the element
      while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
      el.remove();
      return;
    }
    if (sel.isCollapsed) { // nothing selected: start the format for what's typed next
      var el2 = document.createElement(tag);
      el2.textContent = "\u200b";
      sel.getRangeAt(0).insertNode(el2);
      var r = document.createRange(); r.setStart(el2.firstChild, 1); r.collapse(true);
      sel.removeAllRanges(); sel.addRange(r);
      return;
    }
    document.execCommand("insertHTML", false, "<" + tag + ">" + esc(sel.toString()) + "</" + tag + ">");
  }
  function closestIn(node, names) {
    for (var n = node; n && n !== visual; n = n.parentNode) if (n.nodeName && names.indexOf(n.nodeName) !== -1) return n;
    return null;
  }
  function topBlock(node) {
    if (!node || !visual.contains(node) || node === visual) return null;
    while (node.parentNode !== visual) node = node.parentNode;
    return node;
  }
  // The caret's top-level block. Bare text typed straight into the editor is wrapped in a <p> first,
  // so every block feature (autoformat, "/" menu, inserts) can rely on paragraphs.
  function caretBlock() {
    var s = window.getSelection(), b = s.rangeCount ? topBlock(s.anchorNode) : null;
    if (b && b.nodeType === 3) { document.execCommand("formatBlock", false, "p"); b = topBlock(s.anchorNode); }
    return b;
  }
  function isEmptyBlock(b) { return b && b.nodeName === "P" && !b.textContent.trim() && !b.querySelector("img,iframe"); }
  function placeCaret(node, atEnd) {
    var r = document.createRange(), sel = window.getSelection();
    r.selectNodeContents(node); r.collapse(!atEnd);
    sel.removeAllRanges(); sel.addRange(r);
  }

  function runCommand(k) {
    var c = COMMANDS[k];
    if (mode === "markdown") {
      if (c.run) return c.run();
      if (c.block) return insertSource("\n", c.block, "\n");
      if (c.md) return insertSource(c.md[0], c.md[1], c.md[2]);
      return document.execCommand(c.exec[0]); // undo/redo in the textarea
    }
    visual.focus();
    var blk = caretBlock();
    if ((k === "ul" || k === "ol") && isEmptyBlock(blk)) { // Chrome nests lists inside an empty <p>; build it directly
      var list = document.createElement(k), li = document.createElement("li");
      li.appendChild(document.createElement("br")); list.appendChild(li);
      blk.replaceWith(list); placeCaret(li, false);
      fromVisual(); updateState(); return;
    }
    if (c.run) c.run();
    else if (c.block) insertBlockVisual(c.block);
    else if (c.wrap) wrapSelection(c.wrap);
    else document.execCommand(c.exec[0], false, c.exec[1] || null);
    fromVisual(); updateState();
  }

  // Blocks (callouts, tabs, images…) go after the paragraph holding the caret, never inside it:
  // inserting block HTML mid-paragraph makes browsers merge it into the text.
  // An empty paragraph (e.g. after choosing from the "/" menu) is replaced instead.
  function insertBlockVisual(snippet) {
    if (!py) return;
    var sel = window.getSelection();
    var anchor = sel.rangeCount ? topBlock(sel.anchorNode) : null;
    var tmp = document.createElement("div");
    tmp.innerHTML = renderBody(snippet);
    var after = document.createElement("p");
    after.appendChild(document.createElement("br"));
    tmp.appendChild(after);
    var ref = anchor ? anchor.nextSibling : null;
    while (tmp.firstChild) visual.insertBefore(tmp.firstChild, ref);
    if (isEmptyBlock(anchor)) anchor.remove();
    placeCaret(after, false);
    visual.focus();
    fromVisual();
  }

  // Toolbar buttons
  document.querySelectorAll("[data-cmd]").forEach(function (b) {
    var c = COMMANDS[b.dataset.cmd];
    b.title = c.label + (c.keys ? " (" + keyLabel(c.keys) + ")" : "");
    b.setAttribute("aria-label", c.label);
    b.addEventListener("mousedown", function (ev) { ev.preventDefault(); }); // keep the text selection
    b.addEventListener("click", function () { runCommand(b.dataset.cmd); });
  });

  function insertNewlineInCode() {
    var sel = window.getSelection(), r = sel.getRangeAt(0);
    r.deleteContents();
    var nl = document.createTextNode("\n");
    r.insertNode(nl);
    r.setStartAfter(nl); r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    fromVisual();
  }

  // Toolbar dividers sit between groups on the same row; the first group of each wrapped row has none.
  var groups = Array.prototype.slice.call(document.querySelectorAll(".editor__group"));
  function markRows() {
    groups.forEach(function (g, i) { g.classList.toggle("is-row-start", i === 0 || g.offsetTop !== groups[i - 1].offsetTop); });
  }
  if (window.ResizeObserver) new ResizeObserver(markRows).observe(document.querySelector(".editor__toolbar"));
  markRows();

  // Keyboard shortcuts (both modes)
  function comboOf(ev) {
    var key = ev.code.replace(/^Key|^Digit/, "").toLowerCase();
    return (ev.ctrlKey || ev.metaKey ? "mod+" : "") + (ev.altKey ? "alt+" : "") + (ev.shiftKey ? "shift+" : "") + key;
  }
  [visual, source].forEach(function (el) {
    el.addEventListener("keydown", function (ev) {
      if (menu.open && handleMenuKey(ev)) return;
      if (el === visual && ev.key === "Enter" && !ev.shiftKey && closestIn(window.getSelection().anchorNode, ["PRE"])) {
        ev.preventDefault(); insertNewlineInCode(); return; // keep code as real newline characters, not <br>
      }
      var k = SHORTCUTS[comboOf(ev)];
      if (k && k !== "undo" && k !== "redo") { ev.preventDefault(); runCommand(k); }
      else if (el === visual) autoformat(ev);
    });
  });

  // Toolbar state: highlight the formats under the caret
  function updateState() {
    if (mode !== "visual" || !visual.contains(window.getSelection().anchorNode)) return;
    var n = window.getSelection().anchorNode, block = caretBlock();
    var on = {
      bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic"),
      strike: document.queryCommandState("strikeThrough"),
      ul: document.queryCommandState("insertUnorderedList"), ol: document.queryCommandState("insertOrderedList"),
      mark: !!closestIn(n, ["MARK"]), code: !!closestIn(n, ["CODE"]), link: !!closestIn(n, ["A"]),
      h2: !!(block && block.nodeName === "H2"), h3: !!(block && block.nodeName === "H3"),
      quote: !!closestIn(n, ["BLOCKQUOTE"]), p: !!(block && block.nodeName === "P")
    };
    document.querySelectorAll("[data-cmd]").forEach(function (b) {
      if (b.dataset.cmd in on) b.setAttribute("aria-pressed", String(on[b.dataset.cmd]));
    });
  }
  // Drop formats started with nothing selected and then left empty (they hold only a zero-width space).
  function cleanEmptyFormats() {
    var at = window.getSelection().anchorNode;
    visual.querySelectorAll("mark, code").forEach(function (el) {
      if (el.textContent.replace(/\u200b/g, "") === "" && !el.contains(at)) el.remove();
    });
  }
  document.addEventListener("selectionchange", function () { if (mode === "visual") { cleanEmptyFormats(); updateState(); } updateBubble(); });

  // Markdown-style autoformat at the start of a paragraph: "## " heading, "- " list, "> " quote,
  // "1. " numbered, "[] " tasks; "---" or "```" then Enter for a divider or code block.
  function autoformat(ev) {
    if (ev.key !== " " && ev.key !== "Enter") return;
    var sel = window.getSelection(), block = caretBlock();
    if (!block || block.nodeName !== "P" || !sel.isCollapsed) return;
    var text = block.textContent;
    var k = Object.keys(COMMANDS).find(function (x) { return COMMANDS[x].auto === text; });
    if (!k || (ev.key === "Enter") !== (k === "hr" || k === "fence")) return;
    ev.preventDefault();
    block.innerHTML = "<br>";
    placeCaret(block, false);
    runCommand(k);
  }

  // ---------- "/" command menu ----------
  var menu = { el: $("ed-menu"), open: false, items: [], index: 0, block: null };
  var MENU_KEYS = Object.keys(COMMANDS).filter(function (k) { return COMMANDS[k].menu; });
  function iconFor(k) { var b = document.querySelector('[data-cmd="' + k + '"]'); return b ? b.innerHTML : ""; }
  function showMenu(block, query) {
    var q = query.toLowerCase();
    // Rank like other editors: label prefix, then a word in the label, then anywhere in label or description.
    function score(k) {
      var label = COMMANDS[k].label.toLowerCase();
      if (!q) return 1;
      if (label.indexOf(q) === 0 || k.indexOf(q) === 0) return 4;
      if (label.split(/\s+/).some(function (w) { return w.indexOf(q) === 0; })) return 3;
      if (label.indexOf(q) !== -1) return 2;
      return COMMANDS[k].menu.toLowerCase().indexOf(q) !== -1 ? 1 : 0;
    }
    menu.items = MENU_KEYS.filter(function (k) { return score(k) > 0; })
      .sort(function (x, y) { return score(y) - score(x) || MENU_KEYS.indexOf(x) - MENU_KEYS.indexOf(y); });
    if (!menu.items.length) return hideMenu();
    menu.block = block; menu.index = Math.min(menu.index, menu.items.length - 1); menu.open = true;
    menu.el.innerHTML = menu.items.map(function (k, i) {
      return '<button type="button" role="option" data-i="' + i + '" aria-selected="' + (i === menu.index) + '">' + iconFor(k) +
        "<span><b>" + esc(COMMANDS[k].label) + "</b><small>" + esc(COMMANDS[k].menu) + "</small></span></button>";
    }).join("");
    position(menu.el, block.getBoundingClientRect(), true);
    menu.el.hidden = false;
    var cur = menu.el.querySelector('[aria-selected="true"]');
    if (cur) cur.scrollIntoView({ block: "nearest" });
  }
  function hideMenu() { menu.open = false; menu.el.hidden = true; menu.index = 0; }
  function chooseMenu(i) {
    var k = menu.items[i], block = menu.block;
    hideMenu();
    block.innerHTML = "<br>";
    placeCaret(block, false);
    runCommand(k);
  }
  function handleMenuKey(ev) {
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      menu.index = (menu.index + (ev.key === "ArrowDown" ? 1 : -1) + menu.items.length) % menu.items.length;
      showMenu(menu.block, menu.block.textContent.slice(1));
    } else if (ev.key === "Enter" || ev.key === "Tab") chooseMenu(menu.index);
    else if (ev.key === "Escape") hideMenu();
    else return false;
    ev.preventDefault();
    return true;
  }
  menu.el.addEventListener("mousedown", function (ev) {
    var b = ev.target.closest("[data-i]");
    if (b) { ev.preventDefault(); chooseMenu(+b.dataset.i); }
  });
  function checkSlash() {
    var block = caretBlock();
    if (block && block.nodeName === "P" && /^\/\S{0,20}$/.test(block.textContent)) showMenu(block, block.textContent.slice(1));
    else if (menu.open) hideMenu();
  }

  // Position a popover under (or beside) a rect, inside the editor page.
  function position(el, rect, below) {
    var page = $("ed-visual-wrap").getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(rect.left - page.left, page.width - 330)) + "px";
    el.style.top = (rect.bottom - page.top + 6) + "px";
  }

  // ---------- floating selection toolbar (bold, italic, …, link, headings, quote) ----------
  // Its buttons carry data-cmd, so they share the toolbar's commands, shortcuts and active states.
  var bubble = $("ed-bubble"), dragging = false, TOUCH = window.matchMedia("(pointer: coarse)").matches;
  function updateBubble() {
    var sel = window.getSelection();
    var show = mode === "visual" && !dragging && linkBox.hidden && sel.rangeCount && !sel.isCollapsed &&
      visual.contains(sel.anchorNode) && visual.contains(sel.focusNode) && sel.toString().trim() &&
      !closestIn(sel.anchorNode, ["PRE"]);
    if (!show) { bubble.hidden = true; return; }
    var rect = sel.getRangeAt(0).getBoundingClientRect(), page = $("ed-visual-wrap").getBoundingClientRect();
    bubble.hidden = false;
    var w = bubble.offsetWidth, h = bubble.offsetHeight;
    var left = Math.max(8, Math.min(rect.left + rect.width / 2 - w / 2 - page.left, page.width - w - 8));
    var bar = document.querySelector(".editor__bar").getBoundingClientRect();
    // Above the selection, clear of the sticky header and editor bar; below it on touch screens,
    // where the phone's own copy/paste menu sits above.
    var above = !TOUCH && rect.top - h - 10 > Math.max(90, bar.bottom);
    bubble.style.left = left + "px";
    bubble.style.top = (above ? rect.top - page.top - h - 10 : rect.bottom - page.top + 10) + "px";
    bubble.classList.toggle("is-below", !above);
  }
  visual.addEventListener("mousedown", function () { dragging = true; bubble.hidden = true; });
  document.addEventListener("mouseup", function () { if (dragging) { dragging = false; setTimeout(updateBubble, 0); } });
  window.addEventListener("scroll", function () { if (!bubble.hidden) updateBubble(); }, { passive: true });

  // ---------- link popover (replaces the browser prompt) ----------
  var linkBox = $("ed-linkbox"), linkInput = $("ed-link-url"), linkRange = null, linkEl = null;
  function openLink(existing) {
    var sel = window.getSelection();
    if (!sel.rangeCount || !visual.contains(sel.anchorNode)) return;
    linkRange = sel.getRangeAt(0).cloneRange();
    linkEl = existing || closestIn(sel.anchorNode, ["A"]);
    linkInput.value = linkEl ? linkEl.getAttribute("href") : "";
    $("ed-link-remove").hidden = $("ed-link-open").hidden = !linkEl;
    if (linkEl) $("ed-link-open").href = linkEl.href;
    position(linkBox, (linkEl || linkRange).getBoundingClientRect());
    linkBox.hidden = false; bubble.hidden = true;
    linkInput.focus(); linkInput.select();
  }
  function closeLink(restore) {
    linkBox.hidden = true;
    if (restore && linkRange) { visual.focus(); var s = window.getSelection(); s.removeAllRanges(); s.addRange(linkRange); }
  }
  function applyLink() {
    var url = linkInput.value.trim();
    if (url && !/^([a-z][a-z0-9+.-]*:|\/|#|\.)/i.test(url)) url = "https://" + url;
    closeLink(true);
    if (!url) return;
    if (linkEl) linkEl.setAttribute("href", url);
    else if (linkRange.collapsed) document.execCommand("insertHTML", false, '<a href="' + esc(url) + '">' + esc(url) + "</a>");
    else document.execCommand("createLink", false, url);
    fromVisual(); updateState();
  }
  $("ed-link-apply").addEventListener("click", applyLink);
  $("ed-link-remove").addEventListener("click", function () {
    var a = linkEl; closeLink(false);
    if (a) { while (a.firstChild) a.parentNode.insertBefore(a.firstChild, a); a.remove(); fromVisual(); }
  });
  linkInput.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter") { ev.preventDefault(); applyLink(); }
    if (ev.key === "Escape") { ev.preventDefault(); closeLink(true); }
  });

  // ---------- images ----------
  function placementAttrs() {
    var p = $("ed-align").value, w = $("ed-width").value, a = [];
    if (p) a.push("." + p);
    if (w) a.push("width=" + w);
    return a.length ? "{" + a.join(" ") + "}" : "";
  }
  function addImages(files) {
    Array.prototype.forEach.call(files, function (f) {
      if (!/^image\//.test(f.type)) return;
      var base = (f.name || "image.png").toLowerCase().replace(/[^a-z0-9.]+/g, "-"), name = base, n = 2;
      while (images[name]) name = base.replace(/(\.[a-z0-9]+)?$/, "-" + n++ + "$1");
      images[name] = { url: URL.createObjectURL(f), file: f };
      var snippet = "![Describe the image](" + name + ")" + placementAttrs();
      if (mode === "visual") insertBlockVisual(snippet); else insertSource("\n", snippet, "\n");
      if (!field("cover")) $("ed-cover").value = name;
    });
    $("ed-image-list").textContent = "Upload these images with your post: " + Object.keys(images).join(", ");
    validate();
  }
  $("ed-images").addEventListener("change", function (ev) { addImages(ev.target.files); ev.target.value = ""; });
  // Drag images straight into the post; they land where they're dropped.
  visual.addEventListener("dragover", function (ev) { if (ev.dataTransfer.types.indexOf("Files") !== -1) { ev.preventDefault(); visual.classList.add("is-dropping"); } });
  visual.addEventListener("dragleave", function () { visual.classList.remove("is-dropping"); });
  visual.addEventListener("drop", function (ev) {
    visual.classList.remove("is-dropping");
    if (!ev.dataTransfer.files.length) return;
    ev.preventDefault();
    var r = document.caretRangeFromPoint ? document.caretRangeFromPoint(ev.clientX, ev.clientY) : null;
    if (!r && document.caretPositionFromPoint) { var p = document.caretPositionFromPoint(ev.clientX, ev.clientY); r = document.createRange(); r.setStart(p.offsetNode, p.offset); }
    if (r) { var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
    addImages(ev.dataTransfer.files);
  });

  // Click an image to change its placement, size or description; click a link to edit it.
  visual.addEventListener("click", function (ev) {
    if (selectedImg) selectedImg.classList.remove("is-selected");
    selectedImg = ev.target.nodeName === "IMG" ? ev.target : null;
    $("ed-img-tools").hidden = !selectedImg;
    if (selectedImg) {
      selectedImg.classList.add("is-selected");
      $("ed-align").value = PLACEMENTS.find(function (p) { return selectedImg.classList.contains(p); }) || "";
      $("ed-width").value = selectedImg.getAttribute("width") || "";
      $("ed-alt").value = selectedImg.getAttribute("alt") || "";
    }
    var a = closestIn(ev.target, ["A"]);
    if (a && !has(a, "headerlink")) { ev.preventDefault(); openLink(a); }
  });
  function applyToImage() {
    if (!selectedImg) return;
    PLACEMENTS.forEach(function (p) { selectedImg.classList.remove(p); });
    if ($("ed-align").value) selectedImg.classList.add($("ed-align").value);
    if ($("ed-width").value) selectedImg.setAttribute("width", $("ed-width").value); else selectedImg.removeAttribute("width");
    selectedImg.setAttribute("alt", $("ed-alt").value);
    fromVisual();
  }
  ["ed-align", "ed-width", "ed-alt"].forEach(function (id) { $(id).addEventListener("input", applyToImage); });

  // Paste: images become uploads; text arrives plain, so pasted documents don't bring their styling.
  visual.addEventListener("paste", function (ev) {
    var data = ev.clipboardData || window.clipboardData;
    if (data.files && data.files.length) { ev.preventDefault(); addImages(data.files); return; }
    var text = data.getData("text/plain");
    if (!text) return;
    ev.preventDefault();
    document.execCommand("insertText", false, text);
  });
  visual.addEventListener("input", function () {
    if (!visual.firstElementChild && !visual.textContent) { visual.innerHTML = "<p><br></p>"; placeCaret(visual.firstChild, false); }
    checkSlash(); fromVisual();
  });
  visual.addEventListener("blur", function () { setTimeout(function () { if (!menu.el.contains(document.activeElement)) hideMenu(); }, 150); });
  document.addEventListener("mousedown", function (ev) {
    if (!linkBox.hidden && !linkBox.contains(ev.target)) closeLink(false);
  });
  source.addEventListener("input", fromSource);
  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.dataset.mode); }); });

  // ---------- files ----------
  // Images the post uses: relative names in the Markdown plus the cover (the preview thumbnail).
  function referencedImages() {
    var names = {}, re = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?/g, m;
    while ((m = re.exec(md))) names[m[1]] = 1;
    if (field("cover")) names[field("cover")] = 1;
    return Object.keys(names).filter(function (n) { return !/^([a-z][a-z0-9+.-]*:|\/|\.\.?\/|#)/i.test(n); });
  }
  function refreshSave() {
    var n = referencedImages().length;
    $("ed-save").textContent = n ? "Save .zip (post + " + n + " image" + (n > 1 ? "s" : "") + ")" : "Save .md";
  }
  function download(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
  }
  // A post with images saves as one zip: <date-slug>.md plus every image it uses, all at the top level.
  // The site build unpacks it into its own folder, Blog/<date-slug>/.
  $("ed-save").addEventListener("click", function () {
    if (mode === "visual") md = toMarkdown(visual); else md = source.value;
    clearTimeout(syncTimer); validate(); // flush pending edits first, so their status can't overwrite save warnings
    var text = compose(), names = referencedImages();
    if (!names.length) return download(new Blob([text], { type: "text/markdown" }), fileName());
    var missing = [];
    Promise.all(names.map(function (n) {
      if (images[n]) return images[n].file;
      // An image from an already-published post: take it from the site.
      return fetch("Blog/" + fileName().replace(/\.md$/, "") + "/" + n).then(function (r) { if (!r.ok) throw r; return r.blob(); })
        .catch(function () { missing.push(n); return null; });
    })).then(function (blobs) {
      var files = [{ name: fileName(), blob: new Blob([text]) }];
      names.forEach(function (n, i) { if (blobs[i]) files.push({ name: n, blob: blobs[i] }); });
      return makeZip(files);
    }).then(function (zip) {
      download(zip, fileName().replace(/\.md$/, ".zip"));
      if (missing.length) setStatus("Saved, but these images weren't found and aren't in the zip: " + missing.join(", ") + ". Add them again with the image button.", true);
    });
  });
  $("ed-open").addEventListener("change", function (ev) {
    var f = ev.target.files[0];
    ev.target.value = "";
    if (!f) return;
    if (!/\.zip$/i.test(f.name)) return f.text().then(load);
    readZip(f).then(function (entries) {
      var post = entries.filter(function (e) { return /\.md$/i.test(e.name); })[0];
      if (!post) throw new Error("no .md file in the zip");
      entries.forEach(function (e) {
        if (e !== post && /\.(jpe?g|png|webp|gif|avif)$/i.test(e.name)) images[e.name] = { url: URL.createObjectURL(e.blob), file: e.blob };
      });
      return post.blob.text().then(load);
    }).catch(function (e) { setStatus("Couldn't open that zip: " + (e.message || e), true); });
  });

  // ---------- zip: write (stored, no compression; photos are already compressed) and read ----------
  var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function makeZip(files) {
    return Promise.all(files.map(function (f) { return f.blob.arrayBuffer(); })).then(function (bufs) {
      var d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
      var date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
      var parts = [], central = [], offset = 0;
      files.forEach(function (f, i) {
        var data = new Uint8Array(bufs[i]), name = new TextEncoder().encode(f.name), crc = crc32(data);
        var h = new DataView(new ArrayBuffer(30));
        [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, time, 2], [12, date, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, name.length, 2], [28, 0, 2]]
          .forEach(function (x) { x[2] === 4 ? h.setUint32(x[0], x[1], true) : h.setUint16(x[0], x[1], true); });
        var c = new DataView(new ArrayBuffer(46));
        [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, time, 2], [14, date, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, name.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, offset, 4]]
          .forEach(function (x) { x[2] === 4 ? c.setUint32(x[0], x[1], true) : c.setUint16(x[0], x[1], true); });
        parts.push(h, name, data); central.push(c, name);
        offset += 30 + name.length + data.length;
      });
      var size = central.reduce(function (t, p) { return t + p.byteLength; }, 0), e = new DataView(new ArrayBuffer(22));
      [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, offset, 4], [20, 0, 2]]
        .forEach(function (x) { x[2] === 4 ? e.setUint32(x[0], x[1], true) : e.setUint16(x[0], x[1], true); });
      return new Blob(parts.concat(central, [e]), { type: "application/zip" });
    });
  }
  // Reads stored and deflated entries (deflate via the browser's DecompressionStream).
  function readZip(file) {
    return file.arrayBuffer().then(function (buf) {
      var v = new DataView(buf), i = buf.byteLength - 22;
      while (i >= 0 && v.getUint32(i, true) !== 0x06054b50) i--;
      if (i < 0) throw new Error("not a zip file");
      var count = v.getUint16(i + 10, true), p = v.getUint32(i + 16, true), out = [];
      for (var n = 0; n < count; n++) {
        var method = v.getUint16(p + 10, true), csize = v.getUint32(p + 20, true), nlen = v.getUint16(p + 28, true);
        var elen = v.getUint16(p + 30, true), clen = v.getUint16(p + 32, true), local = v.getUint32(p + 42, true);
        var name = new TextDecoder().decode(new Uint8Array(buf, p + 46, nlen)).split("/").pop();
        var start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
        var raw = new Blob([new Uint8Array(buf, start, csize)]);
        if (name) out.push({ name: name, method: method, raw: raw });
        p += 46 + nlen + elen + clen;
      }
      return Promise.all(out.map(function (e) {
        if (e.method === 0) return { name: e.name, blob: e.raw };
        if (e.method !== 8) throw new Error(e.name + " uses an unsupported compression method");
        return new Response(e.raw.stream().pipeThrough(new DecompressionStream("deflate-raw"))).blob().then(function (b) { return { name: e.name, blob: b }; });
      }));
    });
  }

  $("ed-new").addEventListener("click", function () {
    if (!md.trim() || window.confirm("Start a new post? The current draft is cleared from this browser.")) load("date: " + today() + "\ndraft: true\n\n");
  });
  $("ed-upload").href = UPLOAD_URL;
  FIELDS.concat(["draft"]).forEach(function (k) { $("ed-" + k).addEventListener("input", validate); });

  // ---------- start ----------
  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (e) { /* storage blocked */ }
  document.execCommand("defaultParagraphSeparator", false, "p");
  load(saved || "date: " + today() + "\ndraft: true\n\n");
  visual.innerHTML = '<p class="editor__loading">Loading the editor (the first load takes a few seconds)…</p>';
  visual.contentEditable = "false";
  setStatus("Loading the editor…");

  var s = document.createElement("script");
  s.src = PYODIDE + "pyodide.js";
  s.onload = function () {
    window.loadPyodide({ indexURL: PYODIDE }).then(function (p) {
      return p.loadPackage("micropip").then(function () {
        return p.pyimport("micropip").install(PACKAGES);
      }).then(function () {
        return fetch("assets/py/blogmd.py").then(function (r) { return r.text(); });
      }).then(function (code) {
        p.FS.writeFile("/home/pyodide/blogmd.py", code);
        py = p;
        visual.contentEditable = "true";
        if (mode === "visual") renderVisual(); else validate();
      });
    }).catch(function (e) { setStatus("The editor failed to load: " + e + ". Markdown mode still works, and your draft is saved.", true); });
  };
  s.onerror = function () { setStatus("Couldn't load the editor engine. Markdown mode still works, and your draft is saved.", true); };
  document.head.appendChild(s);

  window.__blogEditor = { toMarkdown: toMarkdown, pyRender: function (t) { return pyRender(t); }, ready: function () { return !!py; } }; // for tests
})();
