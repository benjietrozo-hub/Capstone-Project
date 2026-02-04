import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FormField, Button, Alert } from '../components/common/FormElements';
import { validateEmail, validatePassword, validateUsername } from '../utils/validators';
import toast from 'react-hot-toast';

interface FormData {
  employee_id: string;
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  full_name: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  department: string;
  phone: string;
}

interface FormErrors {
  [key: string]: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { teacherRegister } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    employee_id: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    full_name: '',
    first_name: '',
    middle_initial: '',
    last_name: '',
    department: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = 'Employee ID is required';
    }
    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await teacherRegister(formData);
      toast.success('Registration successful!');
      navigate('/teacher');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1C2536',
        borderRadius: '15px',
        boxShadow: '0 20px 60px rgba(28, 37, 54, 0.3)',
        maxWidth: '1000px',
        width: '100%',
        padding: '0',
        border: 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #5B8DEF 0%, #0063F7 100%)',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '10px'
          }}>Create Account</h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1rem'
          }}>Teacher Registration</p>
        </div>

        <div style={{ padding: '40px' }}>
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <FormField
                label="Employee ID"
                value={formData.employee_id}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Enter employee ID"
                error={errors.employee_id}
                required
              />

              <FormField
                label="Username"
                value={formData.username}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Choose a username"
                error={errors.username}
                required
              />

              <FormField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Enter your email"
                error={errors.email}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <FormField
                label="First Name"
                value={formData.first_name}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="First name"
              />

              <FormField
                label="M.I."
                value={formData.middle_initial}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="M"
              />

              <FormField
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Last name"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <FormField
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Min 8 characters"
                error={errors.password}
                required
              />

              <FormField
                label="Confirm Password"
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Confirm password"
                error={errors.password_confirmation}
                required
              />

              <FormField
                label="Department"
                value={formData.department}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                placeholder="Department (optional)"
              />
            </div>

            <FormField
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
              placeholder="Enter your phone number (optional)"
            />

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #5B8DEF 0%, #0063F7 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(91, 141, 239, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              Register
            </Button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '20px',
            color: '#9CA3AF'
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#5B8DEF',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'color 0.2s ease'
            }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
