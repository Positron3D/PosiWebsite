// ABOUTME: WYSIWYG blog editor: edit the rendered post directly; the saved file is Blog/*.md Markdown.
// ABOUTME: Renders with assets/py/blogmd.py via Pyodide (same as the build) and converts edits back with turndown.
(function () {
  "use strict";
  var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/";
  var PACKAGES = ["markdown==3.11", "pymdown-extensions==12.1"]; // keep in step with _build/requirements.txt
  var UPLOAD_URL = "https://github.com/Positron3D/PosiWebsite/upload/main/Blog";
  var STORE = "positron-blog-draft";
  var FIELDS = ["title", "date", "author", "summary", "cover", "tags"];
  var PLACEMENTS = ["left", "right", "center", "full", "wide"];

  var $ = function (id) { return document.getElementById(id); };
  var visual = $("ed-visual"), source = $("ed-body"), status = $("ed-status");
  var md = "";            // the post body in Markdown: the source of truth
  var mode = "visual";
  var images = {};        // file name -> blob URL, for images added this session
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
    return html.replace(/(src|href)="Blog\/([^"]+)"/g, function (all, attr, name) { return images[name] ? attr + '="' + images[name] + '"' : all; });
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
    for (var name in images) { if (images[name] === src) return name; }
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
    var out = td.turndown(clone.innerHTML);
    var defs = Object.keys(abbrs).map(function (k) { return "*[" + k + "]: " + abbrs[k]; });
    return (out + (defs.length ? "\n\n" + defs.join("\n") : "")).replace(/^[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim(); // drop empty-paragraph blanks
  }

  // ---------- rendering and syncing ----------
  function save() { try { localStorage.setItem(STORE, compose()); } catch (e) { /* storage blocked: no autosave */ } }

  function refreshHeader() {
    $("ed-filename").textContent = "Blog/" + fileName();
    var tags = field("tags").split(",").map(function (t) { return t.trim(); }).filter(Boolean);
    var cover = field("cover"), coverSrc = cover ? (images[cover] || (/^(https?:|\/|\.\.)/.test(cover) ? cover.replace(/^\.\.\//, "") : "Blog/" + cover)) : "";
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

  // ---------- toolbar ----------
  // Markdown snippets: inserted as text in Markdown mode, rendered and inserted in Visual mode.
  var BLOCKS = {
    table: "| Column | Column |\n|:--|:--|\n| Cell | Cell |",
    note: '!!! note\n    Callout text.',
    tip: '!!! tip "Pro tip"\n    Callout text.',
    warning: '!!! warning\n    Callout text.',
    details: '??? info "Click to expand"\n    Hidden until opened.',
    tabs: '=== "Klipper"\n    ```ini\n    [printer]\n    ```\n\n=== "Marlin"\n    ```c\n    #define COREXY\n    ```',
    fence: "```ini\n[printer]\nkinematics: corexy\n```",
    toc: "[TOC]", hr: "---", task: "- [ ] To do\n- [x] Done",
    video: '<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" title="What the video shows" allowfullscreen></iframe></div>'
  };
  // Inline/simple formats: [execCommand, arg] in Visual mode, [before, sample, after] in Markdown mode.
  var INLINE = {
    h2: [["formatBlock", "h2"], ["\n## ", "Heading", "\n"]], h3: [["formatBlock", "h3"], ["\n### ", "Subheading", "\n"]],
    p: [["formatBlock", "p"], ["", "", ""]],
    bold: [["bold"], ["**", "bold", "**"]], italic: [["italic"], ["*", "italic", "*"]],
    strike: [["strikeThrough"], ["~~", "struck", "~~"]], mark: [["mark"], ["==", "highlight", "=="]],
    code: [["code"], ["`", "code", "`"]], link: [["link"], ["[", "link text", "](https://)"]],
    quote: [["formatBlock", "blockquote"], ["\n> ", "Quote", "\n"]],
    ul: [["insertUnorderedList"], ["\n- ", "Item", "\n"]], ol: [["insertOrderedList"], ["\n1. ", "Item", "\n"]],
    undo: [["undo"], null], redo: [["redo"], null]
  };

  function insertSource(before, text, after) {
    var s = source.selectionStart, e = source.selectionEnd, sel = source.value.slice(s, e) || text;
    source.setRangeText(before + sel + after, s, e, "end");
    source.selectionStart = s + before.length; source.selectionEnd = s + before.length + sel.length;
    source.focus(); fromSource();
  }
  function wrapSelection(tag) {
    var sel = window.getSelection();
    var text = sel.rangeCount ? sel.toString() : "";
    document.execCommand("insertHTML", false, "<" + tag + ">" + esc(text || tag) + "</" + tag + ">");
  }
  function runVisual(cmd) {
    visual.focus();
    if (cmd[0] === "mark") wrapSelection("mark");
    else if (cmd[0] === "code") wrapSelection("code");
    else if (cmd[0] === "link") { var url = window.prompt("Link address", "https://"); if (url) document.execCommand("createLink", false, url); }
    else document.execCommand(cmd[0], false, cmd[1] || null);
    fromVisual();
  }
  // Blocks (callouts, tabs, images…) go after the paragraph holding the caret, never inside it:
  // inserting block HTML mid-paragraph makes browsers merge it into the text.
  function insertBlockVisual(snippet) {
    if (!py) return;
    var sel = window.getSelection(), anchor = null;
    if (sel.rangeCount && visual.contains(sel.anchorNode)) {
      anchor = sel.anchorNode;
      while (anchor && anchor.parentNode !== visual) anchor = anchor.parentNode;
    }
    var tmp = document.createElement("div");
    tmp.innerHTML = renderBody(snippet);
    var after = document.createElement("p");
    after.appendChild(document.createElement("br"));
    tmp.appendChild(after);
    var ref = anchor ? anchor.nextSibling : null;
    while (tmp.firstChild) visual.insertBefore(tmp.firstChild, ref);
    var r = document.createRange();
    r.setStart(after, 0); r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    visual.focus();
    fromVisual();
  }

  document.querySelectorAll("[data-cmd]").forEach(function (b) {
    b.addEventListener("mousedown", function (ev) { ev.preventDefault(); }); // keep the text selection
    b.addEventListener("click", function () {
      var k = b.dataset.cmd;
      if (BLOCKS[k]) return mode === "visual" ? insertBlockVisual(BLOCKS[k]) : insertSource("\n", BLOCKS[k], "\n");
      var spec = INLINE[k];
      if (mode === "visual") runVisual(spec[0]);
      else if (spec[1]) insertSource(spec[1][0], spec[1][1], spec[1][2]);
    });
  });

  // ---------- images ----------
  function placementAttrs() {
    var p = $("ed-align").value, w = $("ed-width").value, a = [];
    if (p) a.push("." + p);
    if (w) a.push("width=" + w);
    return a.length ? "{" + a.join(" ") + "}" : "";
  }
  $("ed-images").addEventListener("change", function (ev) {
    Array.prototype.forEach.call(ev.target.files, function (f) {
      var name = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      images[name] = URL.createObjectURL(f);
      var snippet = "![Describe the image](" + name + ")" + placementAttrs();
      if (mode === "visual") insertBlockVisual(snippet); else insertSource("\n", snippet, "\n");
      if (!field("cover")) $("ed-cover").value = name;
    });
    $("ed-image-list").textContent = "Upload these images with your post: " + Object.keys(images).join(", ");
    ev.target.value = "";
    validate();
  });
  // Click an image in the visual editor to change its placement, size or description.
  visual.addEventListener("click", function (ev) {
    if (selectedImg) selectedImg.classList.remove("is-selected");
    selectedImg = ev.target.nodeName === "IMG" ? ev.target : null;
    $("ed-img-tools").hidden = !selectedImg;
    if (!selectedImg) return;
    selectedImg.classList.add("is-selected");
    $("ed-align").value = PLACEMENTS.find(function (p) { return selectedImg.classList.contains(p); }) || "";
    $("ed-width").value = selectedImg.getAttribute("width") || "";
    $("ed-alt").value = selectedImg.getAttribute("alt") || "";
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

  // Paste plain text in the visual editor, so pasted documents don't bring their styling along.
  visual.addEventListener("paste", function (ev) {
    var text = (ev.clipboardData || window.clipboardData).getData("text/plain");
    if (!text) return;
    ev.preventDefault();
    document.execCommand("insertText", false, text);
  });
  visual.addEventListener("input", fromVisual);
  source.addEventListener("input", fromSource);
  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.dataset.mode); }); });

  // ---------- files ----------
  $("ed-save").addEventListener("click", function () {
    if (mode === "visual") md = toMarkdown(visual); else md = source.value;
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([compose()], { type: "text/markdown" }));
    a.download = fileName();
    a.click();
  });
  $("ed-open").addEventListener("change", function (ev) {
    var f = ev.target.files[0];
    if (f) f.text().then(load);
    ev.target.value = "";
  });
  $("ed-new").addEventListener("click", function () {
    if (!md.trim() || window.confirm("Start a new post? The current draft is cleared from this browser.")) load("date: " + today() + "\ndraft: true\n\n");
  });
  $("ed-upload").href = UPLOAD_URL;
  FIELDS.concat(["draft"]).forEach(function (k) { $("ed-" + k).addEventListener("input", validate); });

  // ---------- start ----------
  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (e) { /* storage blocked */ }
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
