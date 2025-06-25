import React from 'react';
import { createRemoteComponentRenderer } from '@remote-dom/react/host';

// A basic 'stack' layout component
const Stack = createRemoteComponentRenderer<{ children?: React.ReactNode }>(
  ({ children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {children}
    </div>
  ),
);

// A basic 'text' component
const Text = createRemoteComponentRenderer<{ content?: string }>(
  ({ content }) => <p>{content}</p>,
);

// A basic 'button' component
const Button = createRemoteComponentRenderer<{
  label?: string;
  onPress?: () => void;
}>(({ label, onPress }) => (
  <button onClick={onPress}>{label}</button>
));

// A basic 'input' component
const Input = createRemoteComponentRenderer<
  React.InputHTMLAttributes<HTMLInputElement>
>((props) => <input {...props} />);

export const remoteComponentMap = new Map([
  ['ui-stack', Stack],
  ['ui-text', Text],
  ['ui-button', Button],
  ['ui-input', Input],
]); 