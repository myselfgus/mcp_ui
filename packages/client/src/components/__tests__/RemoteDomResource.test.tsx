import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { RemoteDomResource } from '../RemoteDomResource';
import '@testing-library/jest-dom';
import { basicComponentLibrary } from '../../component-libraries/basic';

// Mock child components and dependencies
vi.mock('@remote-dom/react/host', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    RemoteRootRenderer: vi.fn(() => <div data-testid="remote-root-renderer" />),
  };
});

vi.mock('../iframe-bundle', () => ({
  IFRAME_SRC_DOC: '<html><body>Mock Iframe Content</body></html>',
}));



describe('<RemoteDomResource />', () => {
  const baseResource = {
    uri: 'ui://test-remote-dom',
    content: 'const a = 1;',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should use React renderer when mimeType includes "flavor=react"', () => {
    const resource = {
      ...baseResource,
      mimeType: 'application/vnd.mcp-ui.remote-dom+javascript; flavor=react',
    };

    render(<RemoteDomResource resource={resource} library={basicComponentLibrary} />);
    
    expect(screen.getByText('Using React renderer: Yes')).toBeInTheDocument();
    expect(screen.getByTestId('remote-root-renderer')).toBeInTheDocument();
  });

  it('should use standard DOM renderer when mimeType includes "flavor=webcomponents"', () => {
    const resource = {
      ...baseResource,
      mimeType: 'application/vnd.mcp-ui.remote-dom+javascript; flavor=webcomponents',
    };

    render(<RemoteDomResource resource={resource} />);
    
    expect(screen.getByText('Using React renderer: No')).toBeInTheDocument();
    expect(screen.getByText('Standard Remote DOM container:')).toBeInTheDocument();
    expect(screen.queryByTestId('remote-root-renderer')).not.toBeInTheDocument();
  });

  it('should default to standard DOM renderer when mimeType is not provided', () => {
    const resource = { ...baseResource };

    render(<RemoteDomResource resource={resource} />);
    
    expect(screen.getByText('Using React renderer: No')).toBeInTheDocument();
    expect(screen.getByText('Standard Remote DOM container:')).toBeInTheDocument();
    expect(screen.queryByTestId('remote-root-renderer')).not.toBeInTheDocument();
  });

  it('should default to standard DOM renderer for an unknown flavor', () => {
    const resource = {
        ...baseResource,
        mimeType: 'application/vnd.mcp-ui.remote-dom+javascript; flavor=unknown',
    };

    render(<RemoteDomResource resource={resource} />);
    
    expect(screen.getByText('Using React renderer: No')).toBeInTheDocument();
    expect(screen.getByText('Standard Remote DOM container:')).toBeInTheDocument();
    expect(screen.queryByTestId('remote-root-renderer')).not.toBeInTheDocument();
  });

  it('should use the provided component library', () => {
    const resource = {
      ...baseResource,
      mimeType: 'application/vnd.mcp-ui.remote-dom+javascript; flavor=react',
    };
    render(<RemoteDomResource resource={resource} library={basicComponentLibrary} />);
    expect(screen.getByText('Component library: basic')).toBeInTheDocument();
  });
}); 