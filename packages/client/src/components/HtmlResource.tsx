import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { UiActionResult, ResourceContentType } from '../types';
import { processResource } from '../utils/processResource';

export type RenderHtmlResourceProps = {
  resource: Partial<Resource>;
  onUiAction?: (result: UiActionResult) => Promise<unknown>;
  style?: React.CSSProperties;
  iframeProps?: Omit<
    React.HTMLAttributes<HTMLIFrameElement>,
    'src' | 'srcDoc' | 'ref' | 'style'
  >;
  supportedContentTypes?: ResourceContentType[];
};

export const HtmlResource = React.forwardRef<
  HTMLIFrameElement | null,
  RenderHtmlResourceProps
>(
  (
    { resource, onUiAction, style, iframeProps, supportedContentTypes },
    ref,
  ) => {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    useImperativeHandle(ref, () => iframeRef.current as HTMLIFrameElement);

    const { error, iframeSrc, iframeRenderMode, htmlString } = useMemo(
      () => processResource(resource, supportedContentTypes),
      [resource, supportedContentTypes],
    );

    useEffect(() => {
      function handleMessage(event: MessageEvent) {
        // Only process the message if it came from this specific iframe
        if (
          iframeRef.current &&
          event.source === iframeRef.current.contentWindow
        ) {
          const uiActionResult = event.data as UiActionResult;
          if (!uiActionResult) {
            return;
          }
          onUiAction?.(uiActionResult)?.catch((err) => {
            console.error(
              'Error handling UI action result in RenderHtmlResource:',
              err,
            );
          });
        }
      }
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, [onUiAction]);

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
          return (
            <p className="text-orange-500">
              No URL provided for HTML resource.
            </p>
          );
        }
        return null;
      }
      return (
        <iframe
          src={iframeSrc}
          sandbox="allow-scripts allow-same-origin" // unsafe
          style={{ width: '100%', minHeight: 200, ...style }}
          title="MCP HTML Resource (URL)"
          {...iframeProps}
          ref={iframeRef}
        />
      );
    }

    return (
      <p className="text-gray-500">Initializing HTML resource display...</p>
    );
  },
);

HtmlResource.displayName = 'HtmlResource';
