export type UiActionType = 'tool' | 'prompt' | 'link';

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

export type UiActionResult =
  | UiActionResultToolCall
  | UiActionResultPrompt
  | UiActionResultLink;
