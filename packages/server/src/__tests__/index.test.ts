import { createUIResource } from '../index';

describe('@mcp-ui/server', () => {
  describe('createUIResource', () => {
    it('should create a text-based direct HTML resource', () => {
      const options = {
        uri: 'ui://test-html' as const,
        content: { type: 'rawHtml' as const, htmlString: '<p>Test</p>' },
        delivery: 'text' as const,
      };
      const resource = createUIResource(options);
      expect(resource.type).toBe('resource');
      expect(resource.resource.uri).toBe('ui://test-html');
      expect(resource.resource.mimeType).toBe('text/html');
      expect(resource.resource.text).toBe('<p>Test</p>');
      expect(resource.resource.blob).toBeUndefined();
    });

    it('should create a blob-based direct HTML resource', () => {
      const options = {
        uri: 'ui://test-html-blob' as const,
        content: { type: 'rawHtml' as const, htmlString: '<h1>Blob</h1>' },
        delivery: 'blob' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.blob).toBe(
        Buffer.from('<h1>Blob</h1>').toString('base64'),
      );
      expect(resource.resource.text).toBeUndefined();
    });

    it('should create a text-based external URL resource', () => {
      const options = {
        uri: 'ui://test-url' as const,
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com',
        },
        delivery: 'text' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.uri).toBe('ui://test-url');
      expect(resource.resource.mimeType).toBe('text/uri-list');
      expect(resource.resource.text).toBe('https://example.com');
      expect(resource.resource.blob).toBeUndefined();
    });

    it('should create a blob-based external URL resource', () => {
      const options = {
        uri: 'ui://test-url-blob' as const,
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com/blob',
        },
        delivery: 'blob' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.mimeType).toBe('text/uri-list');
      expect(resource.resource.blob).toBe(
        Buffer.from('https://example.com/blob').toString('base64'),
      );
      expect(resource.resource.text).toBeUndefined();
    });

    it('should create a blob-based direct HTML resource with correct mimetype', () => {
      const options = {
        uri: 'ui://test-html-blob' as const,
        content: { type: 'rawHtml' as const, htmlString: '<h1>Blob</h1>' },
        delivery: 'blob' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.mimeType).toBe('text/html');
      expect(resource.resource.blob).toBe(
        Buffer.from('<h1>Blob</h1>').toString('base64'),
      );
      expect(resource.resource.text).toBeUndefined();
    });

    it('should throw error for invalid URI prefix with rawHtml', () => {
      const options = {
        uri: 'invalid://test-html' as const,
        content: { type: 'rawHtml' as const, htmlString: '<p>Test</p>' },
        delivery: 'text' as const,
      };
      // @ts-expect-error We are intentionally passing an invalid URI to test the error.
      expect(() => createUIResource(options)).toThrow(
        "MCP SDK: URI must start with 'ui://' when content.type is 'rawHtml'.",
      );
    });

    it('should throw error for invalid URI prefix with externalUrl', () => {
      const options = {
        uri: 'invalid://test-url' as const,
        content: {
          type: 'externalUrl' as const,
          iframeUrl: 'https://example.com',
        },
        delivery: 'text' as const,
      };
      // @ts-expect-error We are intentionally passing an invalid URI to test the error.
      expect(() => createUIResource(options)).toThrow(
        "MCP SDK: URI must start with 'ui://' when content.type is 'externalUrl'.",
      );
    });

    it('should create a text-based remote DOM resource with React flavor', () => {
      const options = {
        uri: 'ui://test-remote-dom-react' as const,
        content: {
          type: 'remoteDom' as const,
          script: '<p>React Component</p>',
          flavor: 'react' as const,
        },
        delivery: 'text' as const,
      };
      const resource = createUIResource(options);
      expect(resource.type).toBe('resource');
      expect(resource.resource.uri).toBe('ui://test-remote-dom-react');
      expect(resource.resource.mimeType).toBe(
        'application/vnd.mcp-ui.remote-dom+javascript; flavor=react',
      );
      expect(resource.resource.text).toBe('<p>React Component</p>');
      expect(resource.resource.blob).toBeUndefined();
    });

    it('should create a blob-based remote DOM resource with Web Components flavor', () => {
      const options = {
        uri: 'ui://test-remote-dom-wc' as const,
        content: {
          type: 'remoteDom' as const,
          script: '<p>Web Component</p>',
          flavor: 'webcomponents' as const,
        },
        delivery: 'blob' as const,
      };
      const resource = createUIResource(options);
      expect(resource.resource.mimeType).toBe(
        'application/vnd.mcp-ui.remote-dom+javascript; flavor=webcomponents',
      );
      expect(resource.resource.blob).toBe(
        Buffer.from('<p>Web Component</p>').toString('base64'),
      );
      expect(resource.resource.text).toBeUndefined();
    });

    it('should throw error for invalid URI prefix with remoteDom', () => {
      const options = {
        uri: 'invalid://test-remote-dom' as const,
        content: {
          type: 'remoteDom' as const,
          script: '<p>Invalid</p>',
          flavor: 'react' as const,
        },
        delivery: 'text' as const,
      };
      // @ts-expect-error We are intentionally passing an invalid URI to test the error.
      expect(() => createUIResource(options)).toThrow(
        "MCP SDK: URI must start with 'ui://' when content.type is 'remoteDom'.",
      );
    });
  });
});
