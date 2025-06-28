import { RemoteReceiver } from '@remote-dom/core/receivers';

export type UiActionType =
  | 'tool'
  | 'prompt'
  | 'link'
  | 'intent'
  | 'notification';

export const ALL_RESOURCE_CONTENT_TYPES = [
  'rawHtml',
  'externalUrl',
  'remoteDom',
] as const;
export type ResourceContentType = (typeof ALL_RESOURCE_CONTENT_TYPES)[number];

export type UiActionResultToolCall = {
  type: 'tool';
  payload: {
    toolName: string;
    params: Record<string, unknown>;
  };
};

export type UiActionResultPrompt = {
  type: 'prompt';
  payload: {
    prompt: string;
  };
};

export type UiActionResultLink = {
  type: 'link';
  payload: {
    url: string;
  };
};

export type UiActionResultIntent = {
  type: 'intent';
  payload: {
    intent: string;
    params: Record<string, unknown>;
  };
};

export type UiActionResultNotification = {
  type: 'notification';
  payload: {
    message: string;
  };
};

export type UiActionResult =
  | UiActionResultToolCall
  | UiActionResultPrompt
  | UiActionResultLink
  | UiActionResultIntent
  | UiActionResultNotification;

/**
 * This is the API that the remote environment (iframe) exports to the host.
 * The host can call these methods on the thread.
 */
export interface SandboxAPI {
  render: (
    options: RenderOptions,
    receiver: RemoteReceiver,
  ) => void | Promise<void>;
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
