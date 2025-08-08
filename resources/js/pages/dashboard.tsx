import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, Activity, Settings, Send, LogOut, Trash2, Ticket, CheckCircle, XCircle, RefreshCw, HelpCircle, Mail, ChevronRight, Download, Filter, Search, Plus, MoreHorizontal, Moon, Sun, Eye, Clock, TrendingUp, AlertCircle, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import EnhancedGrievanceForm from '@/components/enhanced-grievance-form';
import NotificationSystem from '@/components/notification-system';

export default function Dashboard() {
    const { student_id, total_submissions, grievances = [], captcha: initialCaptcha, user } = usePage().props as any;
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'submit' | 'submissions' | 'deleted' | 'help' | 'profile'>('submit');
    const [darkMode, setDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'success', message: 'Your grievance has been resolved', time: '2 hours ago' },
        { id: 2, type: 'info', message: 'New feature available: Draft saving', time: '1 day ago' }
    ]);

    const { data, setData, post, processing, errors, reset, delete: destroy } = useForm({
        subject: '',
        type: '',
        details: '',
        priority: 'normal',
    });
    const [viewModal, setViewModal] = useState<{ open: boolean; grievance: any | null }>({ open: false, grievance: null });
    const [profileData, setProfileData] = useState<{
        email: string;
        current_password: string;
        password: string;
        password_confirmation: string;
        captcha: string;
        alias: string;
    }>({
        email: user?.email || '',
        current_password: '',
        password: '',
        password_confirmation: '',
        captcha: '',
        alias: user?.alias || '',
    });
    const [profileErrors, setProfileErrors] = useState({
        email: '',
        current_password: '',
        password: '',
        password_confirmation: '',
        captcha: '',
        alias: '',
    });
    const [profileProcessing, setProfileProcessing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [captcha, setCaptcha] = useState(initialCaptcha);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    const [attachment, setAttachment] = useState<File | null>(null);
    const [deletedGrievances, setDeletedGrievances] = useState<any[]>([]);
    const [selectedGrievances, setSelectedGrievances] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Function to handle user activity
    const handleUserActivity = useCallback(() => {
        setLastActivity(Date.now());
    }, []);

    // Function to check for inactivity and logout
    const checkInactivity = useCallback(() => {
        const currentTime = Date.now();
        if (currentTime - lastActivity > INACTIVITY_TIMEOUT) {
            // Logout the user
            router.post(route('logout'), {}, {
                onSuccess: () => {
                    window.location.href = '/';
                }
            });
        }
    }, [lastActivity]);

    // Set up activity listeners
    useEffect(() => {
        // Add event listeners for user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, handleUserActivity);
        });

        // Set up interval to check for inactivity
        const inactivityInterval = setInterval(checkInactivity, 60000); // Check every minute

        // Cleanup function
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleUserActivity);
            });
            clearInterval(inactivityInterval);
        };
    }, [handleUserActivity, checkInactivity]);

    useEffect(() => {
        setCaptcha(initialCaptcha);
    }, [initialCaptcha]);

    const refreshCaptcha = () => {
        axios.get(route('profile.edit'))
            .then(response => {
                let newCaptcha = response.data.captcha;
                if (!newCaptcha) {
                    // Generate a random 6-character alphanumeric string
                    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    newCaptcha = Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                }
                setCaptcha(newCaptcha);
                setProfileData(prev => ({
                    ...prev,
                    captcha: ''
                }));
            })
            .catch(error => {
                // On error, also generate a random code
                const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const newCaptcha = Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                setCaptcha(newCaptcha);
                setProfileData(prev => ({
                    ...prev,
                    captcha: ''
                }));
                console.error('Error refreshing CAPTCHA:', error);
            });
    };

    // Live counts for statuses
    const underReviewCount = grievances.filter((g: any) => g.status === 'Under Review').length;
    const resolvedCount = grievances.filter((g: any) => g.status === 'Resolved').length;
    const archivedCount = grievances.filter((g: any) => g.status === 'Archived').length;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!data.subject || !data.details || !attachment) return;
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('subject', data.subject);
        formData.append('details', data.details);
        if (attachment) {
            formData.append('attachment', attachment);
        }
        router.post(route('grievances.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setAttachment(null);
                setShowForm(false);
            },
        });
    };

    const handleProfileDataChange = (field: keyof typeof profileData, value: string) => {
        setProfileData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowConfirmDialog(true);
    };

    const confirmProfileUpdate = () => {
        setProfileProcessing(true);
        axios.put(route('profile.update'), profileData)
            .then(() => {
                setProfileProcessing(false);
                setShowConfirmDialog(false);
                setProfileData(prev => ({
                    ...prev,
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                    captcha: ''
                }));
                // Refresh the page to get a new CAPTCHA
                window.location.reload();
            })
            .catch((error) => {
                setProfileProcessing(false);
                if (error.response?.data?.errors) {
                    setProfileErrors(error.response.data.errors);
                }
            });
    };

    // Fetch deleted grievances when the tab is selected
    useEffect(() => {
        if (activeTab === 'deleted') {
            axios.get(route('grievances.deleted')).then(res => {
                setDeletedGrievances(res.data.deletedGrievances || []);
            });
        }
    }, [activeTab]);

    // Bulk action functions
    const handleSelectAll = () => {
        if (selectedGrievances.length === grievances.length) {
            setSelectedGrievances([]);
        } else {
            setSelectedGrievances(grievances.map((g: any) => g.grievance_id));
        }
    };

    const handleSelectGrievance = (grievanceId: string) => {
        setSelectedGrievances(prev => 
            prev.includes(grievanceId) 
                ? prev.filter(id => id !== grievanceId)
                : [...prev, grievanceId]
        );
    };

    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedGrievances.length} selected grievances?`)) {
            selectedGrievances.forEach(grievanceId => {
                const grievance = grievances.find((g: any) => g.grievance_id === grievanceId);
                if (grievance) {
                    destroy(route('grievances.destroy', grievanceId));
                }
            });
            setSelectedGrievances([]);
        }
    };

    const handleExport = () => {
        const selectedGrievancesData = grievances.filter((g: any) => selectedGrievances.includes(g.grievance_id));
        const csvContent = [
            ['Grievance ID', 'Subject', 'Type', 'Status', 'Created At', 'Details'],
            ...selectedGrievancesData.map((g: any) => [
                g.grievance_id,
                g.subject,
                g.type,
                g.status,
                g.created_at,
                g.details
            ])
        ].map(row => row.map((field: string) => `"${field}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grievances-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // Filter grievances based on search and status
    const filteredGrievances = grievances.filter((g: any) => {
        const matchesSearch = g.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             g.grievance_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             g.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen w-full flex bg-[#F8FAF9] h-full">
            <Head title="Dashboard" />
            {/* Sidebar Navigation */}
            <motion.aside 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-64 min-h-screen bg-white border-r flex flex-col justify-between py-6 px-4"
            >
                <div>
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex items-center justify-center mb-8"
                    >
                        <img src="/logo.png" alt="Feedback Fortress Logo" className="h-16 w-auto object-contain" />
                    </motion.div>
                    <motion.div 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mb-8 text-center"
                    >
                        <div className="text-xs text-gray-500">Alias</div>
                        <div className="font-bold text-[#3A4F24] text-lg">{user?.alias || 'No Alias'}</div>
                    </motion.div>
                    <nav className="flex flex-col gap-2">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${activeTab === 'submit' ? 'bg-[#3A4F24] text-white' : 'bg-white text-[#3A4F24]'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white`}
                            onClick={() => setActiveTab('submit')}
                        >
                            <Send className="mr-2 h-5 w-5" /> Dashboard
                        </Button>
                        </motion.div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        >
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${activeTab === 'submissions' ? 'bg-[#3A4F24] text-white' : 'bg-white text-[#3A4F24]'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white`}
                            onClick={() => setActiveTab('submissions')}
                        >
                            <Activity className="mr-2 h-5 w-5" /> View Submissions
                        </Button>
                        </motion.div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                        >
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${activeTab === 'deleted' ? 'bg-[#3A4F24] text-white' : 'bg-white text-[#3A4F24]'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white`}
                            onClick={() => setActiveTab('deleted')}
                        >
                            <Trash2 className="mr-2 h-5 w-5" /> Deleted Submissions
                        </Button>
                        </motion.div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.65, duration: 0.5 }}
                        >
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${activeTab === 'help' ? 'bg-[#3A4F24] text-white' : 'bg-white text-[#3A4F24]'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white`}
                            onClick={() => setActiveTab('help')}
                        >
                            <HelpCircle className="mr-2 h-5 w-5" /> Help & Guidelines
                        </Button>
                        </motion.div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.7, duration: 0.5 }}
                        >
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${activeTab === 'profile' ? 'bg-[#3A4F24] text-white' : 'bg-white text-[#3A4F24]'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <Settings className="mr-2 h-5 w-5" /> Update Profile
                        </Button>
                        </motion.div>
                    </nav>
                </div>
                <motion.form
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    method="POST"
                    action={route('logout')}
                    onSubmit={e => {
                        e.preventDefault();
                        router.post(route('logout'), {}, {
                            onSuccess: () => {
                                window.location.href = '/';
                            }
                        });
                    }}
                    className="mt-8"
                >
                    <Button type="submit" variant="outline" className="w-full justify-start text-base h-14 px-6 font-semibold bg-[#3A4F24] text-white hover:bg-[#2c3a18] hover:text-white focus:bg-[#3A4F24] focus:text-white transition-colors duration-150">
                        <LogOut className="mr-2 h-5 w-5" /> Logout
                    </Button>
                </motion.form>
            </motion.aside>
            {/* Main Content */}
            <motion.main 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex-1 p-8"
            >
                {/* Enhanced Header with Dark Mode and Notifications */}
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="mb-6"
                >
                    {/* Top Bar with Dark Mode and Notifications */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="font-medium text-[#3A4F24]">Dashboard</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="capitalize">{activeTab}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            {/* Dark Mode Toggle */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDarkMode(!darkMode)}
                                className="p-2 rounded-full hover:bg-gray-100"
                            >
                                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </Button>
                            
                            {/* Enhanced Notifications with Better Visibility */}
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative bg-white border-2 border-[#3A4F24] text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white px-4 py-2 rounded-lg shadow-md"
                                >
                                    <Bell className="h-5 w-5 mr-2" />
                                    Notifications
                                    {notifications.length > 0 && (
                                        <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                            {notifications.length}
                                        </Badge>
                                    )}
                                </Button>
                                
                                {/* Notifications Dropdown */}
                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                                        >
                                            <div className="p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setShowNotifications(false)}
                                                        className="text-gray-500 hover:text-gray-700"
                                                    >
                                                        ×
                                                    </Button>
                                                </div>
                                                
                                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                                    {notifications.length === 0 ? (
                                                        <div className="text-center py-8">
                                                            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                            <p className="text-gray-500 text-sm">No notifications</p>
                                                        </div>
                                                    ) : (
                                                        notifications.map((notification) => (
                                                            <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                                                                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                                                    notification.type === 'success' ? 'bg-green-500' :
                                                                    notification.type === 'info' ? 'bg-blue-500' :
                                                                    notification.type === 'warning' ? 'bg-yellow-500' :
                                                                    'bg-red-500'
                                                                }`} />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                                                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setNotifications(prev => prev.filter(n => n.id !== notification.id));
                                                                        toast.success('Notification dismissed');
                                                                    }}
                                                                    className="text-gray-400 hover:text-gray-600"
                                                                >
                                                                    ×
                                                                </Button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                
                                                {notifications.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setNotifications([]);
                                                                toast.success('All notifications cleared');
                                                            }}
                                                            className="w-full bg-white text-[#3A4F24] border-[#3A4F24] hover:bg-[#3A4F24] hover:text-white"
                                                        >
                                                            Clear All
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Quick Actions Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-[#3A4F24] capitalize">
                                {activeTab === 'submit' ? 'Submit Grievance' : 
                                 activeTab === 'submissions' ? 'My Submissions' :
                                 activeTab === 'deleted' ? 'Deleted Submissions' :
                                 activeTab === 'help' ? 'Help & Guidelines' :
                                 activeTab === 'profile' ? 'Update Profile' : 'Dashboard'}
                            </h1>
                            {activeTab === 'submissions' && grievances.length > 0 && (
                                <Badge className="bg-[#3A4F24] text-white">
                                    {grievances.length} {grievances.length === 1 ? 'submission' : 'submissions'}
                                </Badge>
                            )}
                        </div>

                        {/* Enhanced Quick Action Buttons */}
                        <div className="flex items-center space-x-2">
                            {activeTab === 'submit' && (
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="bg-[#3A4F24] hover:bg-[#2c3a18] text-white shadow-lg"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Submit New Grievance
                                </Button>
                            )}
                            
                            {activeTab === 'submissions' && grievances.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowBulkActions(!showBulkActions)}
                                        className="bg-white text-[#3A4F24] hover:bg-[#2c3a18] hover:text-white focus:bg-[#2c3a18] focus:text-white"
                                    >
                                        <Filter className="mr-2 h-4 w-4" />
                                        Bulk Actions
                                    </Button>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="bg-white text-[#3A4F24] hover:bg-[#2c3a18] hover:text-white focus:bg-[#2c3a18] focus:text-white">
                                                <MoreHorizontal className="mr-2 h-4 w-4" />
                                                More
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => handleExport()}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Export All
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => window.print()}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Print View
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
                <AnimatePresence mode="wait">
                    {activeTab !== 'profile' && (
                        <motion.div
                            key="dashboard-content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === 'submit' && (
                                <>
                                    {/* Welcome Section */}
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9, duration: 0.5 }}
                                        className="mb-6 rounded-xl bg-gradient-to-r from-[#3A4F24] to-[#5B7B3A] p-6 text-white"
                                    >
                                        <h1 className="text-2xl font-bold">Welcome back!</h1>
                                        <p className="mt-2 text-white/80">Here's what's happening with your account today.</p>
                                    </motion.div>
                                    {/* Quick Stats */}
                                    <div className="mb-8 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
                                        {[
                                            { title: 'Total Case', count: total_submissions, icon: Ticket, color: 'text-[#3A4F24]', delay: 1.0 },
                                            { title: 'Under Review', count: underReviewCount, icon: Bell, color: 'text-yellow-400', delay: 1.1 },
                                            { title: 'Resolved', count: resolvedCount, icon: CheckCircle, color: 'text-green-700', delay: 1.2 },
                                            { title: 'Archived', count: archivedCount, icon: XCircle, color: 'text-red-700', delay: 1.3 }
                                        ].map((stat, index) => (
                                            <motion.div
                                                key={stat.title}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: stat.delay, duration: 0.5 }}
                                            >
                                                <Card className="bg-white h-40 flex flex-col justify-center shadow-md">
                                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                        <CardTitle className={`text-lg font-bold ${stat.color}`}>{stat.title}</CardTitle>
                                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className={`text-3xl font-extrabold ${stat.color}`}>{stat.count}</div>
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            {stat.count === 0 ? `No ${stat.title.toLowerCase()}` : stat.title}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                            {/* Enhanced Grievance Form */}
                            {activeTab === 'submit' && (
                                <motion.div
                                    key="submit-content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full"
                                >
                                    {!showForm ? (
                                        <div className="space-y-6">
                                            {/* Quick Actions */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5, duration: 0.5 }}
                                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                            >
                                                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setShowForm(true)}>
                                                    <CardContent className="p-6 text-center">
                                                        <Send className="h-12 w-12 mx-auto mb-4 text-[#3A4F24]" />
                                                        <h3 className="text-lg font-semibold text-[#3A4F24] mb-2">Submit New Grievance</h3>
                                                        <p className="text-gray-600 text-sm">Create a new grievance or feedback submission</p>
                                                    </CardContent>
                                                </Card>

                                                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('submissions')}>
                                                    <CardContent className="p-6 text-center">
                                                        <Activity className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                                                        <h3 className="text-lg font-semibold text-[#3A4F24] mb-2">View Submissions</h3>
                                                        <p className="text-gray-600 text-sm">Track your existing submissions and their status</p>
                                                    </CardContent>
                                                </Card>

                                                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('help')}>
                                                    <CardContent className="p-6 text-center">
                                                        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-orange-600" />
                                                        <h3 className="text-lg font-semibold text-[#3A4F24] mb-2">Help & Guidelines</h3>
                                                        <p className="text-gray-600 text-sm">Learn about the grievance process and guidelines</p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>

                                            {/* Recent Activity */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.7, duration: 0.5 }}
                                            >
                                                <Card className="bg-white shadow-lg">
                                                    <CardHeader>
                                                        <CardTitle className="text-xl text-[#3A4F24]">Recent Activity</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {grievances.slice(0, 5).length > 0 ? (
                                                            <div className="space-y-4">
                                                                {grievances.slice(0, 5).map((grievance: any, index: number) => (
                                                                    <div key={grievance.grievance_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                                        <div className="flex items-center space-x-3">
                                                                            <div className={`w-3 h-3 rounded-full ${
                                                                                grievance.status === 'Resolved' ? 'bg-green-500' :
                                                                                grievance.status === 'Under Review' ? 'bg-blue-500' :
                                                                                'bg-gray-500'
                                                                            }`}></div>
                                                                            <div>
                                                                                <p className="font-medium text-gray-900">{grievance.subject}</p>
                                                                                <p className="text-sm text-gray-500">{grievance.type} • {grievance.created_at}</p>
                                                                            </div>
                                                                        </div>
                                                                        <Badge className={
                                                                            grievance.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                                                            grievance.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                        }>
                                                                            {grievance.status}
                                                                        </Badge>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8 text-gray-500">
                                                                <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                                <p>No recent submissions yet.</p>
                                                                <p className="text-sm">Start by submitting your first grievance!</p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </div>
                                    ) : (
                                        <EnhancedGrievanceForm
                                            onSubmit={(formData) => {
                                                const submitData = {
                                                    ...formData,
                                                    type: formData.type,
                                                    subject: formData.subject,
                                                    details: formData.details,
                                                    priority: formData.priority
                                                };
                                                
                                                const formDataToSend = new FormData();
                                                formDataToSend.append('type', submitData.type);
                                                formDataToSend.append('subject', submitData.subject);
                                                formDataToSend.append('details', submitData.details);
                                                formDataToSend.append('priority', submitData.priority);
                                                
                                                if (formData.attachments && formData.attachments.length > 0) {
                                                    formData.attachments.forEach((file: File) => {
                                                        formDataToSend.append('attachments[]', file);
                                                    });
                                                }
                                                
                                                router.post(route('grievances.store'), formDataToSend, {
                                                    forceFormData: true,
                                                    onSuccess: () => {
                                                        reset();
                                                        setShowForm(false);
                                                        toast.success('Grievance submitted successfully!');
                                                    },
                                                    onError: (errors) => {
                                                        toast.error('Failed to submit grievance. Please try again.');
                                                    }
                                                });
                                            }}
                                            onCancel={() => {
                                                setShowForm(false);
                                                reset();
                                            }}
                                            processing={processing}
                                            errors={errors}
                                            data={data}
                                            setData={setData}
                                        />
                                    )}
                                </motion.div>
                            )}
                            {/* View Submissions Table */}
                            {activeTab === 'submissions' && (
                                <motion.div
                                    key="submissions-content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full max-w-full mx-auto"
                                >
                                    <Card className="bg-white w-full shadow-lg">
                                        <CardContent className="p-6">
                                            {/* Search and Filter Controls */}
                                            <div className="mb-6 space-y-4">
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                            <Input
                                                                placeholder="Search grievances..."
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                className="pl-10"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Select
                                                        value={statusFilter}
                                                        onValueChange={setStatusFilter}
                                                    >
                                                        <SelectTrigger className="w-[180px] bg-white text-[#3A4F24] focus:ring-[#3A4F24]">
                                                            <SelectValue placeholder="Filter by status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white">
                                                            <SelectItem value="all" className="text-black hover:bg-gray-100">All Status</SelectItem>
                                                            <SelectItem value="Under Review" className="text-black hover:bg-gray-100">Under Review</SelectItem>
                                                            <SelectItem value="Resolved" className="text-black hover:bg-gray-100">Resolved</SelectItem>
                                                            <SelectItem value="Archived" className="text-black hover:bg-gray-100">Archived</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Bulk Actions Bar */}
                                                {showBulkActions && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-gray-50 rounded-lg p-4 border"
                                                    >
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                            <div className="flex items-center space-x-4">
                                                                <Checkbox
                                                                    checked={selectedGrievances.length === filteredGrievances.length && filteredGrievances.length > 0}
                                                                    onCheckedChange={handleSelectAll}
                                                                />
                                                                <span className="text-sm text-gray-600">
                                                                    {selectedGrievances.length} of {filteredGrievances.length} selected
                                                                </span>
                                                            </div>
                                                            {selectedGrievances.length > 0 && (
                                                                <div className="flex items-center space-x-2">
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={handleExport}
                                                                        className="bg-white text-[#3A4F24] hover:bg-[#2c3a18] hover:text-white focus:bg-[#2c3a18] focus:text-white"
                                                                    >
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        Export Selected
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={handleBulkDelete}
                                                                        className="bg-white text-red-600 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete Selected
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="min-w-full w-full divide-y divide-gray-200 text-base text-black">
                                                    <thead className="bg-[#F3F4F6] text-black">
                                                        <tr>
                                                            {showBulkActions && (
                                                                <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">
                                                                    <Checkbox
                                                                        checked={selectedGrievances.length === filteredGrievances.length && filteredGrievances.length > 0}
                                                                        onCheckedChange={handleSelectAll}
                                                                    />
                                                                </th>
                                                            )}
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Grievance ID</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Subject</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Type</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Details</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Status</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Date</th>
                                                            <th className="px-6 py-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200 text-lg text-black">
                                                        {filteredGrievances.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={showBulkActions ? 8 : 7} className="text-center text-gray-400 py-12 text-xl">
                                                                    {grievances.length === 0 ? 'No submissions found.' : 'No submissions match your search criteria.'}
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            filteredGrievances.map((g: any, index: number) => (
                                                                <motion.tr 
                                                                    key={g.grievance_id} 
                                                                    className="text-black"
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: index * 0.05 }}
                                                                >
                                                                    {showBulkActions && (
                                                                        <td className="px-6 py-4">
                                                                            <Checkbox
                                                                                checked={selectedGrievances.includes(g.grievance_id)}
                                                                                onCheckedChange={() => handleSelectGrievance(g.grievance_id)}
                                                                            />
                                                                        </td>
                                                                    )}
                                                                    <td className="px-6 py-4 font-semibold text-[#3A4F24] text-lg">{g.grievance_id}</td>
                                                                    <td className="px-6 py-4 font-medium text-lg">{g.subject}</td>
                                                                    <td className="px-6 py-4 capitalize text-lg">{g.type}</td>
                                                                    <td className="px-6 py-4 max-w-2xl truncate text-lg" title={g.details}>{g.details.length > 60 ? g.details.slice(0, 60) + '...' : g.details}</td>
                                                                    <td className="px-6 py-4">
                                                                        <span className={`inline-block px-3 py-1 rounded text-base font-semibold ${g.status === 'Under Review' ? 'bg-yellow-100 text-yellow-400' : g.status === 'Resolved' ? 'bg-green-100 text-green-800' : g.status === 'Archived' ? 'bg-orange-100 text-orange-400' : 'bg-gray-100 text-gray-800'}`}>{g.status}</span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-base text-gray-500">{g.created_at}</td>
                                                                    <td className="px-6 py-4 flex gap-2 items-center">
                                                                        <Button size="lg" className="bg-[#3A4F24] text-white hover:bg-[#2c3a18] text-base px-5 py-2" onClick={() => setViewModal({ open: true, grievance: g })}>View</Button>
                                                                        <button
                                                                            type="button"
                                                                            className="p-3 rounded hover:bg-red-100"
                                                                            onClick={() => {
                                                                                if (window.confirm('Are you sure you want to delete this grievance?')) {
                                                                                    destroy(route('grievances.destroy', g.grievance_id));
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-6 w-6 text-red-600" />
                                                                        </button>
                                                                    </td>
                                                                </motion.tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* View Modal */}
                                            <AnimatePresence>
                                                {viewModal.open && viewModal.grievance && (
                                                    <motion.div 
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                                                    >
                                                        <motion.div 
                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0.9, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl relative"
                                                        >
                                                            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl" onClick={() => setViewModal({ open: false, grievance: null })}>
                                                                <span className="text-3xl">&times;</span>
                                                            </button>
                                                            <h2 className="text-3xl font-bold mb-6 text-[#3A4F24]">Grievance Details</h2>
                                                            <div className="space-y-6 text-lg text-black">
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.1 }}
                                                                    className="flex items-start gap-4"
                                                                >
                                                                    <span className="font-semibold min-w-[120px]">Grievance ID:</span>
                                                                    <span>{viewModal.grievance.grievance_id}</span>
                                                                </motion.div>
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.2 }}
                                                                    className="flex items-start gap-4"
                                                                >
                                                                    <span className="font-semibold min-w-[120px]">Subject:</span>
                                                                    <span>{viewModal.grievance.subject}</span>
                                                                </motion.div>
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.3 }}
                                                                    className="flex items-start gap-4"
                                                                >
                                                                    <span className="font-semibold min-w-[120px]">Type:</span>
                                                                    <span className="capitalize">{viewModal.grievance.type}</span>
                                                                </motion.div>
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.4 }}
                                                                    className="flex items-start gap-4"
                                                                >
                                                                    <span className="font-semibold min-w-[120px]">Status:</span>
                                                                    <span className={`inline-block px-3 py-1 rounded text-base font-semibold ${
                                                                        viewModal.grievance.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' : 
                                                                        viewModal.grievance.status === 'Resolved' ? 'bg-green-100 text-green-800' : 
                                                                        viewModal.grievance.status === 'Archived' ? 'bg-orange-100 text-orange-800' : 
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>{viewModal.grievance.status}</span>
                                                                </motion.div>
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.5 }}
                                                                    className="flex items-start gap-4"
                                                                >
                                                                    <span className="font-semibold min-w-[120px]">Date:</span>
                                                                    <span>{viewModal.grievance.created_at}</span>
                                                                </motion.div>
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.6 }}
                                                                    className="flex flex-col gap-2"
                                                                >
                                                                    <span className="font-semibold">Details:</span>
                                                                    <div className="whitespace-pre-line rounded-lg p-4 bg-gray-50 text-lg text-black">
                                                                        {viewModal.grievance.details}
                                                                    </div>
                                                                </motion.div>
                                                                {viewModal.grievance.attachments ? (
                                                                    <div className="border rounded-lg p-4 bg-gray-50">
                                                                        <div className="flex items-center gap-3">
                                                                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                            </svg>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                                    {viewModal.grievance.attachments.split('/').pop()}
                                                                                </p>
                                                                                <p className="text-sm text-gray-500">Click to view</p>
                                                                            </div>
                                                                            <a
                                                                                href={`/grievance-attachment/${viewModal.grievance.grievance_id}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#3A4F24] hover:bg-[#2c3a18] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A4F24]"
                                                                            >
                                                                                View
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="ml-2 text-gray-500">No attachment</span>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                            {/* Deleted Submissions Table */}
                            {activeTab === 'deleted' && (
                                <motion.div
                                    key="deleted-content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full max-w-full mx-auto"
                                >
                                    <Card className="bg-white w-full">
                                        <CardHeader>
                                            <CardTitle className="text-2xl text-[#3A4F24]">Deleted Submissions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full w-full divide-y divide-gray-200 text-base text-black">
                                                    <thead className="bg-[#F3F4F6] text-black">
                                                        <tr>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Grievance ID</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Subject</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Type</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Details</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Status</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Date</th>
                                                            <th className="px-6 py-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200 text-lg text-black">
                                                        {deletedGrievances.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="text-center text-gray-400 py-12 text-xl">No deleted submissions found.</td>
                                                            </tr>
                                                        ) : (
                                                            deletedGrievances.map((g: any, index: number) => (
                                                                <tr key={g.grievance_id} className="text-black">
                                                                    <td className="px-6 py-4 font-semibold text-[#3A4F24] text-lg">{g.grievance_id}</td>
                                                                    <td className="px-6 py-4 font-medium text-lg">{g.subject}</td>
                                                                    <td className="px-6 py-4 capitalize text-lg">{g.type}</td>
                                                                    <td className="px-6 py-4 max-w-2xl truncate text-lg" title={g.details}>{g.details.length > 60 ? g.details.slice(0, 60) + '...' : g.details}</td>
                                                                    <td className="px-6 py-4">{g.status}</td>
                                                                    <td className="px-6 py-4 text-base text-gray-500">{g.created_at}</td>
                                                                    <td className="px-6 py-4 flex gap-2 items-center">
                                                                        <Button 
                                                                            size="sm" 
                                                                            className="bg-[#3A4F24] hover:bg-[#2c3a18] text-white px-4 py-2" 
                                                                            onClick={() => {
                                                                                if (window.confirm('Are you sure you want to restore this grievance?')) {
                                                                                    axios.put(route('grievances.restore', g.grievance_id)).then(() => {
                                                                                        setDeletedGrievances(deletedGrievances.filter(dg => dg.grievance_id !== g.grievance_id));
                                                                                    });
                                                                                }
                                                                            }}
                                                                        >
                                                                            Restore
                                                                        </Button>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="destructive" 
                                                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                                                                            onClick={() => {
                                                                                if (window.confirm('Are you sure you want to delete this grievance permanently? This action cannot be undone.')) {
                                                                                    axios.delete(route('grievances.forceDelete', g.grievance_id)).then(() => {
                                                                                        setDeletedGrievances(deletedGrievances.filter(dg => dg.grievance_id !== g.grievance_id));
                                                                                    });
                                                                                }
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                            {/* Help & Guidelines Tab Content */}
                            {activeTab === 'help' && (
                                <motion.div key="help-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="w-full max-w-full mx-auto">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Main Help Content */}
                                        <div className="lg:col-span-2">
                                            <Card className="bg-white shadow-lg">
                                                <CardHeader>
                                                    <CardTitle className="text-2xl text-[#3A4F24]">Help & Guidelines</CardTitle>
                                                    <p className="text-gray-600">Learn how to effectively use the Feedback Fortress portal</p>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold text-[#3A4F24]">Getting Started</h3>
                                                        <p className="text-gray-700">Welcome to Feedback Fortress! This portal allows you to submit grievances and feedback anonymously and securely.</p>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold text-[#3A4F24]">How to Submit a Grievance</h3>
                                                        <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                                            <li>Navigate to the "Submit Grievance" tab</li>
                                                            <li>Fill out the required fields (Type, Subject, Details)</li>
                                                            <li>Attach any relevant documents or evidence</li>
                                                            <li>Review your submission and click "Submit"</li>
                                                        </ol>
                                                    </div>
                                                    
                                                    <div className="space-y-4">
                                                        <h3 className="text-lg font-semibold text-[#3A4F24]">Tracking Your Submissions</h3>
                                                        <p className="text-gray-700">You can view all your submissions in the "View Submissions" tab, where you can track their status and view responses.</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Quick Links Sidebar */}
                                        <div className="lg:col-span-1">
                                            <Card className="bg-white shadow-lg h-fit">
                                                <CardHeader>
                                                    <CardTitle className="text-lg text-[#3A4F24]">Quick Links</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <Button 
                                                        variant="outline" 
                                                        size="lg"
                                                        onClick={() => setActiveTab('submit')}
                                                        className="w-full justify-start bg-white text-[#3A4F24] border-[#3A4F24] hover:bg-[#2c3a18] hover:text-white focus:bg-[#2c3a18] focus:text-white text-base py-3"
                                                    >
                                                        <Plus className="mr-2 h-5 w-5" />
                                                        Submit New Grievance
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="lg"
                                                        onClick={() => setActiveTab('submissions')}
                                                        className="w-full justify-start bg-white text-[#3A4F24] border-[#3A4F24] hover:bg-[#2c3a18] hover:text-white focus:bg-[#2c3a18] focus:text-white text-base py-3"
                                                    >
                                                        <Activity className="mr-2 h-5 w-5" />
                                                        View My Submissions
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="lg"
                                                        onClick={() => setActiveTab('profile')}
                                                        className="w-full justify-start bg-white text-[#3A4F24] border-[#3A4F24] hover:bg-[#2c3a18] hover:text-white focus:bg-[#2c3a18] focus:text-white text-base py-3"
                                                    >
                                                        <Settings className="mr-2 h-5 w-5" />
                                                        Update Profile
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Confirmation Dialog */}
                {showConfirmDialog && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
                            <h2 className="text-2xl font-bold mb-4 text-[#3A4F24]">Confirm Changes</h2>
                            <p className="text-gray-600 mb-6">Are you sure you want to save these changes to your profile?</p>
                            <div className="flex gap-4">
                                <Button
                                    onClick={confirmProfileUpdate}
                                    className="flex-1 h-12 bg-[#3A4F24] hover:bg-[#2c3a18] text-white rounded-lg"
                                >
                                    Yes, Save Changes
                                </Button>
                                <Button
                                    onClick={() => setShowConfirmDialog(false)}
                                    variant="outline"
                                    className="flex-1 h-12 border-[#3A4F24] text-[#3A4F24] hover:bg-gray-50 rounded-lg"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                  <motion.div
                    key="profile-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full max-w-3xl mx-auto">
                      <Card className="bg-white shadow-lg">
                        <CardHeader className="pb-6 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#3A4F24] rounded-full flex items-center justify-center">
                              <Settings className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl text-[#3A4F24]">Edit Profile</CardTitle>
                              <p className="text-gray-500 text-sm">Update your account information and password</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <form onSubmit={handleProfileUpdate} className="space-y-5">
                            {/* Student ID (read-only) */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
                              <input
                                type="text"
                                value={student_id || ''}
                                disabled
                                className="w-full border rounded-lg px-4 py-3 text-base bg-gray-100 text-gray-600 cursor-not-allowed"
                              />
                            </div>
                            {/* Alias (editable) */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Alias</label>
                              <input
                                type="text"
                                value={profileData.alias ?? user?.alias ?? ''}
                                onChange={e => handleProfileDataChange('alias', e.target.value)}
                                required
                                className="w-full rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24] bg-gray-50"
                                placeholder="Enter your alias"
                              />
                              {profileErrors.alias && <div className="text-red-500 text-sm mt-1">{profileErrors.alias}</div>}
                            </div>
                            {/* Email */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                value={profileData.email}
                                onChange={e => handleProfileDataChange('email', e.target.value)}
                                required
                                className="w-full rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24] bg-gray-50"
                                placeholder="Enter your email"
                              />
                              {profileErrors.email && <div className="text-red-500 text-sm mt-1">{profileErrors.email}</div>}
                            </div>
                            {/* Current Password */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                              <input
                                type="password"
                                value={profileData.current_password}
                                onChange={e => handleProfileDataChange('current_password', e.target.value)}
                                required
                                className="w-full rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24] bg-gray-50"
                                placeholder="Enter your current password"
                              />
                              {profileErrors.current_password && <div className="text-red-500 text-sm mt-1">{profileErrors.current_password}</div>}
                            </div>
                            {/* New Password */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                              <input
                                type="password"
                                value={profileData.password}
                                onChange={e => handleProfileDataChange('password', e.target.value)}
                                className="w-full rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24] bg-gray-50"
                                placeholder="Leave blank to keep current password"
                              />
                              {profileErrors.password && <div className="text-red-500 text-sm mt-1">{profileErrors.password}</div>}
                            </div>
                            {/* Confirm Password */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                              <input
                                type="password"
                                value={profileData.password_confirmation}
                                onChange={e => handleProfileDataChange('password_confirmation', e.target.value)}
                                className="w-full rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24] bg-gray-50"
                                placeholder="Confirm your new password"
                              />
                              {profileErrors.password_confirmation && <div className="text-red-500 text-sm mt-1">{profileErrors.password_confirmation}</div>}
                            </div>
                            {/* Captcha */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Verification Code</label>
                                <button
                                  type="button"
                                  onClick={refreshCaptcha}
                                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#3A4F24] transition-colors duration-150 text-sm"
                                  aria-label="Refresh verification code"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                  <span className="font-medium">Refresh</span>
                                </button>
                              </div>
                              <div className="bg-gray-50 p-4 rounded-lg mb-3 text-center">
                                <span className="font-mono text-xl tracking-wider text-[#3A4F24]">{captcha}</span>
                              </div>
                              <input
                                type="text"
                                value={profileData.captcha}
                                onChange={e => handleProfileDataChange('captcha', e.target.value)}
                                required
                                className="w-full rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24] bg-gray-50"
                                placeholder="Enter the verification code shown above"
                              />
                              {profileErrors.captcha && <div className="text-red-500 text-sm mt-1">{profileErrors.captcha}</div>}
                            </div>
                            {/* Buttons */}
                            <div className="flex justify-end gap-4 pt-4 border-t">
                              <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 rounded-lg text-[#3A4F24] bg-white font-semibold text-base hover:bg-[#E6F2E6] transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={profileProcessing}
                                className="px-6 py-2 rounded-lg bg-[#3A4F24] text-white font-semibold text-base hover:bg-[#2c3a18] transition-colors disabled:opacity-60"
                              >
                                {profileProcessing ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
            </motion.main>
        </div>
    );
}
