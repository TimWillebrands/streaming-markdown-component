## streaming-markdown-component

Minimal custom element `<streaming-md>` for progressively rendering streamed Markdown in the browser. Internally powered by the excellent Streaming Markdown library.

### Thanks and Credits

Huge thanks to the Streaming Markdown project for the streaming parser and default renderer that make this possible. Please check out and support the project: [Streaming Markdown docs](https://thetarnav.github.io/streaming-markdown/).

### Install

```bash
npm install streaming-markdown-component
# or
pnpm add streaming-markdown-component
# or
yarn add streaming-markdown-component
```

### Usage

```html
<script type="module">
  import 'streaming-markdown-component/dist/index.js'
</script>

<streaming-md id="md"></streaming-md>

<script type="module">
  const el = document.getElementById('md')
  el.appendChunk('# Hello, streamed world!\n\n')
  el.appendChunk('- One\n- Two\n- Three\n')
  el.finish()
</script>
```

Works great with htmx SSE:

```html
<article
  hx-ext="sse"
  sse-connect="/party/ROOM/messages/MSG"
  sse-swap="message"
  hx-swap="beforeend"
  hx-target="find streaming-md"
  sse-close="finished">
  <streaming-md></streaming-md>
  <!-- htmx appends data: chunks here; the element consumes text nodes -->
  <!-- server should send: event: message / data: ... and event: finished when done -->
  <!-- Reference: https://thetarnav.github.io/streaming-markdown/ -->
</article>
```

### API

- `appendChunk(text: string)`: Append raw markdown chunk.
- `finish()`: Flush and mark complete.
- `reset()`: Clear content and restart.

### Demo

Open `demo.html` locally in a browser. It imports `dist/index.js` and streams predefined Markdown chunks into `<streaming-md>`.

#### GitHub Pages

- The repo includes `docs/index.html`. CI builds the component and copies `dist/` into `docs/dist/`.
- Pages workflow `.github/workflows/pages.yml` deploys the `docs/` directory on pushes to `main` (and on manual dispatch).
- After enabling GitHub Pages (GitHub → Settings → Pages → Source: GitHub Actions), your demo will be available at:
  - `https://<yourname>.github.io/<repo>/`

### Development

```bash
bun install
bun run build
# outputs ESM at dist/index.js
```

### Publish

This package ships ESM for the browser and uses Bun for publishing via GitHub Actions.

- CI: On tag push like `v0.1.0` (or manual dispatch), the workflow builds with Bun and runs `bun publish` to npm. Set `NPM_TOKEN` in repo secrets.
- Local: you can also publish from your machine with Bun:

```bash
bun run build
bun publish --access public
```

### License

MIT
