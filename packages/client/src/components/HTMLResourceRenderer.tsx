import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { UIActionResult } from '../types';
import { processHTMLResource } from '../utils/processResource';

export type HTMLResourceRendererProps = {
  resource: Partial<Resource>;
  onUIAction?: (result: UIActionResult) => Promise<unknown>;
  style?: React.CSSProperties;
  iframeProps?: Omit<React.HTMLAttributes<HTMLIFrameElement>, 'src' | 'srcDoc' | 'style'> & {
    ref?: React.RefObject<HTMLIFrameElement>;
  };
};

const InternalMessageType = {
  UI_ACTION_RECEIVED: 'ui-action-received',
  UI_ACTION_RESPONSE: 'ui-action-response',
} as const;

export const HTMLResourceRenderer = ({
  resource,
  onUIAction,
  style,
  iframeProps,
}: HTMLResourceRendererProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  useImperativeHandle(iframeProps?.ref, () => iframeRef.current as HTMLIFrameElement);

  const { error, iframeSrc, iframeRenderMode, htmlString } = useMemo(
    () => processHTMLResource(resource),
    [resource],
  );

  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      // Only process the message if it came from this specific iframe
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        const uiActionResult = event.data as UIActionResult;
        if (!uiActionResult) {
          return;
        }

        // return the "ui-action-received" message only if the onUIAction callback is provided
        // otherwise we cannot know that the message was received by the client
        if (onUIAction) {
          if (uiActionResult.messageId) {
            event.source?.postMessage({
              type: InternalMessageType.UI_ACTION_RECEIVED,
              payload: {
                messageId: uiActionResult.messageId,
                originalMessage: event.data,
              },
            });
          }
          try {
            const response = await onUIAction(uiActionResult);
            if (uiActionResult.messageId) {
              event.source?.postMessage({
                type: InternalMessageType.UI_ACTION_RESPONSE,
                payload: {
                  messageId: uiActionResult.messageId,
                  response,
                  originalMessage: event.data,
                },
              });
            }
          } catch (err) {
            console.error('Error handling UI action result in HTMLResourceRenderer:', err);
          }
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onUIAction]);

  if (error) return <p className="text-red-500">{error}</p>;

  if (iframeRenderMode === 'srcDoc') {
    if (htmlString === null || htmlString === undefined) {
      if (!error) {
        return <p className="text-orange-500">No HTML content to display.</p>;
      }
      return null;
    }
    return (
      <iframe
        srcDoc={htmlString}
        sandbox="allow-scripts"
        style={{ width: '100%', minHeight: 200, ...style }}
        title="MCP HTML Resource (Embedded Content)"
        {...iframeProps}
        ref={iframeRef}
      />
    );
  } else if (iframeRenderMode === 'src') {
    if (iframeSrc === null || iframeSrc === undefined) {
      if (!error) {
        return <p className="text-orange-500">No URL provided for HTML resource.</p>;
      }
      return null;
    }
    return (
      <iframe
        src={iframeSrc}
        sandbox="allow-scripts allow-same-origin"
        style={{ width: '100%', minHeight: 200, ...style }}
        title="MCP HTML Resource (URL)"
        {...iframeProps}
        ref={iframeRef}
      />
    );
  }

  return <p className="text-gray-500">Initializing HTML resource display...</p>;
};

HTMLResourceRenderer.displayName = 'HTMLResourceRenderer';
