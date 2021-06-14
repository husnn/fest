import React from 'react';

type FormInputProps = {
  label?: string;
  children: React.ReactNode;
  description?: string;
  optional?: boolean;
  error?: string;
};

export const FormInput: React.FC<FormInputProps> = ({
  label,
  children,
  description,
  optional,
  error
}: FormInputProps) => {
  return (
    <div className="form-input" style={{ textAlign: 'left' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}
      >
        {label ? <label>{label}</label> : null}
        {optional ? (
          <label style={{ opacity: 0.5, fontSize: '9pt' }}>Optional</label>
        ) : null}
      </div>
      {children}
      {error ? (
        <p style={{ marginTop: 10, color: 'red', fontSize: '9pt' }}>{error}</p>
      ) : (
        description && (
          <p style={{ marginTop: 10, fontSize: '9pt' }}>{description}</p>
        )
      )}
    </div>
  );
};

export default FormInput;
