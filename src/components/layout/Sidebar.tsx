'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, LogOut, ChevronLeft, ChevronRight, PhoneForwarded, UserCheck, FileText, Building } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const router = useRouter();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = async () => {
        await dispatch(logout());
        router.push('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
        { name: 'Loan Types', icon: FileText, href: '/dashboard/loan-types' },
        { name: 'Users', icon: Users, href: '/dashboard/users' },
        { name: 'Call Leads', icon: PhoneForwarded, href: '/dashboard/calls' },
        { name: 'Leads Management', icon: UserCheck, href: '/dashboard/leads' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    'fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={clsx(
                    'fixed inset-y-0 left-0 z-30 transform bg-white shadow-lg transition-all duration-300 lg:static lg:translate-x-0 flex flex-col h-full',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    isCollapsed ? 'w-20' : 'w-64'
                )}
            >
                <div className={clsx("flex h-20 flex-col justify-center border-b transition-all flex-shrink-0", isCollapsed ? "px-0 items-center" : "px-6")}>
                    {!isCollapsed && (
                        <>
                            {user?.branchName && (
                                <h1 className="text-xl font-bold text-primary truncate">{user.branchName} Staff</h1>
                            )}
                        </>
                    )}


                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'flex items-center rounded-lg py-3 text-sm font-medium transition-colors flex-shrink-0',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                                    isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
                                )}
                                onClick={() => onClose()}
                                title={isCollapsed ? item.name : undefined}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span className="truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={handleLogoutClick}
                        className={clsx(
                            "flex w-full items-center rounded-lg py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
                            isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                        )}
                        title={isCollapsed ? "Logout" : undefined}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                title="Sign out"
                message="Are you sure you want to sign out of your account?"
                confirmLabel="Sign out"
            />
        </>
    );
}
