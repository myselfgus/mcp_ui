import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ResourceRenderer } from '../ResourceRenderer';
import '@testing-library/jest-dom';
import { HtmlResource } from '../HtmlResource';
import { RemoteDomResource } from '../RemoteDomResource';
import { basicComponentLibrary } from '../../component-libraries/basic';

vi.mock('../HtmlResource', () => ({
  HtmlResource: vi.fn(() => <div data-testid="html-resource" />),
}));

vi.mock('../RemoteDomResource', () => ({
  RemoteDomResource: vi.fn(() => <div data-testid="remote-dom-resource" />),
}));

describe('<ResourceRenderer />', () => {
  const baseResource = {
    uri: 'ui://test-resource',
    content: 'test content',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render HtmlResource for "text/html" mimeType', () => {
    const resource = { ...baseResource, mimeType: 'text/html' };
    render(<ResourceRenderer resource={resource} />);
    expect(screen.getByTestId('html-resource')).toBeInTheDocument();
    expect(RemoteDomResource).not.toHaveBeenCalled();
    expect(HtmlResource).toHaveBeenCalledWith(
      { resource },
      {},
    );
  });

  it('should render HtmlResource for "text/uri-list" mimeType', () => {
    const resource = { ...baseResource, mimeType: 'text/uri-list' };
    render(<ResourceRenderer resource={resource} />);
    expect(screen.getByTestId('html-resource')).toBeInTheDocument();
    expect(RemoteDomResource).not.toHaveBeenCalled();
    expect(HtmlResource).toHaveBeenCalledWith(
      { resource },
      {},
    );
  });

  it('should render RemoteDomResource for "remote-dom" mimeType', () => {
    const resource = {
      ...baseResource,
      mimeType: 'application/vnd.mcp-ui.remote-dom+javascript; flavor=react',
    };
    render(<ResourceRenderer resource={resource} />);
    expect(screen.getByTestId('remote-dom-resource')).toBeInTheDocument();
    expect(HtmlResource).not.toHaveBeenCalled();
    expect(RemoteDomResource).toHaveBeenCalledWith({ resource, library: basicComponentLibrary }, {});
  });

  it('should render an unsupported message for an unknown mimeType', () => {
    const resource = { ...baseResource, mimeType: 'application/unknown' };
    render(<ResourceRenderer resource={resource} />);
    expect(screen.getByText('Unsupported resource type.')).toBeInTheDocument();
    expect(HtmlResource).not.toHaveBeenCalled();
    expect(RemoteDomResource).not.toHaveBeenCalled();
  });

  it('should render an error if content type is not supported', () => {
    const resource = { ...baseResource, mimeType: 'text/html' };
    render(
      <ResourceRenderer
        resource={resource}
        supportedContentTypes={['remoteDom']}
      />,
    );
    expect(
      screen.getByText('Unsupported content type: rawHtml.'),
    ).toBeInTheDocument();
    expect(HtmlResource).not.toHaveBeenCalled();
    expect(RemoteDomResource).not.toHaveBeenCalled();
  });

  it('should render the resource if content type is supported', () => {
    const resource = { ...baseResource, mimeType: 'text/html' };
    render(
      <ResourceRenderer
        resource={resource}
        supportedContentTypes={['rawHtml']}
      />,
    );
    expect(screen.getByTestId('html-resource')).toBeInTheDocument();
    expect(RemoteDomResource).not.toHaveBeenCalled();
    expect(HtmlResource).toHaveBeenCalledWith({ resource }, {});
  });
}); 