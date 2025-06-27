import React, { useMemo, useEffect, useRef } from 'react';
import { DOMRemoteReceiver } from '@remote-dom/core/receivers';
import { 
  createRemoteComponentRenderer,
  RemoteRootRenderer,
  RemoteReceiver,
} from '@remote-dom/react/host';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { IFRAME_SRC_DOC } from '../iframe-bundle';
import { ThreadIframe } from '@quilted/threads';
import type { SandboxAPI, RemoteElementConfiguration, UiActionResult } from '../types';
import type { ComponentLibrary } from '../types/componentLibrary';
import { basicComponentLibrary } from '../component-libraries/basic';
import { RemoteDomRenderer } from './RemoteDomRenderer';

export type RemoteDomResourceProps = {
  resource: Partial<Resource>;
  library?: ComponentLibrary;
  remoteElements?: RemoteElementConfiguration[];
  onUiAction?: (result: UiActionResult) => Promise<unknown>;
};

export const RemoteDomResource: React.FC<RemoteDomResourceProps> = ({
  resource,
  library,
  remoteElements = [],
  onUiAction,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const threadRef = useRef<ThreadIframe<SandboxAPI> | null>(null);

  const flavor = useMemo(() => {
    const mimeType = resource.mimeType || '';
    if (mimeType.includes('flavor=react')) {
      return 'react';
    }
    // Default to webcomponents for legacy or unspecified
    return 'webcomponents';
  }, [resource.mimeType]);


  const componentKey = `${library?.name}-${flavor}`;

  const { receiver, components } = useMemo(() => {
    switch (flavor) {
      case 'react': {
        const reactReceiver = new RemoteReceiver();
        const componentLibrary = library || basicComponentLibrary;
        
        const componentMap = new Map();
        
        if (componentLibrary) {
          componentLibrary.elements.forEach((elementDef) => {
            const WrappedComponent = createRemoteComponentRenderer(
              elementDef.component,
            );
            componentMap.set(elementDef.tagName, WrappedComponent);
          });
        }
        
        return {
          receiver: reactReceiver,
          components: componentMap,
        };
      }
      case 'webcomponents': 
      default: {
        const domReceiver = new DOMRemoteReceiver();
        return {
          receiver: domReceiver,
          components: null,
        };
      }
    }
  }, [resource, library, remoteElements]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
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
            'Error handling UI action result in RemoteDomResource:',
            err,
          );
        });
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onUiAction]);

  useEffect(() => {
    // This effect runs when the iframe is remounted due to a key change.
    // It's responsible for cleaning up the old thread from the previous render.
    const threadToCleanUp = threadRef.current;

    // We must reset the ref for the new render cycle *before* the new iframe's
    // onLoad can fire.
    threadRef.current = null;

    return () => {
      // This cleanup function will be called when the component unmounts
      // or before the effect runs again, ensuring the old thread is closed.
      threadToCleanUp?.close();
    };
  }, [componentKey]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    
    if (!iframe || threadRef.current) {
      return;
    }

    const thread = new ThreadIframe<SandboxAPI>(iframe);
    threadRef.current = thread;

    if (resource.content && typeof resource.content === 'string' && receiver?.connection) {
        const options = {
        code: resource.content,
        remoteElements,
        useReactRenderer: flavor === 'react',
        componentLibrary: library?.name,
      };
      thread.imports
        .render(options, receiver.connection)
        .catch((error: Error) => console.error('Error calling remote render:', error));
    }
  };
  
  return (
    <>
      <iframe
        key={componentKey}
        ref={iframeRef}
        srcDoc={IFRAME_SRC_DOC}
        sandbox="allow-scripts"
        style={{ display: 'none' }}
        title="Remote DOM Sandbox"
        onLoad={handleIframeLoad}
      />
      
      {flavor === 'react' && components ? (
        <RemoteRootRenderer receiver={receiver as RemoteReceiver} components={components} />
      ) : (
        <RemoteDomRenderer receiver={receiver as DOMRemoteReceiver} />
      )}
    </>
  );
}; 