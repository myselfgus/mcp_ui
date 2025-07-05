export { UIResourceRenderer } from './components/UIResourceRenderer';

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
  UIActionResult,
  UIActionType,
  ResourceContentType,
  ALL_RESOURCE_CONTENT_TYPES,
  UIActionResultIntent,
  UIActionResultLink,
  UIActionResultNotification,
  UIActionResultPrompt,
  UIActionResultToolCall,
} from './types';
