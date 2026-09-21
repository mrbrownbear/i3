from __future__ import annotations

import base64
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
RESOURCE_PACKED = ROOT / "tools" / "resources.zlib.b64"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36"
TRACKER_MARKERS = (
    "googletagmanager.com", "google-analytics.com", "analytics.google.com",
    "hubspot.com", "hs-scripts.com", "hs-analytics.net", "hs-banner.com",
    "hsadspixel.net", "hscollectedforms.net", "usemessages.com", "hubapi.com",
    "apollo.io", "facebook.net", "facebook.com/tr", "sharethis.com",
    "linkedin.com/insight", "snap.licdn.com", "px.ads.linkedin.com",
    "analytics.tiktok.com", "bat.bing.net", "liadm.com", "dmdtrueidentity.com",
    "medtargetsystem.com", "aplo-evnt.com", "bzrcdn.openai.com", "bzr.openai.com",
)
RESOURCE_ATTRS = ("src", "poster", "data-src", "data-lazy-src", "data-bg", "data-background", "data-video-src")
SRCSET_ATTRS = ("srcset", "data-srcset", "data-lazy-srcset", "data-bgset")
CSP = (
    "default-src 'self' data: blob:; "
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; "
    "style-src 'self' 'unsafe-inline'; "
    "img-src 'self' data: blob:; "
    "font-src 'self' data:; "
    "media-src 'self' data: blob:; "
    "connect-src 'self'; "
    "frame-src 'self'; "
    "worker-src 'self' blob:; "
    "object-src 'none'; "
    "base-uri 'self'; "
    "form-action 'self';"
)


def load_resources():
    import zlib
    packed = RESOURCE_PACKED.read_text(encoding="ascii").strip()
    resources = json.loads(zlib.decompress(base64.b64decode(packed)).decode("utf-8"))
    if not resources:
        raise RuntimeError("No resources found in packed manifest")
    exact = {}
    path_index = {}
    for item in resources:
        exact[item["url"]] = item["path"]
        p = urllib.parse.urlsplit(item["url"])
        no_frag = urllib.parse.urlunsplit((p.scheme, p.netloc, p.path, p.query, ""))
        exact[no_frag] = item["path"]
        key = (p.netloc.lower(), p.path)
        path_index.setdefault(key, []).append(item["path"])
    return resources, exact, path_index


def fetch(url: str, dest: Path, attempts: int = 4):
    dest.parent.mkdir(parents=True, exist_ok=True)
    err = None
    for attempt in range(1, attempts + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=90) as r:
                data = r.read()
            if not data:
                raise RuntimeError("empty response")
            dest.write_bytes(data)
            return len(data)
        except Exception as exc:
            err = exc
            if attempt < attempts:
                time.sleep(attempt * 2)
    raise RuntimeError(f"failed to fetch {url}: {err}")


def normalize_absolute(raw: str):
    raw = raw.strip()
    if raw.startswith("//"):
        return "https:" + raw
    return raw


def local_url(raw: str, exact: dict, path_index: dict):
    if not raw:
        return raw
    raw = raw.strip()
    if raw.startswith(("data:", "blob:", "#", "mailto:", "tel:", "javascript:", "about:")):
        return raw
    absolute = normalize_absolute(raw)
    if not absolute.startswith(("http://", "https://")):
        return raw
    p = urllib.parse.urlsplit(absolute)
    host = p.netloc.lower()
    no_frag = urllib.parse.urlunsplit((p.scheme, p.netloc, p.path, p.query, ""))
    if no_frag in exact:
        suffix = ("#" + p.fragment) if p.fragment else ""
        return "/" + exact[no_frag].lstrip("/") + suffix
    if host in {"www.i3media.net", "i3media.net"}:
        key = ("www.i3media.net", p.path)
        candidates = path_index.get(key, [])
        if len(candidates) == 1 and not p.query:
            return "/" + candidates[0].lstrip("/") + (("#" + p.fragment) if p.fragment else "")
        path = p.path or "/"
        if path.endswith("/") or Path(path).suffix:
            return path + (("?" + p.query) if p.query else "") + (("#" + p.fragment) if p.fragment else "")
        return path + "/" + (("?" + p.query) if p.query else "") + (("#" + p.fragment) if p.fragment else "")
    return None


