import React from 'react';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { ResourceContentType } from '../types';
import { HtmlResource, RenderHtmlResourceProps } from './HtmlResource';
import { RemoteDomResource, RemoteDomResourceProps } from './RemoteDomResource';
import { basicComponentLibrary } from '../remote-dom/component-libraries/basic';

type ResourceRendererProps = Omit<
  RenderHtmlResourceProps & RemoteDomResourceProps,
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

export const ResourceRenderer: React.FC<ResourceRendererProps> = (props) => {
  const {
    resource,
    onUiAction,
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
        <HtmlResource
          resource={resource}
          onUiAction={onUiAction}
          style={style}
          iframeProps={iframeProps}
        />
      );
    case 'remoteDom':
      return (
        <RemoteDomResource
          resource={resource}
          onUiAction={onUiAction}
          library={library || basicComponentLibrary}
          remoteElements={remoteElements}
        />
      );
    default:
      return <p className="text-red-500">Unsupported resource type.</p>;
  }
};
