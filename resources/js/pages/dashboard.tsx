import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, Activity, Settings, Send, LogOut, Trash2, Ticket, CheckCircle, XCircle, RefreshCw, HelpCircle, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { student_id, total_submissions, grievances = [], captcha: initialCaptcha, user } = usePage().props as any;
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'submit' | 'submissions' | 'deleted' | 'inbox' | 'help' | 'profile'>('submit');
    const { data, setData, post, processing, errors, reset, delete: destroy } = useForm({
        subject: '',
        type: '',
        details: '',
    });
    const [viewModal, setViewModal] = useState<{ open: boolean; grievance: any | null }>({ open: false, grievance: null });
    const [profileData, setProfileData] = useState({
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

    const handleProfileDataChange = (field: string, value: string) => {
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
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'submit' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
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
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'submissions' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
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
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'deleted' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
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
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'inbox' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
                            onClick={() => setActiveTab('inbox')}
                        >
                            <Mail className="mr-2 h-5 w-5" /> Inbox
                        </Button>
                        </motion.div>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'help' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
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
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'profile' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
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
                    <Button type="submit" variant="outline" className="w-full justify-start text-base h-14 px-6 font-semibold border-2 border-[#3A4F24] bg-[#3A4F24] text-white hover:bg-[#2c3a18] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24] transition-colors duration-150">
                        <LogOut className="mr-2 h-5 w-5" /> Logout
                    </Button>
                </motion.form>
            </motion.aside>
            {/* Main Content */}
            <motion.main 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className={`flex-1 ${activeTab === 'inbox' ? 'h-full p-0' : 'p-8'}`}
            >
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
                            {/* Submit a Grievance Form */}
                            {activeTab === 'submit' && (
                                <motion.div
                                    key="submit-content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full"
                                >
                                    <Card className="bg-white w-full h-full p-12 shadow-lg">
                                        <CardHeader className="pb-8">
                                            <CardTitle className="text-3xl text-[#3A4F24]">Submit a Grievance</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {!showForm ? (
                                                <motion.div
                                                    initial={{ scale: 0.95, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Button 
                                                        onClick={() => setShowForm(true)}
                                                        className="w-full h-16 text-xl bg-[#3A4F24] hover:bg-[#2c3a18] text-white rounded-lg shadow"
                                                    >
                                                        <Send className="mr-2 h-6 w-6" />
                                                        Submit New Grievance
                                                    </Button>
                                                </motion.div>
                                            ) : (
                                                <motion.form 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    onSubmit={handleSubmit} 
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-10"
                                                >
                                                    <div className="col-span-1 md:col-span-2">
                                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Type</label>
                                                        <Select
                                                            value={data.type}
                                                            onValueChange={(value) => setData('type', value)}
                                                        >
                                                            <SelectTrigger className="text-black bg-white placeholder-gray-400 [&>span]:text-black px-6 py-4 text-lg">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white text-black">
                                                                <SelectItem value="complaint">Complaint</SelectItem>
                                                                <SelectItem value="feedback">Feedback</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.type && (
                                                            <p className="text-base text-red-500 mt-1">{errors.type}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2">
                                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Subject <span className='text-red-600'>*</span></label>
                                                        <input
                                                            type="text"
                                                            placeholder="Subject"
                                                            value={data.subject}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('subject', e.target.value)}
                                                            minLength={8}
                                                            required
                                                            className={`w-full border rounded-lg px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#3A4F24] placeholder-gray-400 bg-white text-black ${errors.subject ? 'border-red-500' : ''}`}
                                                        />
                                                        {errors.subject && (
                                                            <p className="text-base text-red-500 mt-1">{errors.subject}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2">
                                                        <label className="block text-lg font-semibold text-gray-700 mb-2">Details <span className='text-red-600'>*</span></label>
                                                        <textarea
                                                            placeholder="Enter your details here..."
                                                            value={data.details}
                                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('details', e.target.value)}
                                                            required
                                                            className="w-full min-h-[180px] text-lg text-black placeholder-gray-400 bg-white border rounded-lg px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                                        />
                                                        {errors.details && (
                                                            <p className="text-base text-red-500 mt-1">{errors.details}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2">
                                                        <label className="block text-lg font-semibold text-gray-700 mb-2">
                                                            Attachment <span className="text-red-600">*</span>
                                                        </label>
                                                        <input
                                                            id="attachment"
                                                            type="file"
                                                            name="attachment"
                                                            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                                                            required
                                                            onChange={e => setAttachment(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                                            className="w-full border rounded-lg px-6 py-4 text-lg text-black bg-white focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                                        />
                                                        {!attachment && (
                                                            <div className="text-red-600 text-base font-medium mt-2">
                                                                Attachment is required.
                                                            </div>
                                                        )}
                                                        {attachment && (
                                                            <div className="mt-2 text-green-700 text-base font-medium">
                                                                Selected: {attachment.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-span-1 md:col-span-2 flex justify-end gap-6 mt-4">
                                                        <Button
                                                            type="submit"
                                                            disabled={processing}
                                                            className="px-12 py-4 h-auto text-xl bg-[#3A4F24] hover:bg-[#2c3a18] text-white rounded-lg"
                                                        >
                                                            Submit
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                setShowForm(false);
                                                                reset();
                                                            }}
                                                            className="px-12 py-4 h-auto text-xl"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </motion.form>
                                            )}
                                        </CardContent>
                                    </Card>
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
                                    <Card className="bg-white w-full">
                                        <CardHeader>
                                            <CardTitle className="text-2xl text-[#3A4F24]">Your Submissions</CardTitle>
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
                                                        {grievances.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="text-center text-gray-400 py-12 text-xl">No submissions found.</td>
                                                            </tr>
                                                        ) : (
                                                            grievances.map((g: any, index: number) => (
                                                                <motion.tr 
                                                                    key={g.grievance_id} 
                                                                    className="text-black"
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: index * 0.05 }}
                                                                >
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
                                                                    <div className="whitespace-pre-line border rounded-lg p-4 bg-gray-50 text-lg text-black">
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
                                                                        <Button size="lg" className="w-full justify-start text-base h-14 px-6 font-semibold border-2 border-[#3A4F24] bg-[#3A4F24] text-white hover:bg-[#2c3a18] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24] transition-colors duration-150" onClick={() => {
                                                                            if (window.confirm('Are you sure you want to restore this grievance?')) {
                                                                                axios.put(route('grievances.restore', g.grievance_id)).then(() => {
                                                                                    setDeletedGrievances(deletedGrievances.filter(dg => dg.grievance_id !== g.grievance_id));
                                                                                });
                                                                            }
                                                                        }}>Restore</Button>
                                                                        <Button size="lg" variant="destructive" onClick={() => {
                                                                            if (window.confirm('Are you sure you want to permanently delete this grievance?')) {
                                                                                axios.delete(route('grievances.forceDelete', g.grievance_id)).then(() => {
                                                                                    setDeletedGrievances(deletedGrievances.filter(dg => dg.grievance_id !== g.grievance_id));
                                                                                });
                                                                            }
                                                                        }}>Delete Permanently</Button>
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
                            {/* Inbox Tab Content */}
                            {activeTab === 'inbox' && (
                                <motion.div key="inbox-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="w-full max-w-4xl mx-auto mt-8">
                                    <Card className="bg-white w-full">
                                        <CardHeader className="pb-0">
                                            <div className="flex gap-6 justify-start w-full border-b border-gray-200 pt-2">
                                                <button className="text-[#3A4F24] font-semibold border-b-2 border-[#3A4F24] pb-2">All messages</button>
                                                <button className="text-gray-400 font-semibold border-b-2 border-transparent pb-2">Pinned</button>
                                                <button className="text-gray-400 font-semibold border-b-2 border-transparent pb-2">Unread</button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full w-full divide-y divide-gray-200 text-base text-black">
                                                    <thead className="bg-[#F3F4F6] text-black">
                                                        <tr>
                                                            <th className="px-6 py-4 text-left">
                                                                <input type="checkbox" disabled className="w-5 h-5 text-[#3A4F24] border-gray-300 rounded" />
                                                            </th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">From</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Subject</th>
                                                            <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Date</th>
                                                            <th className="px-6 py-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200 text-lg text-black">
                                                        <tr>
                                                            <td colSpan={5} className="text-center text-gray-400 py-12 text-xl">
                                                                <div className="flex flex-col items-center justify-center">
                                                                    <Mail className="w-10 h-10 text-gray-300 mb-3" />
                                                                    <div className="font-semibold text-lg text-gray-500 mb-1">No messages yet</div>
                                                                    <div className="text-gray-400 text-base">Your inbox is empty. Messages from the admin will appear here.</div>
                                                                </div>
                                                            </td>
                                                        </tr>
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
                                    <div className="p-12 bg-white rounded-xl shadow-lg">
                                        <h2 className="text-3xl font-bold text-[#3A4F24] mb-4">Help & Guidelines</h2>
                                        <p className="text-lg text-gray-700">Here you can find information and guidelines on how to use the portal. (Content coming soon.)</p>
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
                    <div className="w-full flex items-center justify-center min-h-[600px]">
                      <Card className="bg-white w-full h-full p-12 shadow-lg">
                        <CardHeader className="pb-8">
                          <CardTitle className="text-3xl text-[#3A4F24]">Edit Profile</CardTitle>
                          <p className="text-gray-600 mt-2 text-lg">Update your account information and password</p>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Student ID (read-only) */}
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-lg font-semibold text-gray-700 mb-2">Student ID</label>
                              <input
                                type="text"
                                value={student_id || ''}
                                disabled
                                className="w-full border rounded-lg px-6 py-4 text-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                              />
                            </div>
                            {/* Alias (editable) */}
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-lg font-semibold text-gray-700 mb-2">Alias</label>
                              <input
                                type="text"
                                value={profileData.alias ?? user?.alias ?? ''}
                                onChange={e => handleProfileDataChange('alias', e.target.value)}
                                required
                                className="w-full border rounded-lg px-6 py-4 text-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                placeholder="Enter your alias"
                              />
                              {profileErrors.alias && <div className="text-red-500 text-base mt-1">{profileErrors.alias}</div>}
                            </div>
                            {/* Email */}
                            <div>
                              <label className="block text-lg font-semibold text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                value={profileData.email}
                                onChange={e => handleProfileDataChange('email', e.target.value)}
                                required
                                className="w-full border rounded-lg px-6 py-4 text-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                placeholder="Enter your email"
                              />
                              {profileErrors.email && <div className="text-red-500 text-base mt-1">{profileErrors.email}</div>}
                            </div>
                            {/* Current Password */}
                            <div>
                              <label className="block text-lg font-semibold text-gray-700 mb-2">Current Password</label>
                              <input
                                type="password"
                                value={profileData.current_password}
                                onChange={e => handleProfileDataChange('current_password', e.target.value)}
                                required
                                className="w-full border rounded-lg px-6 py-4 text-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                placeholder="Enter your current password"
                              />
                              {profileErrors.current_password && <div className="text-red-500 text-base mt-1">{profileErrors.current_password}</div>}
                            </div>
                            {/* New Password */}
                            <div>
                              <label className="block text-lg font-semibold text-gray-700 mb-2">New Password</label>
                              <input
                                type="password"
                                value={profileData.password}
                                onChange={e => handleProfileDataChange('password', e.target.value)}
                                className="w-full border rounded-lg px-6 py-4 text-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                placeholder="Leave blank to keep current password"
                              />
                              {profileErrors.password && <div className="text-red-500 text-base mt-1">{profileErrors.password}</div>}
                            </div>
                            {/* Confirm Password */}
                            <div>
                              <label className="block text-lg font-semibold text-gray-700 mb-2">Confirm Password</label>
                              <input
                                type="password"
                                value={profileData.password_confirmation}
                                onChange={e => handleProfileDataChange('password_confirmation', e.target.value)}
                                className="w-full border rounded-lg px-6 py-4 text-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                placeholder="Confirm your new password"
                              />
                              {profileErrors.password_confirmation && <div className="text-red-500 text-base mt-1">{profileErrors.password_confirmation}</div>}
                            </div>
                            {/* Captcha */}
                            <div className="col-span-1 md:col-span-2">
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-lg font-semibold text-gray-700">Verification Code</label>
                                <button
                                  type="button"
                                  onClick={refreshCaptcha}
                                  className="flex items-center gap-1 px-4 py-3 border border-[#3A4F24] rounded-lg bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#3A4F24] transition-colors duration-150 text-lg"
                                  aria-label="Refresh verification code"
                                >
                                  <RefreshCw className="h-5 w-5" />
                                  <span className="font-medium">Refresh</span>
                                </button>
                              </div>
                              <div className="bg-gray-50 p-6 rounded-lg mb-3 text-center">
                                <span className="font-mono text-2xl tracking-wider text-[#3A4F24]">{captcha}</span>
                              </div>
                              <input
                                type="text"
                                value={profileData.captcha}
                                onChange={e => handleProfileDataChange('captcha', e.target.value)}
                                required
                                className="w-full border rounded-lg px-6 py-4 text-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                placeholder="Enter the verification code shown above"
                              />
                              {profileErrors.captcha && <div className="text-red-500 text-base mt-1">{profileErrors.captcha}</div>}
                            </div>
                            {/* Buttons */}
                            <div className="col-span-1 md:col-span-2 flex justify-end gap-6 mt-4">
                              <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="px-12 py-4 rounded-lg border border-[#3A4F24] text-[#3A4F24] bg-white font-semibold text-xl hover:bg-[#E6F2E6] transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={profileProcessing}
                                className="px-12 py-4 rounded-lg bg-[#3A4F24] text-white font-semibold text-xl hover:bg-[#2c3a18] transition-colors disabled:opacity-60"
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
