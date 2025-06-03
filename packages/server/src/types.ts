// Primary identifier for the resource. Starts with ui://`
export type URI = `ui://${string}`;

// text/html for rawHtml content, text/uri-list for externalUrl content
export type mimeType = 'text/html' | 'text/uri-list';

export type HtmlTextContent = {
  uri: URI;
  mimeType: mimeType;
  text: string; // HTML content (for mimeType `text/html`), or iframe URL (for mimeType `text/uri-list`)
  blob?: never;
};

export type Base64BlobContent = {
  uri: URI;
  mimeType: mimeType;
  blob: string; //  Base64 encoded HTML content (for mimeType `text/html`), or iframe URL (for mimeType `text/uri-list`)
  text?: never;
};

export type ResourceContentPayload =
  | { type: 'rawHtml'; htmlString: string }
  | { type: 'externalUrl'; iframeUrl: string };

export interface CreateHtmlResourceOptions {
  uri: URI; // REQUIRED. Must start with "ui://" if content.type is "rawHtml",
  // or "ui-app://" if content.type is "externalUrl".
  content: ResourceContentPayload; // REQUIRED. The actual content payload.
  delivery: 'text' | 'blob'; // REQUIRED. How the content string (htmlString or iframeUrl) should be packaged.
}
