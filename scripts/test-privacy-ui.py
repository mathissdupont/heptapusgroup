"""Headless browser QA against an isolated, fixture-only production server.

Requires Python Playwright + Chromium and a prepared standalone build.
No real database, production hostname or external provider is contacted.
"""
import json
import http.client
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parent.parent
sys.stdout.reconfigure(encoding="utf-8")
fixture = r'''
const Module = require('node:module');
const original = Module._load;
const now = new Date();
const division = { id: 'fixture-ware', name: 'ware', title: 'HeptaWare', description: 'Custom Software Development, System Integration & IT Consulting', logoUrl: '/brand/heptapus-mark-black.png', themeColor: '#6F22D2', isActive: true, createdAt: now, updatedAt: now, settings: { locale: 'en', tagline: 'BUILDING THE LOGIC BEHIND INNOVATION', heroTitle: 'Software Solutions Built Around Your Business.', aboutText: 'A real software development team.', features: [{title:'Custom Software & SaaS Development',desc:'A long service description for responsive verification.'}], projects: [], translations: { tr: {published:true, description:'Turkish description',heroTitle:'Turkish software headline',aboutText:'Turkish about text',features:[{title:'Turkish software development services',desc:'Turkish service description'}]}, de:{published:true,description:'German description',heroTitle:'German software headline',aboutText:'German about text'} } } };
const empty = {findMany:async()=>[],findUnique:async()=>null,findFirst:async()=>null,count:async()=>0};
class PrismaClient {
 constructor() {
   for (const name of ['project','teamMember','blogPost','partner','announcement','jobPosting','subscriber','faq','testimonial']) this[name] = empty;
   this.subdomain = { ...empty, findUnique: async args => args.where.name === 'ware' ? division : null, findMany: async()=>[division] };
   this.setting = {...empty, findMany:async args => (args?.where?.key?.in || []).includes('heroVideoUrl') ? [{key:'heroVideoUrl',value:'https://www.youtube.com/watch?v=abcdefghijk'}] : [], findUnique: async()=>null};
 }
}
Module._load = function(name,parent,isMain) { if(name === '@prisma/client') return {PrismaClient,Prisma:{}}; return original.apply(this,arguments); };
'''

