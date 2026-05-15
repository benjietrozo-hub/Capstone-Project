import React, { ReactNode, CSSProperties, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormFieldProps {
  label: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  rows?: number;
  min?: string;
  max?: string;
  step?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  options = null,
  rows = null,
  min,
  max,
  step,
}: FormFieldProps) {
  if (type === 'select') {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
            error ? 'border-red-600' : 'border-gray-300'
          }`}
          onFocus={(e) => {
            e.target.style.borderColor = '#2d7a3e';
            e.target.style.boxShadow = '0 0 0 0.2rem rgba(45, 122, 62, 0.25)';
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows || 4}
          className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 ${
            error ? 'border-red-600' : 'border-gray-300'
          }`}
          onFocus={(e) => {
            e.target.style.borderColor = '#2d7a3e';
            e.target.style.boxShadow = '0 0 0 0.2rem rgba(45, 122, 62, 0.25)';
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }
          }}
        />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  const [showPassword, setShowPassword] = useState(false);

  if (type === 'password') {
    return (
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 pr-10 ${
              error ? 'border-red-600' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-semibold mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${
          error ? 'border-red-600' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  style = {},
}: ButtonProps) {
  const baseClass = 'px-6 py-2 rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClass: Record<string, string> = {
    primary: 'text-white hover:bg-green-700',
    secondary: 'bg-gray-300 text-gray-800 hover:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  const variantStyle: Record<string, CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, #2d7a3e 0%, #1e5a2e 100%)',
      border: 'none',
    },
    secondary: {},
    danger: {},
    success: {},
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClass[variant]} ${className}`}
      style={{ ...variantStyle[variant], ...style }}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
}

export function Alert({ type = 'info', message, onClose }: AlertProps) {
  const typeClass: Record<string, string> = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    error: 'bg-red-100 border-red-500 text-red-700',
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${typeClass[type]}`} role="alert">
      <p className="font-bold">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </p>
      <p>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-2 text-sm font-semibold hover:underline"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