def rewrite_css_urls(text: str, exact: dict, path_index: dict):
    def repl(m):
        quote = m.group(1) or ""
        raw = m.group(2).strip()
        if not raw.startswith(("http://", "https://", "//")):
            return m.group(0)
        loc = local_url(raw, exact, path_index)
        if loc:
            return f"url({quote}{loc}{quote})"
        return "url('')"
    return re.sub(r"url\(\s*(['\"]?)(https?:\\?/\\?/[^)'\"\\\s]+|//[^)'\"\\\s]+)\1\s*\)", repl, text, flags=re.I)


def rewrite_srcset(value: str, exact: dict, path_index: dict):
    out = []
    for part in value.split(","):
        bits = part.strip().split()
        if not bits:
            continue
        raw = bits[0]
        if raw.startswith(("http://", "https://", "//")):
            loc = local_url(raw, exact, path_index)
            if not loc:
                continue
            bits[0] = loc
        out.append(" ".join(bits))
    return ", ".join(out)


def sanitize_html(path: Path, exact: dict, path_index: dict):
    text = path.read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(text, "html.parser")

    for tag in list(soup.find_all("script")):
        src = tag.get("src", "")
        body = tag.string or tag.get_text(" ", strip=False) or ""
        marker_text = (src + " " + body).lower()
        if any(m in marker_text for m in TRACKER_MARKERS):
            tag.extract()
            continue
        if src and src.startswith(("http://", "https://", "//")):
            loc = local_url(src, exact, path_index)
            if loc:
                tag["src"] = loc
            else:
                tag.extract()

    for tag in list(soup.find_all("iframe")):
        src = tag.get("src", "")
        if src.startswith(("http://", "https://", "//")):
            loc = local_url(src, exact, path_index)
            if loc:
                tag["src"] = loc
            else:
                tag.extract()

    for tag in list(soup.find_all("link")):
        href = tag.get("href", "")
        rel = {str(x).lower() for x in (tag.get("rel") or [])}
        if href.startswith(("http://", "https://", "//")):
            loc = local_url(href, exact, path_index)
            is_resource = bool(rel & {"stylesheet", "icon", "preload", "modulepreload", "prefetch", "preconnect", "dns-prefetch"})
            if loc:
                tag["href"] = loc
            elif is_resource:
                tag.extract()

    for tag in soup.find_all(True):
        for attr in RESOURCE_ATTRS:
            value = tag.get(attr)
            if not value:
                continue
            if isinstance(value, list):
                value = " ".join(value)
            if str(value).startswith(("http://", "https://", "//")):
                loc = local_url(str(value), exact, path_index)
                if loc:
                    tag[attr] = loc
                else:
                    del tag[attr]
        for attr in SRCSET_ATTRS:
            value = tag.get(attr)
            if value:
                new = rewrite_srcset(str(value), exact, path_index)
                if new:
                    tag[attr] = new
                else:
                    del tag[attr]
        style = tag.get("style")
        if style and ("http://" in style or "https://" in style or "//" in style):
            tag["style"] = rewrite_css_urls(style, exact, path_index)

    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if href.startswith(("http://", "https://", "//")):
            loc = local_url(href, exact, path_index)
            if loc:
                a["href"] = loc

    for form in soup.find_all("form", action=True):
        action = form.get("action", "")
        if action.startswith(("http://", "https://", "//")):
            loc = local_url(action, exact, path_index)
            form["action"] = loc or "#"

    for meta in soup.find_all("meta"):
        if str(meta.get("http-equiv", "")).lower() == "refresh":
            meta.extract()

    head = soup.head
    if head:
        existing = head.find("meta", attrs={"http-equiv": re.compile("^Content-Security-Policy$", re.I)})
        if existing:
            existing["content"] = CSP
        else:
            csp = soup.new_tag("meta")
            csp["http-equiv"] = "Content-Security-Policy"
            csp["content"] = CSP
            head.insert(0, csp)
        refpol = soup.new_tag("meta")
        refpol["name"] = "referrer"
        refpol["content"] = "strict-origin-when-cross-origin"
        head.insert(1, refpol)

    rendered = str(soup)
    rendered = rewrite_css_urls(rendered, exact, path_index)
    path.write_text(rendered, encoding="utf-8")


