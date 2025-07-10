import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { UIResourceRenderer } from '../UIResourceRenderer';
import '@testing-library/jest-dom';
import { HTMLResourceRenderer } from '../HTMLResourceRenderer';
import { RemoteDOMResourceRenderer } from '../RemoteDOMResourceRenderer';
import { basicComponentLibrary } from '../../remote-dom/component-libraries/basic';

vi.mock('../HTMLResourceRenderer', () => ({
  HTMLResourceRenderer: vi.fn(() => <div data-testid="html-resource" />),
}));

vi.mock('../RemoteDOMResourceRenderer', () => ({
  RemoteDOMResourceRenderer: vi.fn(() => <div data-testid="remote-dom-resource" />),
}));

describe('<UIResourceRenderer />', () => {
  const baseResource = {
    uri: 'ui://test-resource',
    content: 'test content',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render HTMLResourceRenderer for "text/html" mimeType', () => {
    const resource = { ...baseResource, mimeType: 'text/html' };
    render(<UIResourceRenderer resource={resource} />);
    expect(screen.getByTestId('html-resource')).toBeInTheDocument();
    expect(RemoteDOMResourceRenderer).not.toHaveBeenCalled();
    expect(HTMLResourceRenderer).toHaveBeenCalledWith({ resource }, {});
  });

  it('should render HTMLResourceRenderer for "text/uri-list" mimeType', () => {
    const resource = { ...baseResource, mimeType: 'text/uri-list' };
    render(<UIResourceRenderer resource={resource} />);
    expect(screen.getByTestId('html-resource')).toBeInTheDocument();
    expect(RemoteDOMResourceRenderer).not.toHaveBeenCalled();
    expect(HTMLResourceRenderer).toHaveBeenCalledWith({ resource }, {});
  });

  it('should render RemoteDOMResourceRenderer for "remote-dom" mimeType', () => {
    const resource = {
      ...baseResource,
      mimeType: 'application/vnd.mcp-ui.remote-dom+javascript; flavor=react',
    };
    render(<UIResourceRenderer resource={resource} />);
    expect(screen.getByTestId('remote-dom-resource')).toBeInTheDocument();
    expect(HTMLResourceRenderer).not.toHaveBeenCalled();
    expect(RemoteDOMResourceRenderer).toHaveBeenCalledWith(
      { resource, library: basicComponentLibrary },
      {},
    );
  });

  it('should render an unsupported message for an unknown mimeType', () => {
    const resource = { ...baseResource, mimeType: 'application/unknown' };
    render(<UIResourceRenderer resource={resource} />);
    expect(screen.getByText('Unsupported resource type.')).toBeInTheDocument();
    expect(HTMLResourceRenderer).not.toHaveBeenCalled();
    expect(RemoteDOMResourceRenderer).not.toHaveBeenCalled();
  });

  it('should render an error if content type is not supported', () => {
    const resource = { ...baseResource, mimeType: 'text/html' };
    render(<UIResourceRenderer resource={resource} supportedContentTypes={['remoteDom']} />);
    expect(screen.getByText('Unsupported content type: rawHtml.')).toBeInTheDocument();
    expect(HTMLResourceRenderer).not.toHaveBeenCalled();
    expect(RemoteDOMResourceRenderer).not.toHaveBeenCalled();
  });

  it('should render the resource if content type is supported', () => {
    const resource = { ...baseResource, mimeType: 'text/html' };
    render(<UIResourceRenderer resource={resource} supportedContentTypes={['rawHtml']} />);
    expect(screen.getByTestId('html-resource')).toBeInTheDocument();
    expect(RemoteDOMResourceRenderer).not.toHaveBeenCalled();
    expect(HTMLResourceRenderer).toHaveBeenCalledWith({ resource }, {});
  });
});
