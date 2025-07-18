# Using a Proxy Script for External URLs

When rendering external URLs (`text/uri-list`), you may need to use a "proxy" to comply with your host's restrictive Content Security Policy (CSP). The proxy domain must be whitelisted as a `frame-src`. The `proxy` prop on `<UIResourceRenderer>` allows you to specify a URL for a proxy script that will render the external content in a nested iframe.

When `proxy` is set, the external URL is encoded and appended to the proxy URL. For example, if `proxy` is `https://my-proxy.com/`, the final URL will be `https://my-proxy.com/?url=<encoded_original_url>`.

::: tip Important
The term "proxy" in this context does not refer to a real proxy server. It is a static, client-side script that nests the external URL content within an iframe. This process occurs locally in the user's browser. User data never reaches a remote server.
:::

## Using the Hosted Proxy

For convenience, `mcp-ui` provides a hosted proxy script at `https://proxy.mcpui.dev`. You can use this URL directly as the `proxy` prop value without any additional setup.

```tsx
import { UIResourceRenderer } from '@mcp-ui/client';

<UIResourceRenderer
  resource={mcpResource.resource}
  htmlProps={{
    proxy: 'https://proxy.mcpui.dev'
  }}
  onUIAction={handleUIAction}
/>
```

Please verify that the host whitelists `https://proxy.mcpui.dev` as a `frame-src` in the CSP.

You can find a complete example for a site with restrictive CSP that uses the hosted proxy at `examples/external-url-demo`.

## Self-Hosting the Proxy Script

If you prefer to host your own proxy script, you can create a simple HTML file with embedded JavaScript. This is a useful alternative to the hosted version when you want more control or a custom domain.

**IMPORTANT**: For security reasons, you **MUST NOT** host the proxy script on the same origin as your main application. `mcp-ui/client` will automatically log an error and fallback to direct iframe if the same origin is detected.

### Proxy Script Requirements

A valid proxy script must:

1.  **Accept a `url` query parameter**: The script should retrieve the target URL from the `url` query parameter in its own URL.
2.  **Validate the URL**: It must validate that the provided URL is a valid `http:` or `https:` URL to prevent abuse.
3.  **Render in an Iframe**: The script should dynamically create an iframe and set its `src` to the validated target URL.
4.  **Sandbox the Iframe**: The iframe must be sandboxed to restrict its capabilities. A minimal sandbox policy would be `allow-scripts allow-same-origin`.
5.  **Forward `postMessage` Events**: To allow communication between the host application and the embedded external URL, the proxy needs to forward `message` events between `window.parent` and the iframe's `contentWindow`. For security, it's critical to use a specific `targetOrigin` instead of `*` in `postMessage` calls whenever possible. The `targetOrigin` for messages to the iframe should be the external URL's origin; Messages to the parent will resort to `*`.

### Example Self-Hosted Proxy

Here is an example of a self-hosted proxy script that meets these requirements. You can find this file in `sdks/typescript/client/scripts/proxy/index.html`.

<<< @/../../sdks/typescript/client/scripts/proxy/index.html 
