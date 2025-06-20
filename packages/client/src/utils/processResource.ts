import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { ResourceContentType, ALL_RESOURCE_CONTENT_TYPES } from '../types';


type ProcessResourceResult = {
  error?: string;
  iframeSrc?: string;
  iframeRenderMode?: 'src' | 'srcDoc';
  htmlString?: string;
};

export function processResource(
  resource: Partial<Resource>,
  supportedContentTypes?: ResourceContentType[],
): ProcessResourceResult {
  const supported = supportedContentTypes || ALL_RESOURCE_CONTENT_TYPES;

  // Backwards compatibility: if URI starts with ui-app://, treat as URL content
  const isLegacyExternalApp =
    typeof resource.uri === 'string' && resource.uri.startsWith('ui-app://');
  const effectiveMimeType = isLegacyExternalApp
    ? 'text/uri-list'
    : resource.mimeType;

  if (
    effectiveMimeType !== 'text/html' &&
    effectiveMimeType !== 'text/uri-list'
  ) {
    return {
      error:
        'Resource must be of type text/html (for HTML content) or text/uri-list (for URL content).',
    };
  }

  if (effectiveMimeType === 'text/html' && !supported.includes('rawHtml')) {
    return {
      error: 'Raw HTML content type (text/html) is not supported.',
    };
  }

  if (
    effectiveMimeType === 'text/uri-list' &&
    !supported.includes('externalUrl')
  ) {
    return {
      error: 'External URL content type (text/uri-list) is not supported.',
    };
  }

  if (effectiveMimeType === 'text/uri-list') {
    // Handle URL content (external apps)
    // Note: While text/uri-list format supports multiple URLs, MCP-UI requires a single URL.
    // If multiple URLs are provided, only the first will be used and others will be logged as warnings.
    let urlContent = '';

    if (typeof resource.text === 'string' && resource.text.trim() !== '') {
      urlContent = resource.text;
    } else if (typeof resource.blob === 'string') {
      try {
        urlContent = new TextDecoder().decode(
          Uint8Array.from(atob(resource.blob), (c) => c.charCodeAt(0)),
        );
      } catch (e) {
        console.error('Error decoding base64 blob for URL content:', e);
        return {
          error: 'Error decoding URL from blob.',
        };
      }
    } else {
      return {
        error:
          'URL resource expects a non-empty text or blob field containing the URL.',
      };
    }

    if (urlContent.trim() === '') {
      return {
        error: 'URL content is empty.',
      };
    }

    // Parse uri-list format: URIs separated by newlines, comments start with #
    // MCP-UI requires a single URL - if multiple are found, use first and warn about others
    const lines = urlContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    if (lines.length === 0) {
      return {
        error: 'No valid URLs found in uri-list content.',
      };
    }

    if (lines.length > 1) {
      console.warn(
        `Multiple URLs found in uri-list content. Using the first URL: "${lines[0]}". Other URLs ignored:`,
        lines.slice(1),
      );
    }

    // Log backwards compatibility usage
    if (isLegacyExternalApp) {
      console.warn(
        `Detected legacy ui-app:// URI: "${resource.uri}". Update server to use ui:// with mimeType: 'text/uri-list' for future compatibility.`,
      );
    }
    return {
      iframeSrc: lines[0],
      iframeRenderMode: 'src',
    };
  } else if (effectiveMimeType === 'text/html') {
    // Handle HTML content
    if (typeof resource.text === 'string') {
      return {
        htmlString: resource.text,
        iframeRenderMode: 'srcDoc',
      };
    } else if (typeof resource.blob === 'string') {
      try {
        const decodedHtml = new TextDecoder().decode(
          Uint8Array.from(atob(resource.blob), (c) => c.charCodeAt(0)),
        );
        return {
          htmlString: decodedHtml,
          iframeRenderMode: 'srcDoc',
        };
      } catch (e) {
        console.error('Error decoding base64 blob for HTML content:', e);
        return {
          error: 'Error decoding HTML content from blob.',
        };
      }
    } else {
      return {
        error: 'HTML resource requires text or blob content.',
      };
    }
  } else {
    return {
      error: 'Unsupported mimeType. Expected text/html or text/uri-list.',
    };
  }
}
