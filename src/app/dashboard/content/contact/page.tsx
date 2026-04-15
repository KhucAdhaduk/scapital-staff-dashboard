"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
    ContactInfo,
    CreateContactInfoDto,
    contactInfoService,
} from '@/services/contactInfoService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader2, Phone, Mail, Clock, MapPin, Map } from 'lucide-react';

export default function ContactInfoPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [existingId, setExistingId] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CreateContactInfoDto>();

    useEffect(() => {
        fetchContactInfo();
    }, []);

    const fetchContactInfo = async () => {
        try {
            setLoading(true);
            const data = await contactInfoService.getActive();
            if (data) {
                setExistingId(data.id);
                setValue('phone', data.phone);
                setValue('email', data.email);
                setValue('workingHours', data.workingHours);
                setValue('address', data.address);
                setValue('mapUrl', data.mapUrl || '');
                setValue('isActive', data.isActive);
            }
        } catch (error) {
            console.error('Error fetching contact info:', error);
            toast.error('Failed to load contact info');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CreateContactInfoDto) => {
        try {
            setSubmitting(true);
            
            // Auto-extract src if user pastes full iframe tag
            if (data.mapUrl && data.mapUrl.includes('<iframe')) {
                const srcMatch = data.mapUrl.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    data.mapUrl = srcMatch[1];
                }
            }

            if (existingId) {
                await contactInfoService.update(existingId, data);
                toast.success('Contact Info updated successfully');
            } else {
                const newContact = await contactInfoService.create(data);
                setExistingId(newContact.id);
                toast.success('Contact Info created successfully');
            }
        } catch (error) {
            console.error('Error saving contact info:', error);
            toast.error('Failed to save contact info');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Contact Information</h1>
                <p className="mt-2 text-gray-600">
                    Manage the contact details displayed on the Help Center page.
                </p>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <Input
                            label="Phone Number"
                            leftIcon={<Phone className="h-4 w-4" />}
                            placeholder="+91 98XXX XXXXX"
                            error={errors.phone?.message}
                            {...register('phone', { required: 'Phone number is required' })}
                        />

                        <Input
                            label="Email Address"
                            leftIcon={<Mail className="h-4 w-4" />}
                            placeholder="SUPPORT@SCAPITAL.COM"
                            type="email"
                            error={errors.email?.message}
                            {...register('email', { required: 'Email is required' })}
                        />

                        <Input
                            label="Working Hours"
                            leftIcon={<Clock className="h-4 w-4" />}
                            placeholder="MON-SAT: 9:30 AM - 6:30 PM"
                            error={errors.workingHours?.message}
                            {...register('workingHours', { required: 'Working hours are required' })}
                        />

                        <Input
                            label="Address"
                            leftIcon={<MapPin className="h-4 w-4" />}
                            placeholder="AHMEDABAD"
                            error={errors.address?.message}
                            {...register('address', { required: 'Address is required' })}
                        />

                        <div className="space-y-2">
                            <Input
                                label="Google Maps Embed URL"
                                leftIcon={<Map className="h-4 w-4" />}
                                placeholder="https://www.google.com/maps/embed?..."
                                error={errors.mapUrl?.message}
                                {...register('mapUrl')}
                            />
                            <p className="text-xs text-gray-500">
                                Paste the 'Embed a map' HTML source URL (src attribute only) from Google Maps.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
