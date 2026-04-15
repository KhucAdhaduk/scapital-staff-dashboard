import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { iconList, iconMap } from '@/lib/iconLibrary';
import { Input } from './Input';

interface IconSelectorProps {
    value?: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    position?: 'top' | 'bottom';
}

export function IconSelector({ value, onChange, label = "Select Icon", error, position }: IconSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const filteredIcons = useMemo(() => {
        if (!searchQuery) return iconList;
        const lowerQ = searchQuery.toLowerCase();
        return iconList.filter(item => item.name.toLowerCase().includes(lowerQ));
    }, [searchQuery]);

    // Check available space when opening
    React.useEffect(() => {
        if (position) {
            setDropUp(position === 'top');
            return;
        }

        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = 350; // Approximated max height + padding
            setDropUp(spaceBelow < dropdownHeight);
        }
    }, [isOpen, position]);

    // Get current icon component for display
    const SelectedIcon = value ? iconMap[value] : null;

    return (
        <div className="space-y-2" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            {/* Selector Trigger */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between p-3 bg-white border rounded-lg text-left transition-all ${error
                        ? 'border-red-300 ring-red-200'
                        : isOpen
                            ? 'border-teal-500 ring-4 ring-teal-500/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        {SelectedIcon ? (
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-md">
                                <SelectedIcon size={20} />
                            </div>
                        ) : (
                            <div className="p-2 bg-gray-100 text-gray-400 rounded-md">
                                <Search size={20} />
                            </div>
                        )}
                        <span className={`text-sm ${value ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {value || "Search and select an icon..."}
                        </span>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {isOpen && (
                    <div
                        className={`absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}
                    >
                        {/* Search Header */}
                        <div className="p-3 border-b border-gray-100 bg-gray-50 sticky top-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search 150+ icons..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 bg-white"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Icons Grid */}
                        <div className="p-3 max-h-[300px] overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {filteredIcons.map((item) => {
                                const Icon = item.icon;
                                const isSelected = value === item.name;
                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => {
                                            onChange(item.name);
                                            setIsOpen(false);
                                        }}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all hover:scale-105 ${isSelected
                                            ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm'
                                            : 'border-transparent hover:bg-gray-50 text-gray-600 hover:border-gray-200'
                                            }`}
                                        title={item.name}
                                    >
                                        <Icon size={24} strokeWidth={1.5} />
                                    </button>
                                );
                            })}

                            {filteredIcons.length === 0 && (
                                <div className="col-span-full py-8 text-center text-gray-500 text-sm">
                                    No icons found for "{searchQuery}"
                                </div>
                            )}
                        </div>

                        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
                            Showing {filteredIcons.length} icons
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
}