def sanitize_text_assets(resources, exact, path_index):
    for item in resources:
        p = ROOT / item["path"]
        if not p.exists() or p.suffix.lower() not in {".css", ".js"}:
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        if p.name.startswith("144637297-"):
            p.write_text("/* Third party marketing loader removed for local only build. */\n", encoding="utf-8")
            continue
        if p.suffix.lower() == ".css":
            text = rewrite_css_urls(text, exact, path_index)
        p.write_text(text, encoding="utf-8")


def write_guards():
    (ROOT / ".nojekyll").write_text("", encoding="utf-8")
    vercel = {
        "cleanUrls": False,
        "trailingSlash": True,
        "headers": [{"source": "/(.*)", "headers": [
            {"key": "Content-Security-Policy", "value": CSP},
            {"key": "X-Content-Type-Options", "value": "nosniff"},
            {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"}
        ]}]
    }
    (ROOT / "vercel.json").write_text(json.dumps(vercel, indent=2) + "\n", encoding="utf-8")
    (ROOT / "_headers").write_text(
        "/*\n"
        f"  Content-Security-Policy: {CSP}\n"
        "  X-Content-Type-Options: nosniff\n"
        "  Referrer-Policy: strict-origin-when-cross-origin\n",
        encoding="utf-8"
    )


def validate(resources):
    missing = [x["path"] for x in resources if not (ROOT / x["path"]).exists()]
    if missing:
        raise RuntimeError(f"missing localized files: {missing[:20]}")

    problems = []
    resource_tags = {"script", "img", "source", "video", "audio", "iframe"}
    attrs = ("src", "poster", "data-src", "data-lazy-src", "srcset", "data-srcset")
    for p in ROOT.rglob("*.html"):
        if ".git" in p.parts:
            continue
        text = p.read_text(encoding="utf-8", errors="ignore")
        soup = BeautifulSoup(text, "html.parser")
        for tag in soup.find_all(True):
            if tag.name in resource_tags:
                for attr in attrs:
                    value = tag.get(attr)
                    if value and str(value).lstrip().startswith(("http://", "https://", "//")):
                        problems.append(f"{p}: <{tag.name}> {attr}={str(value)[:120]}")
            if tag.name == "link":
                rel = {str(x).lower() for x in (tag.get("rel") or [])}
                if rel & {"stylesheet", "icon", "preload", "modulepreload", "prefetch", "preconnect", "dns-prefetch"}:
                    href = tag.get("href")
                    if href and str(href).lstrip().startswith(("http://", "https://", "//")):
                        problems.append(f"{p}: <link> href={str(href)[:120]}")
            style = tag.get("style")
            if style and re.search(r"url\(\s*['\"]?(?:https?:)?//", str(style), re.I):
                problems.append(f"{p}: external CSS url in style attribute")
        for style_tag in soup.find_all("style"):
            if re.search(r"url\(\s*['\"]?(?:https?:)?//", style_tag.get_text(), re.I):
                problems.append(f"{p}: external CSS url in style block")

    for p in ROOT.rglob("*.css"):
        text = p.read_text(encoding="utf-8", errors="ignore")
        if re.search(r"url\(\s*['\"]?(?:https?:)?//", text, re.I):
            problems.append(f"{p}: external CSS url")

    if problems:
        raise RuntimeError("external resource references remain: " + "; ".join(problems[:20]))


def main():
    resources, exact, path_index = load_resources()
    total = 0
    failures = []
    for i, item in enumerate(resources, 1):
        dest = ROOT / item["path"]
        try:
            if item["path"] == "wp-content/plugins/gravityforms/assets/css/dist/theme-components.min__q_ab2767d24d.css":
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(b"")
                size = 0
            else:
                size = fetch(item["url"], dest)
            total += size
            print(f"[{i}/{len(resources)}] {item['path']} ({size} bytes)")
        except Exception as exc:
            failures.append(str(exc))
            print(f"WARN {exc}", file=sys.stderr)
    if failures:
        raise RuntimeError(f"{len(failures)} downloads failed. First: {failures[0]}")

    sanitize_text_assets(resources, exact, path_index)
    for item in resources:
        p = ROOT / item["path"]
        if p.suffix.lower() == ".html":
            sanitize_html(p, exact, path_index)
    write_guards()
    validate(resources)
    print(f"Localized {len(resources)} resources, {total / 1024 / 1024:.1f} MiB downloaded")


if __name__ == "__main__":
    if "--verify-only" in sys.argv:
        resources, _, _ = load_resources()
        validate(resources)
        print("Runtime resource audit passed")
    else:
        main()
