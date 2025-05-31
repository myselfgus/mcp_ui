export type ResourceContentPayload =
  | { type: 'rawHtml'; htmlString: string }
  | { type: 'externalUrl'; iframeUrl: string };

export interface CreateHtmlResourceOptions {
  uri: string; // REQUIRED. Must start with "ui://" if content.type is "rawHtml",
  // or "ui-app://" if content.type is "externalUrl".
  content: ResourceContentPayload; // REQUIRED. The actual content payload.
  delivery: 'text' | 'blob'; // REQUIRED. How the content string (htmlString or iframeUrl) should be packaged.
}

export type UiActionType = 'tool' | 'prompt' | 'link' | 'intent' | 'notification';

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
