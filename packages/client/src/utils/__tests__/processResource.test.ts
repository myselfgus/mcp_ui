import { describe, it, expect } from 'vitest';
import { processHTMLResource } from '../processResource';

describe('text/uri-list', () => {
  it('should process a valid https URL', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'https://example.com',
    };
    const result = processHTMLResource(resource);
    expect(result.error).toBeUndefined();
    expect(result.iframeSrc).toBe('https://example.com');
    expect(result.iframeRenderMode).toBe('src');
  });

  it('should process a valid http URL', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'http://example.com',
    };
    const result = processHTMLResource(resource);
    expect(result.error).toBeUndefined();
    expect(result.iframeSrc).toBe('http://example.com');
    expect(result.iframeRenderMode).toBe('src');
  });

  it('should return an error for an invalid URL (javascript:alert)', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'javascript:alert("pwned")',
    };
    const result = processHTMLResource(resource);
    expect(result.error).toBe('No valid URLs found in uri-list content.');
    expect(result.iframeSrc).toBeUndefined();
  });

  it('should return an error for a blob URL', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'blob:https://example.com/some-uuid',
    };
    const result = processHTMLResource(resource);
    expect(result.error).toBe('No valid URLs found in uri-list content.');
    expect(result.iframeSrc).toBeUndefined();
  });

  it('should extract the first valid URL from a list', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: '# comment\ninvalid-url\nhttps://first-valid.com\nhttps://second-valid.com',
    };
    const result = processHTMLResource(resource);
    expect(result.error).toBeUndefined();
    expect(result.iframeSrc).toBe('https://first-valid.com');
  });

  it('should handle empty or commented-out content', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: '# just a comment\n# another comment',
    };
    const result = processHTMLResource(resource);
    expect(result.error).toBe('No valid URLs found in uri-list content.');
  });

  it('should return error for content with no valid URLs', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'just-some-string\nanother-string',
    };
    const result = processHTMLResource(resource);
    expect(result.error).toBe('No valid URLs found in uri-list content.');
  });

  it('should use proxy when provided for external URLs', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'https://example.com',
    };
    const result = processHTMLResource(resource, 'https://proxy.mcpui.dev/');
    expect(result.error).toBeUndefined();
    expect(result.iframeSrc).toBe('https://proxy.mcpui.dev/?url=https%3A%2F%2Fexample.com');
    expect(result.iframeRenderMode).toBe('src');
  });

  it('should handle proxy with existing query parameters', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'https://example.com',
    };
    const result = processHTMLResource(resource, 'https://proxy.mcpui.dev/?a=1&b=2');
    expect(result.error).toBeUndefined();
    expect(result.iframeSrc).toBe('https://proxy.mcpui.dev/?a=1&b=2&url=https%3A%2F%2Fexample.com');
    expect(result.iframeRenderMode).toBe('src');
  });

  it('should fallback to direct URL if proxy is invalid', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'https://example.com',
    };
    const result = processHTMLResource(resource, 'not-a-valid-url');
    expect(result.error).toBeUndefined();
    expect(result.iframeSrc).toBe('https://example.com');
    expect(result.iframeRenderMode).toBe('src');
  });

  it('should not use proxy when proxy is empty string', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'https://example.com',
    };
    const result = processHTMLResource(resource, '');
    expect(result.error).toBeUndefined();
    expect(result.iframeSrc).toBe('https://example.com');
    expect(result.iframeRenderMode).toBe('src');
  });

  it('should not use proxy when proxy is not provided', () => {
    const resource = {
      mimeType: 'text/uri-list',
      text: 'https://example.com',
    };
    const result = processHTMLResource(resource);
    expect(result.error).toBeUndefined();
    expect(result.iframeSrc).toBe('https://example.com');
    expect(result.iframeRenderMode).toBe('src');
  });
});