with tempfile.TemporaryDirectory(prefix="hepta-ui-") as directory:
    temporary = Path(directory)
    mock = temporary / "database-fixture.cjs"
    mock.write_text(fixture, encoding="utf-8")
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    base = f"http://localhost:{port}"
    division_base = "https://ware.heptapusgroup.com"
    site_base = "https://heptapusgroup.com"
    environment = dict(os.environ, NODE_ENV="production", PORT=str(port), HOSTNAME="localhost", DATABASE_URL="postgresql://unused:unused@127.0.0.1:1/unused", AUTH_SECRET="fixture-only-secret-with-at-least-32-characters", APP_ORIGIN=base, UPLOAD_DIR=str(temporary), APP_LOG_PATH=str(temporary / "app.log"), ERROR_LOG_PATH=str(temporary / "error.log"), NODE_OPTIONS=f'--require "{mock.as_posix()}"')
    log = (temporary / "server.log").open("w", encoding="utf-8")
    process = subprocess.Popen([shutil.which("node"), "scripts/start-production.mjs"], cwd=ROOT, env=environment, stdout=log, stderr=log)
    try:
        for _ in range(100):
            if process.poll() is not None:
                log.flush()
                raise AssertionError((temporary / "server.log").read_text(encoding="utf-8"))
            try:
                urllib.request.build_opener(urllib.request.ProxyHandler({})).open(base + "/api/auth/me", timeout=1)
                break
            except Exception:
                time.sleep(0.1)
        else:
            raise AssertionError("Fixture server failed to start")
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width":375,"height":812}, locale="en-US")
            external = []
            def network(route):
                url = route.request.url
                if url.startswith(division_base + "/") or url.startswith(site_base + "/"):
                    parsed = urllib.parse.urlsplit(url)
                    connection = http.client.HTTPConnection("localhost", port, timeout=15)
                    headers = dict(route.request.headers)
                    headers.update({"host": parsed.hostname, "accept-encoding": "identity", "x-forwarded-proto": "https"})
                    connection.request(route.request.method, parsed.path + ("?" + parsed.query if parsed.query else ""), body=route.request.post_data_buffer, headers=headers)
                    response = connection.getresponse()
                    body = response.read()
                    reply_headers = {key.lower(): value for key,value in response.getheaders() if key.lower() not in ["transfer-encoding","connection","content-length","content-encoding"]}
                    assert not 300 <= response.status < 400, f"Unexpected local redirect for {url}: {response.status} {reply_headers.get('location')}"
                    route.fulfill(status=response.status, headers=reply_headers, body=body)
                    connection.close()
                else:
                    external.append(url)
                    if "challenges.cloudflare.com/turnstile/v0/api.js" in url:
                        route.fulfill(status=200, content_type="application/javascript", body="window.__turnstileSizes=[];window.turnstile={render:(el,o)=>{window.__turnstileSizes.push(o.size);o.callback('fixture-token');return 'fixture-widget';},remove:()=>{},reset:()=>{}};")
                    else:
                        route.fulfill(status=200, content_type="text/html", body="<html><body>External fixture</body></html>")
            context.route("**/*", network)
            page = context.new_page()
            page.goto(division_base, wait_until="networkidle")
            expect(page.locator(".cookie-banner")).to_be_visible()
            page.locator(".cookie-banner button").filter(has_text="Reject optional").click()
            expect(page.locator(".cookie-banner")).to_have_count(0)
            assert not external, external
            for width in [320,375,390,768,1024,1440]:
                page.set_viewport_size({"width":width,"height":812})
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), f"Overflow at {width}"
                summary = page.locator(".division-language summary")
                assert summary.bounding_box()["height"] >= 44
                summary.click()
                expect(page.locator(".division-language nav")).to_be_visible()
                for item in page.locator(".division-language nav a").all():
                    assert item.bounding_box()["height"] >= 44
                page.keyboard.press("Escape")
                expect(page.locator(".division-language")).not_to_have_attribute("open", "")
            page.set_viewport_size({"width":375,"height":812})
            page.locator(".division-language summary").click()
            with page.expect_navigation(wait_until="networkidle"):
                page.locator(".division-language a[lang=tr]").click()
            assert page.url.endswith("/tr"), f"Unexpected language destination: {page.url}\n" + (temporary / "server.log").read_text(encoding="utf-8")[-3000:]
            if page.locator("html").get_attribute("lang") != "tr":
                log.flush()
                print("Language failure:", page.url, page.locator("body").inner_text()[:800], (temporary / "server.log").read_text(encoding="utf-8")[-4000:], flush=True)
            expect(page.locator("html")).to_have_attribute("lang", "tr")
            page.locator("button[aria-controls=division-mobile-nav]").click()
            expect(page.locator("#division-mobile-nav")).to_be_visible()
            expect(page.locator("#division-mobile-nav a[href='/tr/services']")).to_be_visible()
            page.keyboard.press("Escape")
            expect(page.locator("#division-mobile-nav")).to_have_count(0)
            page.screenshot(path=str(temporary / "mobile-division.png"), full_page=False)
            # Primary origin has independent preferences and no third-party script
            # load, despite the contact/newsletter forms being present.
            page.goto(site_base + "/home", wait_until="networkidle")
            expect(page.locator(".cookie-banner")).to_be_visible()
            expect(page.locator(".media-consent-placeholder")).to_be_visible()
            assert not external, external
            page.locator(".cookie-banner button").filter(has_text="Allow all").click()
            player = page.locator("iframe[src*='youtube-nocookie.com']")
            expect(player).to_be_visible()
            if not any("youtube-nocookie.com" in url for url in external):
                with page.expect_request("https://www.youtube-nocookie.com/**"):
                    player.scroll_into_view_if_needed()
                page.wait_for_load_state("networkidle")
            assert any("youtube-nocookie.com" in url for url in external)
            assert not any("challenges.cloudflare.com" in url for url in external)
            page.locator(".cookie-reopen").click()
            page.locator("dialog input[type=checkbox]").uncheck()
            page.locator("dialog button").filter(has_text="Save my choices").click()
            expect(page.locator("iframe[src*='youtube-nocookie.com']")).to_have_count(0)
            page.reload(wait_until="networkidle")
            expect(page.locator("iframe[src*='youtube-nocookie.com']")).to_have_count(0)
            for lang in ["tr","en","de"]:
                page.goto(site_base + f"/cookies?lang={lang}", wait_until="networkidle")
                expect(page.locator("html")).to_have_attribute("lang",lang)
                assert page.locator(".legal-document section").count() >= 4
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
            page.goto(site_base + "/cookies?lang=tr", wait_until="networkidle")
            page.locator(".cookie-reopen").click()
            assert page.evaluate("document.querySelector('dialog').scrollWidth <= innerWidth")
            for height in [480,812]:
                page.set_viewport_size({"width":375,"height":height})
                for button in page.locator("dialog > .cookie-actions button").all():
                    box = button.bounding_box()
                    assert box["y"] >= 0 and box["y"] + box["height"] <= height, "Cookie actions must remain visible"
            page.screenshot(path=str(temporary / "mobile-preferences.png"), full_page=False)
            # The existing stored consent does not enable Cloudflare implicitly.
            assert not any("challenges.cloudflare.com" in url for url in external)
            page.locator(".cookie-dialog-header button").click()
            page.goto(site_base + "/contact", wait_until="networkidle")
            checks = page.get_by_role("button", name="Start security verification")
            expect(checks).to_have_count(2)
            checks.first.click()
            page.wait_for_function("window.__turnstileSizes?.length === 1")
            checks.first.click()
            page.wait_for_function("window.__turnstileSizes?.length === 2")
            assert page.evaluate("window.__turnstileSizes") == ["compact", "compact"]
            assert sum("challenges.cloudflare.com/turnstile/v0/api.js" in url for url in external) == 1
            blocked = browser.new_context(viewport={"width":320,"height":640})
            blocked.route("**/*", network)
            blocked.add_init_script("for(const name of ['localStorage','sessionStorage'])Object.defineProperty(window,name,{get(){throw new DOMException('Blocked','SecurityError')}});")
            private_page = blocked.new_page()
            private_page.goto(site_base + "/cookies?lang=en", wait_until="networkidle")
            private_page.locator(".cookie-banner button").filter(has_text="Reject optional").click()
            expect(private_page.locator(".cookie-banner")).to_have_count(0)
            expect(private_page.locator(".cookie-storage-error")).to_be_visible()
            private_page.reload(wait_until="networkidle")
            expect(private_page.locator(".cookie-banner")).to_be_visible()
            blocked.close()
            browser.close()
        print("PASS mobile widths 320–1440, touch targets, language switching/menu, per-origin choices, YouTube consent/withdrawal, no automatic Cloudflare, legal languages")
        # Preserve QA screenshots for inspection without copying fixture secrets.
        output = Path(os.environ.get("TEMP", tempfile.gettempdir())) / "hepta-privacy-qa"
        output.mkdir(exist_ok=True)
        for name in ["mobile-division.png","mobile-preferences.png"]:
            shutil.copyfile(temporary / name, output / name)
        print(f"Screenshots: {output}")
    finally:
        if process.poll() is None:
            if os.name == "nt":
                subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                process.terminate()
        process.wait(timeout=15)
        log.close()
