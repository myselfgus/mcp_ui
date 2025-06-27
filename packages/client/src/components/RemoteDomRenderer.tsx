import React, { useEffect, useRef } from 'react';
import { DOMRemoteReceiver } from '@remote-dom/core/receivers';

export type RemoteDomRendererProps = {
  receiver: DOMRemoteReceiver;
};

export const RemoteDomRenderer: React.FC<RemoteDomRendererProps> = ({
  receiver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      receiver.connect(containerRef.current);

      return () => {
        receiver.disconnect();
      };
    }
  }, [receiver]);

  return <div ref={containerRef} data-testid="standard-dom-renderer-container" />;
}; 