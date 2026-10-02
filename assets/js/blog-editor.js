// ABOUTME: Blog editor: write a Blog/*.md post with a live preview that matches the site build.
// ABOUTME: Runs assets/py/blogmd.py in the browser through Pyodide; drafts autosave to localStorage.
(function () {
  "use strict";
  var PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.29.5/full/";
  var PACKAGES = ["markdown==3.11", "pymdown-extensions==12.1"]; // keep in step with _build/requirements.txt
  var UPLOAD_URL = "https://github.com/Positron3D/PosiWebsite/upload/main/Blog";
  var STORE = "positron-blog-draft";
  var FIELDS = ["title", "date", "author", "summary", "cover", "tags"];

  var $ = function (id) { return document.getElementById(id); };
  var body = $("ed-body"), status = $("ed-status"), preview = $("ed-preview");
  var images = {}; // file name -> object URL, for images added this session
  var py = null, timer = null;

  function field(k) { return $("ed-" + k).value.trim(); }

  function slug() {
    return (field("title") || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
  }
  function fileName() { return (field("date") || today()) + "-" + slug() + ".md"; }
  function today() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); } // local date, not UTC

  function compose() {
    var lines = FIELDS.filter(function (k) { return field(k); }).map(function (k) { return k + ": " + field(k).replace(/\n/g, " "); });
    if ($("ed-draft").checked) lines.push("draft: true");
    return lines.join("\n") + "\n\n" + body.value.replace(/^\s+/, "");
  }

  function load(text) {
    var parts = text.replace(/\r\n/g, "\n").split(/\n\s*\n/);
    var head = parts[0], meta = {};
    if (/^[A-Za-z_]+:/.test(head)) {
      head.split("\n").forEach(function (l) { var m = l.match(/^([A-Za-z_]+):\s*(.*)$/); if (m) meta[m[1].toLowerCase()] = m[2]; });
      parts.shift();
    }
    FIELDS.forEach(function (k) { $("ed-" + k).value = meta[k] || ""; });
    $("ed-draft").checked = /^(true|yes|1)$/i.test(meta.draft || "");
    body.value = parts.join("\n\n");
    changed();
  }

  function save() {
    try { localStorage.setItem(STORE, compose()); } catch (e) { /* private window: autosave off */ }
  }

  function setStatus(msg, bad) { status.textContent = msg; status.classList.toggle("is-error", !!bad); }

  function render() {
    save();
    $("ed-filename").textContent = "Blog/" + fileName();
    if (!py) return;
    try {
      py.globals.set("src", compose());
      var out = py.runPython("import blogmd, json\nm, h = blogmd.render(src)\njson.dumps({'html': h, 'minutes': m['minutes'], 'tags': m['tags'], 'cover': m.get('cover', '')})");
      var r = JSON.parse(out);
      var html = r.html.replace(/(src|href)="Blog\/([^"]+)"/g, function (all, attr, name) {
        return images[name] ? attr + '="' + images[name] + '"' : all;
      });
      var cover = r.cover ? (images[r.cover.replace(/^Blog\//, "")] || r.cover) : "";
      preview.innerHTML =
        '<h1>' + esc(field("title") || "Untitled") + '</h1>' +
        '<p class="post-meta">' + esc(field("date")) + ' · ' + esc(field("author")) + ' · ' + r.minutes + ' min read</p>' +
        '<p class="post-tags">' + ($("ed-draft").checked ? '<span class="tag tag--draft">Draft</span>' : '') +
        r.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</p>' +
        (cover ? '<img class="post-cover" src="' + esc(cover) + '" alt="">' : '') +
        '<div class="post-body">' + html + '</div>';
      setStatus("Preview up to date · autosaved in this browser");
    } catch (e) {
      var msg = String(e.message || e).split("\n").filter(Boolean).pop();
      setStatus(msg.replace(/^blogmd\.PostError: /, "Fix before publishing: "), true);
    }
  }

  function changed() { clearTimeout(timer); timer = setTimeout(render, 250); }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // Toolbar: wrap the selection, or insert a block on its own lines.
  var SNIPPETS = {
    h2: ["\n## ", "Heading", "\n"], h3: ["\n### ", "Subheading", "\n"],
    bold: ["**", "bold", "**"], italic: ["*", "italic", "*"], strike: ["~~", "struck", "~~"], mark: ["==", "highlight", "=="],
    link: ["[", "link text", "](https://)"], code: ["`", "code", "`"],
    quote: ["\n> ", "Quote", "\n"], ul: ["\n- ", "Item", "\n- Item\n"], ol: ["\n1. ", "First", "\n2. Second\n"],
    task: ["\n- [ ] ", "To do", "\n- [x] Done\n"],
    table: ["\n| Column | Column |\n|:--|:--|\n| ", "Cell", " | Cell |\n"],
    note: ['\n!!! note "', "Title", '"\n    Callout text, indented four spaces.\n'],
    tip: ['\n!!! tip "', "Pro tip", '"\n    Callout text.\n'],
    warning: ['\n!!! warning "', "Careful", '"\n    Callout text.\n'],
    details: ['\n??? info "', "Click to expand", '"\n    Hidden until opened.\n'],
    tabs: ['\n=== "', "Klipper", '"\n    ```ini\n    [printer]\n    ```\n\n=== "Marlin"\n    ```c\n    #define COREXY\n    ```\n'],
    fence: ["\n```", "ini", "\n[printer]\nkinematics: corexy\n```\n"],
    toc: ["\n", "[TOC]", "\n"], hr: ["\n", "---", "\n"],
    video: ['\n<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/', "VIDEO_ID", '" title="What the video shows" allowfullscreen></iframe></div>\n']
  };
  function insert(before, text, after) {
    var s = body.selectionStart, e = body.selectionEnd, sel = body.value.slice(s, e) || text;
    body.setRangeText(before + sel + after, s, e, "end");
    body.selectionStart = s + before.length; body.selectionEnd = s + before.length + sel.length;
    body.focus(); changed();
  }
  document.querySelectorAll("[data-snippet]").forEach(function (b) {
    b.addEventListener("click", function () { var p = SNIPPETS[b.dataset.snippet]; insert(p[0], p[1], p[2]); });
  });

  // Images: preview locally now, upload next to the .md later.
  $("ed-images").addEventListener("change", function (ev) {
    var align = $("ed-align").value;
    Array.prototype.forEach.call(ev.target.files, function (f) {
      var name = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      images[name] = URL.createObjectURL(f);
      var attrs = align ? "{." + align + (align === "left" || align === "right" ? " width=320" : "") + "}" : "";
      insert("\n![", "Describe the image", "](" + name + ")" + attrs + "\n");
      if (!field("cover")) $("ed-cover").value = name;
    });
    $("ed-image-list").textContent = "Upload these with your post: " + Object.keys(images).join(", ");
    ev.target.value = "";
  });

  $("ed-save").addEventListener("click", function () {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([compose() + "\n"], { type: "text/markdown" }));
    a.download = fileName();
    a.click();
  });
  $("ed-open").addEventListener("change", function (ev) {
    var f = ev.target.files[0];
    if (f) f.text().then(load);
    ev.target.value = "";
  });
  $("ed-new").addEventListener("click", function () {
    if (confirmNew()) { load("date: " + today() + "\n\n"); }
  });
  function confirmNew() { return !body.value.trim() || window.confirm("Start a new post? The current draft is cleared from this browser."); }
  $("ed-upload").href = UPLOAD_URL;

  [].concat(FIELDS.map(function (k) { return $("ed-" + k); }), [body, $("ed-draft")]).forEach(function (el) {
    el.addEventListener("input", changed);
  });

  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (e) { /* storage blocked */ }
  load(saved || "date: " + today() + "\ndraft: true\n\n");

  setStatus("Loading the preview engine (first load takes a few seconds)…");
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
        render();
      });
    }).catch(function (e) { setStatus("Preview engine failed to load: " + e, true); });
  };
  s.onerror = function () { setStatus("Couldn't load the preview engine. Check your connection; your draft is still saved.", true); };
  document.head.appendChild(s);
})();
