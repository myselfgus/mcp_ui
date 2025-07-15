import { RemoteReceiver } from '@remote-dom/core/receivers';
import React from 'react';

export type UIActionType = 'tool' | 'prompt' | 'link' | 'intent' | 'notification' | 'request-info';

export const ALL_RESOURCE_CONTENT_TYPES = ['rawHtml', 'externalUrl', 'remoteDom'] as const;
export type ResourceContentType = (typeof ALL_RESOURCE_CONTENT_TYPES)[number];

export type UIActionResultToolCall = {
  type: 'tool';
  payload: {
    toolName: string;
    params: Record<string, unknown>;
  };
};

export type UIActionResultPrompt = {
  type: 'prompt';
  payload: {
    prompt: string;
  };
};

export type UIActionResultLink = {
  type: 'link';
  payload: {
    url: string;
  };
};

export type UIActionResultIntent = {
  type: 'intent';
  payload: {
    intent: string;
    params: Record<string, unknown>;
  };
};

export type UIActionResultNotification = {
  type: 'notification';
  payload: {
    message: string;
  };
};

export type UIActionResultRequestInfo = {
  type: 'request-info';
  payload: {
    requestId: string;
    requestContext: string;
    params?: Record<string, unknown>;
  };
};

export type UIActionResult =
  | UIActionResultToolCall
  | UIActionResultPrompt
  | UIActionResultLink
  | UIActionResultIntent
  | UIActionResultNotification
  | UIActionResultRequestInfo;

/**
 * This is the API that the remote environment (iframe) exports to the host.
 * The host can call these methods on the thread.
 */
export interface SandboxAPI {
  render: (options: RenderOptions, receiver: RemoteReceiver) => void | Promise<void>;
}

export interface RemoteElementConfiguration {
  tagName: string;
  remoteAttributes?: string[];
  remoteEvents?: string[];
}
export interface RenderOptions {
  code: string;
  componentLibrary?: string;
  useReactRenderer?: boolean;
  remoteElements?: RemoteElementConfiguration[];
}

export interface ComponentLibraryElement {
  tagName: string;
  component: React.ComponentType<Record<string, unknown>>;
  propMapping?: Record<string, string>;
  eventMapping?: Record<string, string>;
}

export interface ComponentLibrary {
  name: string;
  elements: ComponentLibraryElement[];
}
