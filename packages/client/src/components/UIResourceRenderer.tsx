import React from 'react';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { ResourceContentType } from '../types';
import { HTMLResourceRenderer, HTMLResourceRendererProps } from './HTMLResourceRenderer';
import { RemoteDOMResourceProps, RemoteDOMResourceRenderer } from './RemoteDOMResourceRenderer';
import { basicComponentLibrary } from '../remote-dom/component-libraries/basic';

type UIResourceRendererProps = Omit<
  HTMLResourceRendererProps & RemoteDOMResourceProps,
  'resource'
> & {
  resource: Partial<Resource>;
  supportedContentTypes?: ResourceContentType[];
};

function getContentType(
  resource: Partial<Resource>,
): ResourceContentType | undefined {
  if (resource.contentType) {
    return resource.contentType as ResourceContentType;
  }

  if (resource.mimeType === 'text/html') {
    return 'rawHtml';
  }
  if (resource.mimeType === 'text/uri-list') {
    return 'externalUrl';
  }
  if (resource.mimeType?.startsWith('application/vnd.mcp-ui.remote-dom')) {
    return 'remoteDom';
  }
}

export const UIResourceRenderer: React.FC<UIResourceRendererProps> = (props) => {
  const {
    resource,
    onUIAction,
    style,
    iframeProps,
    supportedContentTypes,
    library,
    remoteElements,
  } = props;
  const contentType = getContentType(resource);

  if (
    supportedContentTypes &&
    contentType &&
    !supportedContentTypes.includes(contentType)
  ) {
    return (
      <p className="text-red-500">Unsupported content type: {contentType}.</p>
    );
  }

  switch (contentType) {
    case 'rawHtml':
    case 'externalUrl':
      return (
        <HTMLResourceRenderer
          resource={resource}
          onUIAction={onUIAction}
          style={style}
          iframeProps={iframeProps}
        />
      );
    case 'remoteDom':
      return (
        <RemoteDOMResourceRenderer
          resource={resource}
          onUIAction={onUIAction}
          library={library || basicComponentLibrary}
          remoteElements={remoteElements}
        />
      );
    default:
      return <p className="text-red-500">Unsupported resource type.</p>;
  }
};
