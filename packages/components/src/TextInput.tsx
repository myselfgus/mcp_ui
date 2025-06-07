import React from 'react';

/**
 * Props for the `TextInput` component.
 */
export interface TextInputProps {
  /** The name of the input field, used for form submission and identification. */
  name: string;
  /** The human-readable label displayed for the input field. */
  label: string;
  /** The current value of the input field. */
  value?: string;
  /**
   * Callback function invoked when the value of the input field changes.
   * @param name - The name of the input field.
   * @param value - The new value of the input field.
   */
  onChange?: (name: string, value: string) => void;
  /** Placeholder text to display when the input field is empty. */
  placeholder?: string;
  /** Whether the input field is required. */
  required?: boolean;
  // TODO: Add props for multiline/textarea if this component is to support it.
}

/**
 * A React functional component that renders a standard HTML text input field
 * with a label. It supports common input properties like name, value, placeholder,
 * and required status, along with an onChange handler.
 *
 * @param props - The properties for the TextInput component.
 * @returns A JSX element representing the text input field and its label.
 */
export const TextInput: React.FC<TextInputProps> = ({ name, label, value, onChange, placeholder, required }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(name, event.target.value);
  };
  return (
    <div>
      <label htmlFor={name}>{label}:</label>
      <input
        type="text"
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};
