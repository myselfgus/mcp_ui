import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import React from 'react';
import './UIResourceWC';
import { UIResourceRenderer } from './UIResourceRenderer';

// Mock the underlying renderer to control the onUIAction callback
vi.mock('./UIResourceRenderer', () => ({
  UIResourceRenderer: vi.fn((props) => {
    // This mock simulates the renderer and allows us to trigger the action
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).triggerUIAction = (event: unknown) => props.onUIAction?.(event);
    return (
      <iframe title="MCP HTML Resource (Embedded Content)" srcDoc={props.resource?.text || ''} />
    );
  }),
}));


describe('UIResourceWC', () => {
  const resource = {
    mimeType: 'text/html',
    text: '<h1>Hello, World!</h1>',
  };

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).triggerUIAction;
  });

  it('should register the custom element', () => {
    expect(customElements.get('ui-resource-renderer')).toBeDefined();
  });

  it('should render the component via custom element with stringified prop', async () => {
    render(React.createElement('ui-resource-renderer', { resource: JSON.stringify(resource) }));

    await waitFor(() => {
      expect(UIResourceRenderer).toHaveBeenCalled();
      const iframe = screen.getByTitle('MCP HTML Resource (Embedded Content)') as HTMLIFrameElement;
      expect(iframe).toBeInTheDocument();
      expect(iframe.srcdoc).toContain('<h1>Hello, World!</h1>');
    });
  });

  it('should render with resource property after being added to the DOM', async () => {
    const el = document.createElement('ui-resource-renderer');
    document.body.appendChild(el);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el as any).resource = resource;

    await waitFor(() => {
        expect(UIResourceRenderer).toHaveBeenCalled();
        const iframe = screen.getByTitle('MCP HTML Resource (Embedded Content)') as HTMLIFrameElement;
        expect(iframe).toBeInTheDocument();
        expect(iframe.srcdoc).toContain('<h1>Hello, World!</h1>');
    });
  });

  it('should dispatch onUIAction event when the underlying component calls onUIAction', async () => {
    const onUIAction = vi.fn();

    const el = document.createElement('ui-resource-renderer');
    el.addEventListener('onUIAction', onUIAction);
    document.body.appendChild(el);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el as any).resource = resource;

    // Wait for the component to render and our mock to be in place
    await waitFor(() => {
      expect(UIResourceRenderer).toHaveBeenCalled();
    });

    const mockEventPayload = { type: 'testAction', payload: { data: '123' } };

    // Use the global function exposed by our mock to trigger the action
    await act(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).triggerUIAction(mockEventPayload);
    });
    
    expect(onUIAction).toHaveBeenCalled();
    const dispatchedEvent = onUIAction.mock.calls[0][0] as CustomEvent;
    expect(dispatchedEvent.detail).toEqual(mockEventPayload);
  });
});
