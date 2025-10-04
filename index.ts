import type { Parser } from "streaming-markdown";
import * as smd from "streaming-markdown";

class StreamingMarkdownElement extends HTMLElement {
  private observer: MutationObserver;
  private container: HTMLElement;
  private shadowRootRef: ShadowRoot;
  private parser: Parser | null = null;

  constructor() {
    super();
    this.shadowRootRef = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; }
      :host([hidden]) { display: none; }
      .content { white-space: normal; }
      .content p { margin: 0 0 0.75rem 0; }
    `;

    this.container = document.createElement("div");
    this.container.className = "content";
    this.container.setAttribute("part", "content");

    this.shadowRootRef.append(style, this.container);

    this.observer = new MutationObserver(this.onMutations);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "article");
    this.setAttribute("aria-live", "polite");
    // Init streaming-markdown parser bound to our shadow content container
    this.parser = smd.parser(smd.default_renderer(this.container));
    // Capture text nodes appended by htmx SSE/WebSocket handlers
    this.observer.observe(this, { childList: true });
    // Consume any initial child content present at connect time
    this.consumeInitialChildren();
  }

  disconnectedCallback(): void {
    this.observer.disconnect();
    this.parser = null;
  }

  // Public minimal API for manual usage (e.g., WebSocket)
  public appendChunk(text: string): void {
    if (!text) return;
    if (!this.parser) {
      this.parser = smd.parser(smd.default_renderer(this.container));
    }
    smd.parser_write(this.parser, text);
    this.autoScrollIfNearBottom();
  }

  public finish(): void {
    if (this.parser) smd.parser_end(this.parser);
    this.setAttribute("aria-live", "off");
  }

  public reset(): void {
    this.container.innerHTML = "";
    this.parser = smd.parser(smd.default_renderer(this.container));
    this.setAttribute("aria-live", "polite");
  }

  private onMutations = (mutations: MutationRecord[]): void => {
    for (const m of mutations) {
      for (const node of Array.from(m.addedNodes)) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node as Text).data;
          if (text) this.appendChunk(text);
          node.parentNode?.removeChild(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const text = (node as Element).textContent || "";
          if (text) this.appendChunk(text);
          node.parentNode?.removeChild(node);
        }
      }
    }
  };

  private consumeInitialChildren(): void {
    const snapshot = Array.from(this.childNodes);
    for (const node of snapshot) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node as Text).data;
        if (text) this.appendChunk(text);
        node.parentNode?.removeChild(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const text = (node as Element).textContent || "";
        if (text) this.appendChunk(text);
        node.parentNode?.removeChild(node);
      }
    }
  }

  private autoScrollIfNearBottom(): void {
    // Only scroll if the user is near the bottom to avoid disrupting reading
    const host = this;
    const nearBottom = host.scrollHeight - host.scrollTop - host.clientHeight < 64;
    if (nearBottom) host.scrollTop = host.scrollHeight;
  }
}

declare global {
  interface Window {
    // no globals required for minimal build
  }
}

if (!customElements.get("streaming-md")) {
  customElements.define("streaming-md", StreamingMarkdownElement);
}

export { StreamingMarkdownElement };