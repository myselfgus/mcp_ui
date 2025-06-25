// The main component to render remote content
export { RemoteDomResource } from './components/RemoteDomResource';


// The types needed to create a custom component library
export type {
  ComponentLibrary,
  ComponentLibraryElement,
  RemoteElementConfiguration,
} from './types';

// Export the default libraries so hosts can register them if they choose
export { basicComponentLibrary } from './component-libraries/basic';

// --- Remote Element Extensibility ---
export {
  remoteCardDefinition,
  remoteButtonDefinition,
  remoteTextDefinition,
  remoteStackDefinition,
  remoteImageDefinition,
} from './remote-elements';

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
