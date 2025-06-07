import React from 'react';

/**
 * Props for the `NumberInput` component.
 */
export interface NumberInputProps {
  /** The name of the input field, used for form submission and identification. */
  name: string;
  /** The human-readable label displayed for the input field. */
  label: string;
  /** The current numerical value of the input field. */
  value?: number;
  /**
   * Callback function invoked when the value of the input field changes.
   * @param name - The name of the input field.
   * @param value - The new numerical value, or `undefined` if the input is not a valid number.
   */
  onChange?: (name: string, value: number | undefined) => void;
  /** Placeholder text to display when the input field is empty. */
  placeholder?: string;
  /** Whether the input field is required. */
  required?: boolean;
}

/**
 * A React functional component that renders an HTML input field of type "number"
 * with a label. It handles parsing the numeric value and provides an `onChange`
 * callback with the number or `undefined` if parsing fails.
 *
 * @param props - The properties for the NumberInput component.
 * @returns A JSX element representing the number input field and its label.
 */
export const NumberInput: React.FC<NumberInputProps> = ({ name, label, value, onChange, placeholder, required }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = event.target.valueAsNumber;
    onChange?.(name, isNaN(numValue) ? undefined : numValue);
  };
  return (
    <div>
      <label htmlFor={name}>{label}:</label>
      <input
        type="number"
        id={name}
        name={name}
        value={value === undefined ? '' : value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};
