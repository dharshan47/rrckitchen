"use client";

import { useState, useCallback, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  children?: (props: {
    value: string;
    onChange: (value: string) => void;
    error?: string;
  }) => ReactNode;
}

export function ControlledFormField({
  name,
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function UncontrolledFormField({
  name,
  label,
  defaultValue = "",
  placeholder,
  required,
  error,
  children,
}: FormFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const handleChange = useCallback((v: string) => setValue(v), []);

  if (children) {
    return (
      <div className="grid gap-2">
        <Label htmlFor={name}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
        {children({ value, onChange: handleChange, error })}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <ControlledFormField
      name={name}
      label={label}
      value={value}
      onChange={handleChange}
      error={error}
      placeholder={placeholder}
      required={required}
    />
  );
}

interface FormProps {
  onSubmit: (data: Record<string, string>) => void;
  children: ReactNode;
  className?: string;
}

export function CrudForm({ onSubmit, children, className }: FormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const data: Record<string, string> = {};
      const newErrors: Record<string, string> = {};
      formData.forEach((value, key) => {
        data[key] = value.toString();
        if (!value.toString().trim()) {
          newErrors[key] = `${key} is required`;
        }
      });
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      onSubmit(data);
    },
    [onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {children}
    </form>
  );
}
