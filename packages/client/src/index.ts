export { ResourceRenderer } from './components/ResourceRenderer';

// @deprecated - will be removed in the next major version (3.0.0)
export { HtmlResource } from './components/HtmlResource';
export { RemoteDomResource } from './components/RemoteDomResource';

// The types needed to create a custom component library
export type { RemoteElementConfiguration } from './types';

export type {
  ComponentLibrary,
  ComponentLibraryElement,
} from './remote-dom/types/componentLibrary';

// Export the default libraries so hosts can register them if they choose
export { basicComponentLibrary } from './remote-dom/component-libraries/basic';

// --- Remote Element Extensibility ---
export {
  remoteCardDefinition,
  remoteButtonDefinition,
  remoteTextDefinition,
  remoteStackDefinition,
  remoteImageDefinition,
} from './remote-dom/remote-elements';

export type {
  UiActionResult,
  UiActionType,
  ResourceContentType,
  ALL_RESOURCE_CONTENT_TYPES,
  UiActionResultIntent,
  UiActionResultLink,
  UiActionResultNotification,
  UiActionResultPrompt,
  UiActionResultToolCall,
} from './types';
