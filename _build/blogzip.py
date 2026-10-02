# ABOUTME: Unpacks blog-post zips (the blog editor's "Save .zip") into their own folder: Blog/<date-slug>/.
# ABOUTME: Zips arrive through GitHub uploads, so every entry is checked before anything is written.
import os
import re
import zipfile

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}  # no .svg: it can carry scripts
MAX_FILE = 25 * 1024 * 1024    # GitHub's web-upload limit per file
MAX_TOTAL = 100 * 1024 * 1024  # guards against zip bombs


class ZipError(ValueError):
    pass


def unpack(zip_path, blog_dir):
    """Extract a post zip into blog_dir/<md name>/ and delete the zip. Returns (folder, names written)."""
    name = os.path.basename(zip_path)
    with zipfile.ZipFile(zip_path) as z:
        entries = [i for i in z.infolist() if not i.is_dir() and not os.path.basename(i.filename).startswith(".")]
        mds = [i for i in entries if i.filename.lower().endswith(".md")]
        if len(mds) != 1:
            raise ZipError("%s: needs exactly one .md file, found %d" % (name, len(mds)))
        total = 0
        for i in entries:
            base = os.path.basename(i.filename)
            ext = os.path.splitext(base)[1].lower()
            if i.filename != base or base in ("", ".", ".."):
                raise ZipError("%s: %r must be at the top of the zip, not in a folder" % (name, i.filename))
            if ext != ".md" and ext not in IMAGE_EXTS:
                raise ZipError("%s: %r isn't a post or a supported image (%s)" % (name, base, ", ".join(sorted(IMAGE_EXTS))))
            if i.file_size > MAX_FILE:
                raise ZipError("%s: %r is over 25 MB" % (name, base))
            total += i.file_size
        if total > MAX_TOTAL:
            raise ZipError("%s: contents are over 100 MB" % name)
        folder = mds[0].filename[:-3].lower()
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", folder):
            raise ZipError("%s: the post file name may only use a-z, 0-9 and dashes" % name)
        data = {i.filename: z.read(i) for i in entries}
    # The post's own folder: re-uploading the same post replaces its files (an edit).
    dest = os.path.join(blog_dir, folder)
    os.makedirs(dest, exist_ok=True)
    for base, content in data.items():
        with open(os.path.join(dest, base), "wb") as f:
            f.write(content)
    os.remove(zip_path)
    return folder, sorted(data)


if __name__ == "__main__":
    import tempfile
    def mk(d, files):
        p = os.path.join(d, "post.zip")
        with zipfile.ZipFile(p, "w") as z:
            for n, c in files.items():
                z.writestr(n, c)
        return p
    with tempfile.TemporaryDirectory() as d:
        assert unpack(mk(d, {"2026-10-01-a.md": "title: a", "cover.jpg": b"jpg"}), d) == ("2026-10-01-a", ["2026-10-01-a.md", "cover.jpg"])
        assert os.path.isfile(os.path.join(d, "2026-10-01-a", "cover.jpg")) and not os.path.exists(os.path.join(d, "post.zip"))
        unpack(mk(d, {"2026-10-01-a.md": "title: a v2", "cover.jpg": b"new"}), d)  # re-upload = edit
        assert open(os.path.join(d, "2026-10-01-a", "cover.jpg"), "rb").read() == b"new"
        for bad, why in [({"../evil.md": "x"}, "folder"), ({"a.md": "x", "x.svg": "<svg>"}, "supported"),
                         ({"a.md": "x", "b.md": "y"}, "exactly one"), ({"Bad Name.md": "x"}, "a-z")]:
            try:
                unpack(mk(d, bad), d)
                raise AssertionError("should reject " + why)
            except ZipError as e:
                assert why in str(e), e
    print("blogzip self-check ok")
