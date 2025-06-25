import React from 'react';

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

export interface ComponentLibraryRegistry {
  register(library: ComponentLibrary): void;
  get(name: string): ComponentLibrary | undefined;
  getDefault(): ComponentLibrary | undefined;
  getElementComponent(tagName: string, libraryName?: string): React.ComponentType<Record<string, unknown>> | undefined;
} 