'use client';

import React, { useEffect, useState } from 'react';
import { SocialLink, socialLinkService } from '@/services/socialLinkService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Facebook, Twitter, Linkedin, Instagram, Store } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ALLOWED_PLATFORMS = [
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { name: 'JustDial', icon: Store, color: 'text-orange-500' },
];

export default function SocialLinksPage() {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const data = await socialLinkService.getAll();
            setLinks(data);
        } catch (error) {
            toast.error('Failed to load social links');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (platform: string, url: string, isActive: boolean) => {
        try {
            await socialLinkService.create({ platform, url, isActive });
            toast.success(`${platform} link saved successfully`);
            fetchLinks();
        } catch (error) {
            console.error(error);
            toast.error(`Failed to save ${platform} link`);
        }
    };

    const getLinkForPlatform = (platform: string) => {
        const link = links.find((l) => l.platform === platform);
        return link ? { url: link.url, isActive: link.isActive } : { url: '', isActive: true };
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Social Links Management</h1>
                <p className="mt-1 text-sm text-gray-500">Manage your social media presence.</p>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="grid gap-6 md:grid-cols-2">
                {ALLOWED_PLATFORMS.map((platform) => {
                    const currentLink = getLinkForPlatform(platform.name);
                    return (
                        <SocialLinkCard
                            key={platform.name}
                            platform={platform}
                            initialData={currentLink}
                            onSave={handleSave}
                        />
                    )
                })}
            </div>
        </div>
    );
}

function SocialLinkCard({ platform, initialData, onSave }: {
    platform: { name: string, icon: any, color: string },
    initialData: { url: string, isActive: boolean },
    onSave: (platform: string, url: string, isActive: boolean) => Promise<void>
}) {
    const [url, setUrl] = useState(initialData.url);
    const [isActive, setIsActive] = useState(initialData.isActive);
    const [isDirty, setIsDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave(platform.name, url, isActive);
        setSaving(false);
        setIsDirty(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium flex items-center gap-2">
                    <platform.icon className={`h-5 w-5 ${platform.color}`} />
                    {platform.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <label htmlFor={`active-${platform.name}`} className="text-sm text-gray-600 cursor-pointer select-none">
                        {isActive ? 'Active' : 'Inactive'}
                    </label>
                    <input
                        type="checkbox"
                        id={`active-${platform.name}`}
                        checked={isActive}
                        onChange={(e) => {
                            setIsActive(e.target.checked);
                            setIsDirty(true);
                        }}
                        className="h-4 w-4 accent-primary"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <label className="text-sm font-medium" htmlFor={`url-${platform.name}`}>Profile URL</label>
                        <Input
                            id={`url-${platform.name}`}
                            placeholder={`https://${platform.name.toLowerCase()}.com/...`}
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setIsDirty(true);
                            }}
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={!isDirty || saving}
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
