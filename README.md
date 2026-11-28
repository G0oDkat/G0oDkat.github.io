# pietreck.dev

Personal page of Torben Pietreck, live at [torben.pietreck.dev](https://torben.pietreck.dev).

A terminal window plays a short scripted session (an Ubuntu console login, `wget`, `chmod`, `./dev.sh`)
over an animated background, then reveals the profile.

## Tech

- Plain HTML, CSS and JavaScript modules: no framework, no build step, no dependencies.
- `js/terminal.js` is a small terminal engine. It plays a list of steps (output, typed input, a
  wget-style progress bar) and builds every line as DOM nodes, without parsing HTML strings.
- `js/session.js` holds the script as data. Timestamps are generated per visit.
- Set in a self-hosted copy of [Cascadia Mono](https://github.com/microsoft/cascadia-code)
  (SIL Open Font License), Microsoft's free terminal font, so the ASCII logo's block characters
  line up on every device. No third-party font service.
- Progressive enhancement: without JavaScript, or with *reduce motion* turned on, the profile is
  shown right away.
- Hosted on GitHub Pages; `robots.txt` asks crawlers to stay away.

## Structure

```
index.html        page and profile content
css/site.css      styles
js/main.js        entry point: plays the intro, then shows the profile
js/terminal.js    terminal engine
js/session.js     the scripted session
fonts/            Cascadia Mono (woff2) and its license
img/              favicons and web app manifest
```

## Run locally

JavaScript modules don't load from `file://`, so serve the folder over HTTP, for example:

```sh
npx serve .
# or
python -m http.server
```
