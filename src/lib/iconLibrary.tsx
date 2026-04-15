import {
    // Finance & Money
    DollarSign, CreditCard, Wallet, Banknote, Coins, PiggyBank, Landmark, Percent, Receipt, TrendingUp, TrendingDown,
    ChartBar, ChartPie, Calculator, Gem, Gift, Tag, ShoppingBag, ShoppingCart, 
    
    // Business & Office
    Briefcase, Building, Building2, Store, Factory, Warehouse, Printer, Archive, Clipboard, ClipboardList, 
    FileText, FileCheck, FileSpreadsheet, Folder, FolderOpen, Projector, Presentation, Users, User, UserPlus, 
    UserCheck, UserCog, UserCircle, BriefcaseMedical, Stethoscope, 
    
    // Properties & Assets
    Home, Key, Lock, Shield, ShieldCheck, ShieldAlert, Car, Bike, Truck, Plane, Ship, Anchor, Map, MapPin, 
    Navigation, Compass,

    // Time & Planning
    Clock, Calendar, CalendarCheck, CalendarDays, Timer, Hourglass, History, AlarmClock,
    
    // Communication & Tech
    Phone, Smartphone, Tablet, Laptop, Monitor, Wifi, Signal, Globe, Mail, MessageSquare, MessageCircle, 
    Send, Bell, BellRing, Share2, Link, Link2, Search, Sliders, Settings, Settings2, Wrench, Hammer, 
    Cpu, Database, Server, Cloud, Zap, Battery, Bluetooth, Power,

    // UI & Omni
    Check, CheckCircle, X, XCircle, Plus, PlusCircle, Minus, MinusCircle, AlertCircle, AlertTriangle, 
    Info, HelpCircle, Star, ThumbsUp, ThumbsDown, Heart, Eye, EyeOff, Menu, Grid, List, Filter, SortAsc, 
    SortDesc, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, RefreshCw, Upload, Download, Trash, Edit, 
    Copy, ExternalLink, MoreHorizontal, MoreVertical, Loader2,

    // Misc / Education
    GraduationCap, Book, BookOpen, Library, Lightbulb, Trophy, Award, Medal, Crown, Target, Flag, 
    Umbrella, Sun, Moon, CloudRain, Wind, Flame, Droplet, Hammer as HammerIcon, Gavel
} from 'lucide-react';

export const iconMap: Record<string, any> = {
    // Finance
    'dollar-sign': DollarSign, 'credit-card': CreditCard, 'wallet': Wallet, 'banknote': Banknote, 'coins': Coins,
    'piggy-bank': PiggyBank, 'landmark': Landmark, 'percent': Percent, 'receipt': Receipt, 'trending-up': TrendingUp,
    'trending-down': TrendingDown, 'chart-bar': ChartBar, 'chart-pie': ChartPie, 'calculator': Calculator, 'gem': Gem,
    'gift': Gift, 'tag': Tag, 'shopping-bag': ShoppingBag, 'shopping-cart': ShoppingCart,

    // Business
    'briefcase': Briefcase, 'building': Building, 'building-2': Building2, 'store': Store, 'factory': Factory,
    'warehouse': Warehouse, 'printer': Printer, 'archive': Archive, 'clipboard': Clipboard, 'clipboard-list': ClipboardList,
    'file-text': FileText, 'file-check': FileCheck, 'file-spreadsheet': FileSpreadsheet, 'folder': Folder, 'folder-open': FolderOpen,
    'projector': Projector, 'presentation': Presentation, 'users': Users, 'user': User, 'user-plus': UserPlus,
    'user-check': UserCheck, 'user-cog': UserCog, 'user-circle': UserCircle, 'briefcase-medical': BriefcaseMedical, 'stethoscope': Stethoscope,

    // Properties
    'home': Home, 'key': Key, 'lock': Lock, 'shield': Shield, 'shield-check': ShieldCheck, 'shield-alert': ShieldAlert,
    'car': Car, 'bike': Bike, 'truck': Truck, 'plane': Plane, 'ship': Ship, 'anchor': Anchor, 'map': Map, 'map-pin': MapPin,
    'navigation': Navigation, 'compass': Compass,

    // Time
    'clock': Clock, 'calendar': Calendar, 'calendar-check': CalendarCheck, 'calendar-days': CalendarDays, 'timer': Timer,
    'hourglass': Hourglass, 'history': History, 'alarm-clock': AlarmClock,

    // Communication
    'phone': Phone, 'smartphone': Smartphone, 'tablet': Tablet, 'laptop': Laptop, 'monitor': Monitor, 'wifi': Wifi,
    'signal': Signal, 'globe': Globe, 'mail': Mail, 'message-square': MessageSquare, 'message-circle': MessageCircle,
    'send': Send, 'bell': Bell, 'bell-ring': BellRing, 'share-2': Share2, 'link': Link, 'link-2': Link2, 'search': Search,
    'sliders': Sliders, 'settings': Settings, 'settings-2': Settings2, 'wrench': Wrench, 'hammer': Hammer, 
    'cpu': Cpu, 'database': Database, 'server': Server, 'cloud': Cloud, 'zap': Zap, 'battery': Battery, 'bluetooth': Bluetooth, 'power': Power,

    // UI
    'check': Check, 'check-circle': CheckCircle, 'x': X, 'x-circle': XCircle, 'plus': Plus, 'plus-circle': PlusCircle,
    'minus': Minus, 'minus-circle': MinusCircle, 'alert-circle': AlertCircle, 'alert-triangle': AlertTriangle,
    'info': Info, 'help-circle': HelpCircle, 'star': Star, 'thumbs-up': ThumbsUp, 'thumbs-down': ThumbsDown,
    'heart': Heart, 'eye': Eye, 'eye-off': EyeOff, 'menu': Menu, 'grid': Grid, 'list': List, 'filter': Filter,
    'sort-asc': SortAsc, 'sort-desc': SortDesc, 'chevron-right': ChevronRight, 'chevron-left': ChevronLeft,
    'arrow-right': ArrowRight, 'arrow-left': ArrowLeft, 'refresh-cw': RefreshCw, 'upload': Upload, 'download': Download,
    'trash': Trash, 'edit': Edit, 'copy': Copy, 'external-link': ExternalLink, 'more-horizontal': MoreHorizontal,
    'more-vertical': MoreVertical, 'loader-2': Loader2,

    // Misc
    'graduation-cap': GraduationCap, 'book': Book, 'book-open': BookOpen, 'library': Library, 'lightbulb': Lightbulb,
    'trophy': Trophy, 'award': Award, 'medal': Medal, 'crown': Crown, 'target': Target, 'flag': Flag,
    'umbrella': Umbrella, 'sun': Sun, 'moon': Moon, 'cloud-rain': CloudRain, 'wind': Wind, 'flame': Flame,
    'droplet': Droplet, 'gavel': Gavel
};

export const iconList = Object.entries(iconMap).map(([name, Icon]) => ({
    name,
    icon: Icon
}));
