import React from 'react';

type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange
}: CheckboxProps) => {
  return (
    <div
      className="checkbox"
      style={{
        margin: 0,
        display: 'flex',
        gap: 5,
        alignItems: 'center'
      }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={() => (onChange ? onChange() : null)}
        style={{ width: 20, margin: 0, padding: 0 }}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default Checkbox;
