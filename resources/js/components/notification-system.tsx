import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Bell, 
    CheckCircle, 
    AlertCircle, 
    Info, 
    X, 
    Clock, 
    TrendingUp,
    FileText,
    User,
    Settings,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        onClick: () => void;
    };
    category?: 'grievance' | 'system' | 'user' | 'admin';
}

interface NotificationSystemProps {
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClearAll: () => void;
}

export default function NotificationSystem({
    notifications,
    onMarkAsRead,
    onDelete,
    onMarkAllAsRead,
    onClearAll
}: NotificationSystemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'grievance' | 'system'>('all');
    const [showSettings, setShowSettings] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'border-green-200 bg-green-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            case 'warning':
                return 'border-yellow-200 bg-yellow-50';
            case 'info':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const getCategoryIcon = (category?: string) => {
        switch (category) {
            case 'grievance':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'system':
                return <Settings className="h-4 w-4 text-gray-500" />;
            case 'user':
                return <User className="h-4 w-4 text-green-500" />;
            case 'admin':
                return <TrendingUp className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'grievance') return notification.category === 'grievance';
        if (filter === 'system') return notification.category === 'system';
        return true;
    });

    const formatTimeAgo = (timestamp: Date) => {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50"
                    >
                        <Card className="border-0 shadow-none">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-semibold text-gray-900">
                                        Notifications
                                    </CardTitle>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowSettings(!showSettings)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onMarkAllAsRead}
                                                className="text-blue-600 hover:text-blue-700 text-sm"
                                            >
                                                Mark all read
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex space-x-1 mt-3">
                                    {[
                                        { key: 'all', label: 'All', count: notifications.length },
                                        { key: 'unread', label: 'Unread', count: unreadCount },
                                        { key: 'grievance', label: 'Grievances', count: notifications.filter(n => n.category === 'grievance').length },
                                        { key: 'system', label: 'System', count: notifications.filter(n => n.category === 'system').length }
                                    ].map((tab) => (
                                        <Button
                                            key={tab.key}
                                            variant={filter === tab.key ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setFilter(tab.key as any)}
                                            className={`text-xs px-3 py-1 ${
                                                filter === tab.key 
                                                    ? 'bg-[#3A4F24] text-white' 
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {tab.label}
                                            {tab.count > 0 && (
                                                <Badge variant="secondary" className="ml-1 text-xs">
                                                    {tab.count}
                                                </Badge>
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <div className="max-h-96 overflow-y-auto">
                                    {filteredNotifications.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-sm">No notifications</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {filteredNotifications.map((notification) => (
                                                <motion.div
                                                    key={notification.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                                                        !notification.read ? 'bg-white' : 'bg-gray-50'
                                                    } hover:bg-gray-50 transition-colors`}
                                                >
                                                    <div className="flex items-start space-x-3">
                                                        <div className="flex-shrink-0 mt-1">
                                                            {getNotificationIcon(notification.type)}
                                                        </div>
                                                        
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <p className={`text-sm font-medium ${
                                                                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                                                                    }`}>
                                                                        {notification.title}
                                                                    </p>
                                                                    {notification.category && (
                                                                        <div className="flex items-center space-x-1">
                                                                            {getCategoryIcon(notification.category)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <span className="text-xs text-gray-500">
                                                                        {formatTimeAgo(notification.timestamp)}
                                                                    </span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => onDelete(notification.id)}
                                                                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {notification.message}
                                                            </p>
                                                            
                                                            {notification.action && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={notification.action.onClick}
                                                                    className="mt-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
                                                                >
                                                                    {notification.action.label}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {!notification.read && (
                                                        <div className="mt-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onMarkAsRead(notification.id)}
                                                                className="text-xs text-gray-500 hover:text-gray-700"
                                                            >
                                                                Mark as read
                                                            </Button>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {notifications.length > 0 && (
                                    <div className="border-t p-3 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={onClearAll}
                                                className="text-xs text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Clear all
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50"
                    >
                        <Card className="border-0 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    Notification Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                                        <Button variant="outline" size="sm">Enabled</Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                                        <Button variant="outline" size="sm">Enabled</Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Sound Alerts</span>
                                        <Button variant="outline" size="sm">Disabled</Button>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Types</h4>
                                    <div className="space-y-2">
                                        {['Grievance Updates', 'System Alerts', 'User Activity', 'Admin Actions'].map((type) => (
                                            <div key={type} className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">{type}</span>
                                                <Button variant="outline" size="sm" className="text-xs">On</Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 