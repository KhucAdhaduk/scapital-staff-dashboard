'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, clearError } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Password Rules
    const passwordRules = [
        { label: 'Minimum 8 characters', valid: formData.password.length >= 8 },
        { label: 'At least 1 uppercase letter', valid: /[A-Z]/.test(formData.password) },
        { label: 'At least 1 number', valid: /[0-9]/.test(formData.password) },
        { label: 'At least 1 special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
    ];

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
        return () => {
            dispatch(clearError());
        };
    }, [isAuthenticated, router, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear specific error on change
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const errors: Record<string, string> = {};

        // Name
        if (!formData.name.trim()) {
            errors.name = 'Full name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
            errors.name = 'Name must contain letters only';
        }

        // Email
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email address';
        }

        // Password
        const isPasswordStrong = passwordRules.every(r => r.valid);
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (!isPasswordStrong) {
            errors.password = 'Password does not meet requirements';
        }

        // Confirm Password
        if (formData.confirmPassword !== formData.password) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({
            name: true,
            email: true,
            password: true,
            confirmPassword: true
        });

        if (validate()) {
            await dispatch(register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            }));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us to manage your dashboard
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
                                error={touched.name && validationErrors.name ? validationErrors.name : undefined}
                                className={touched.name && !validationErrors.name ? 'border-green-500 focus:ring-green-500' : ''}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                label="Email Address"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                                error={touched.email && validationErrors.email ? validationErrors.email : undefined}
                                className={touched.email && !validationErrors.email ? 'border-green-500 focus:ring-green-500' : ''}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                                error={touched.password && validationErrors.password ? validationErrors.password : undefined}
                                rightIcon={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                onRightIconClick={() => setShowPassword(!showPassword)}
                            />

                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="mt-2 space-y-1 rounded-md bg-gray-50 p-2 text-xs">
                                    <p className="font-medium text-gray-700 mb-1">Password Strength:</p>
                                    {passwordRules.map((rule, idx) => (
                                        <div key={idx} className={`flex items-center gap-2 ${rule.valid ? 'text-green-600' : 'text-gray-400'}`}>
                                            {rule.valid ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />}
                                            <span>{rule.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                label="Confirm Password"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                                error={touched.confirmPassword && validationErrors.confirmPassword ? validationErrors.confirmPassword : undefined}
                                className={
                                    touched.confirmPassword &&
                                        !validationErrors.confirmPassword &&
                                        formData.confirmPassword
                                        ? 'border-green-500 focus:ring-green-500'
                                        : ''
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            fullWidth
                            isLoading={loading}
                            disabled={loading || (Object.keys(validationErrors).length > 0 && Object.keys(touched).length > 0)}
                        >
                            Sign Up
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
