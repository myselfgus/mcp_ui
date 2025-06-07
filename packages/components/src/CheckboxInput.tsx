import React from 'react';

/**
 * Props for the `CheckboxInput` component.
 */
export interface CheckboxInputProps {
  /** The name of the input field, used for form submission and identification. */
  name: string;
  /** The human-readable label displayed next to the checkbox. */
  label: string;
  /** The current checked state of the checkbox. */
  checked?: boolean;
  /**
   * Callback function invoked when the checked state of the checkbox changes.
   * @param name - The name of the input field.
   * @param checked - The new checked state of the checkbox.
   */
  onChange?: (name: string, checked: boolean) => void;
  /** Whether the checkbox input is required. Note: HTML 'required' attribute on checkboxes has nuanced behavior. */
  required?: boolean;
}

/**
 * A React functional component that renders an HTML input field of type "checkbox"
 * with an associated label. It manages the checked state and provides an `onChange`
 * callback.
 *
 * @param props - The properties for the CheckboxInput component.
 * @returns A JSX element representing the checkbox input field and its label.
 */
export const CheckboxInput: React.FC<CheckboxInputProps> = ({ name, label, checked, onChange, required }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(name, event.target.checked);
  };
  return (
    <div>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={!!checked}
        onChange={handleChange}
        required={required}
      />
      <label htmlFor={name} style={{ marginLeft: '8px' }}>{label}</label>
    </div>
  );
};
