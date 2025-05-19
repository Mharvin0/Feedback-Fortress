import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, Activity, Settings, Send, LogOut, Trash2, Ticket, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const { student_id, total_submissions, grievances = [], captcha: initialCaptcha, user } = usePage().props as any;
    const [showForm, setShowForm] = useState(false);
    const [activeTab, setActiveTab] = useState<'submit' | 'submissions' | 'profile'>('submit');
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
    });
    const [profileErrors, setProfileErrors] = useState({
        email: '',
        current_password: '',
        password: '',
        password_confirmation: '',
        captcha: '',
    });
    const [profileProcessing, setProfileProcessing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [captcha, setCaptcha] = useState(initialCaptcha);

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
    const pendingCount = grievances.filter((g: any) => g.status === 'Pending').length;
    const approvedCount = grievances.filter((g: any) => g.status === 'Approved').length;
    const deniedCount = grievances.filter((g: any) => g.status === 'Denied').length;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('grievances.store'), {
            onSuccess: () => {
                reset();
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

    return (
        <div className="min-h-screen w-full flex bg-[#F8FAF9]">
            <Head title="Dashboard" />
            {/* Sidebar Navigation */}
            <aside className="w-64 min-h-screen bg-white border-r flex flex-col justify-between py-6 px-4">
                <div>
                    <div className="flex items-center justify-center mb-8">
                        <img src="/logo.png" alt="Feedback Fortress Logo" className="h-10 w-auto" />
                    </div>
                    <div className="mb-8 text-center">
                        <div className="text-xs text-gray-500">Student ID</div>
                        <div className="font-bold text-[#3A4F24] text-lg">{student_id}</div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'submit' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
                            onClick={() => setActiveTab('submit')}
                        >
                            <Send className="mr-2 h-5 w-5" /> Dashboard
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'submissions' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
                            onClick={() => setActiveTab('submissions')}
                        >
                            <Activity className="mr-2 h-5 w-5" /> View Submissions
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${activeTab === 'profile' ? 'bg-[#3A4F24] text-white border-[#3A4F24]' : 'bg-white text-[#3A4F24] border-transparent'} hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <Settings className="mr-2 h-5 w-5" /> Update Profile
                        </Button>
                    </nav>
                </div>
                <form
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
                </form>
            </aside>
            {/* Main Content */}
            <main className="flex-1 p-8">
                {activeTab !== 'profile' && (
                    <>
                        {/* Welcome Section */}
                        <div className="mb-6 rounded-xl bg-gradient-to-r from-[#3A4F24] to-[#5B7B3A] p-6 text-white">
                            <h1 className="text-2xl font-bold">Welcome back!</h1>
                            <p className="mt-2 text-white/80">Here's what's happening with your account today.</p>
                        </div>
                        {/* Quick Stats */}
                        <div className="mb-8 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
                            <Card className="bg-white h-40 flex flex-col justify-center shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold text-[#3A4F24]">Total Submissions</CardTitle>
                                    <Ticket className="h-6 w-6 text-[#3A4F24]" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold text-[#3A4F24]">{total_submissions}</div>
                                    <p className="text-sm text-gray-500 mt-2">{total_submissions === 0 ? 'No submissions yet' : 'Total Submissions'}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white h-40 flex flex-col justify-center shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold text-yellow-700">Pending</CardTitle>
                                    <Bell className="h-6 w-6 text-yellow-700" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold text-yellow-700">{pendingCount}</div>
                                    <p className="text-sm text-gray-500 mt-2">{pendingCount === 0 ? 'No pending' : 'Pending'}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white h-40 flex flex-col justify-center shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold text-green-700">Approved</CardTitle>
                                    <CheckCircle className="h-6 w-6 text-green-700" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold text-green-700">{approvedCount}</div>
                                    <p className="text-sm text-gray-500 mt-2">{approvedCount === 0 ? 'No approved' : 'Approved'}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white h-40 flex flex-col justify-center shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-lg font-bold text-red-700">Denied</CardTitle>
                                    <XCircle className="h-6 w-6 text-red-700" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold text-red-700">{deniedCount}</div>
                                    <p className="text-sm text-gray-500 mt-2">{deniedCount === 0 ? 'No denied' : 'Denied'}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
                {/* Main Tab Content */}
                {activeTab === 'submit' && (
                    <div className="w-full max-w-6xl mx-auto">
                        <Card className="bg-white">
                            <CardHeader>
                                <CardTitle className="text-[#3A4F24]">Submit a Grievance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!showForm ? (
                                    <Button 
                                        onClick={() => setShowForm(true)}
                                        className="w-full h-12 text-lg bg-[#3A4F24] hover:bg-[#2c3a18] text-white rounded-lg shadow"
                                    >
                                        <Send className="mr-2 h-5 w-5" />
                                        Submit New Grievance
                                    </Button>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Select
                                                value={data.type}
                                                onValueChange={(value) => setData('type', value)}
                                            >
                                                <SelectTrigger className="text-black bg-white placeholder-gray-400 [&>span]:text-black">
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white text-black">
                                                    <SelectItem value="request">Request</SelectItem>
                                                    <SelectItem value="complaint">Complaint</SelectItem>
                                                    <SelectItem value="feedback">Feedback</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.type && (
                                                <p className="text-sm text-red-500 mt-1">{errors.type}</p>
                                            )}
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Subject"
                                                value={data.subject}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('subject', e.target.value)}
                                                minLength={8}
                                                required
                                                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4F24] placeholder-gray-400 bg-white text-black ${errors.subject ? 'border-red-500' : ''}`}
                                            />
                                            {errors.subject && (
                                                <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
                                            )}
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder="Enter your details here..."
                                                value={data.details}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('details', e.target.value)}
                                                className="w-full min-h-[150px] text-black placeholder-gray-400 bg-white border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                            />
                                            {errors.details && (
                                                <p className="text-sm text-red-500 mt-1">{errors.details}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 h-12 bg-[#3A4F24] hover:bg-[#2c3a18] text-white rounded-lg"
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
                                                className="h-12"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
                {activeTab === 'submissions' && (
                    <div className="w-full max-w-full mx-auto">
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
                                                grievances.map((g: any) => (
                                                    <tr key={g.grievance_id} className="text-black">
                                                        <td className="px-6 py-4 font-semibold text-[#3A4F24] text-lg">{g.grievance_id}</td>
                                                        <td className="px-6 py-4 font-medium text-lg">{g.subject}</td>
                                                        <td className="px-6 py-4 capitalize text-lg">{g.type}</td>
                                                        <td className="px-6 py-4 max-w-2xl truncate text-lg" title={g.details}>{g.details.length > 60 ? g.details.slice(0, 60) + '...' : g.details}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block px-3 py-1 rounded text-base font-semibold ${g.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : g.status === 'Approved' ? 'bg-green-100 text-green-800' : g.status === 'Denied' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{g.status}</span>
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
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* View Modal */}
                                {viewModal.open && viewModal.grievance && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                        <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-2xl relative">
                                            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl" onClick={() => setViewModal({ open: false, grievance: null })}>
                                                <span className="text-3xl">&times;</span>
                                            </button>
                                            <h2 className="text-3xl font-bold mb-6 text-[#3A4F24]">Grievance Details</h2>
                                            <div className="space-y-4 text-lg text-black">
                                                <div><span className="font-semibold">Grievance ID:</span> {viewModal.grievance.grievance_id}</div>
                                                <div><span className="font-semibold">Subject:</span> {viewModal.grievance.subject}</div>
                                                <div><span className="font-semibold">Type:</span> {viewModal.grievance.type}</div>
                                                <div><span className="font-semibold">Status:</span> {viewModal.grievance.status}</div>
                                                <div><span className="font-semibold">Date:</span> {viewModal.grievance.created_at}</div>
                                                <div><span className="font-semibold">Details:</span> <div className="whitespace-pre-line border rounded p-4 mt-2 bg-gray-50 text-lg text-black">{viewModal.grievance.details}</div></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
                {activeTab === 'profile' && (
                    <div className="w-full flex items-center justify-center min-h-[600px]">
                        <Card className="bg-white w-full max-w-2xl">
                            <CardHeader>
                                <CardTitle className="text-2xl text-[#3A4F24]">Update Profile</CardTitle>
                                <p className="text-gray-600 mt-2">Update your account information and password</p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <label className="block text-base font-medium text-gray-700 mb-2">Student ID</label>
                                        <input
                                            type="text"
                                            value={student_id}
                                            disabled
                                            className="w-full border rounded-lg px-4 py-3 text-base bg-gray-100 text-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-base font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => handleProfileDataChange('email', e.target.value)}
                                            required
                                            className="w-full border rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                        />
                                        {profileErrors.email && <div className="text-red-500 text-sm mt-1">{profileErrors.email}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-base font-medium text-gray-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            value={profileData.current_password}
                                            onChange={(e) => handleProfileDataChange('current_password', e.target.value)}
                                            required
                                            className="w-full border rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                            placeholder="Enter your current password"
                                        />
                                        {profileErrors.current_password && <div className="text-red-500 text-sm mt-1">{profileErrors.current_password}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-base font-medium text-gray-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            value={profileData.password}
                                            onChange={(e) => handleProfileDataChange('password', e.target.value)}
                                            className="w-full border rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                            placeholder="Leave blank to keep current password"
                                        />
                                        {profileErrors.password && <div className="text-red-500 text-sm mt-1">{profileErrors.password}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-base font-medium text-gray-700 mb-2">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={profileData.password_confirmation}
                                            onChange={(e) => handleProfileDataChange('password_confirmation', e.target.value)}
                                            className="w-full border rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                            placeholder="Confirm your new password"
                                        />
                                        {profileErrors.password_confirmation && <div className="text-red-500 text-sm mt-1">{profileErrors.password_confirmation}</div>}
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-base font-medium text-gray-700">Verification Code</label>
                                            <button
                                                type="button"
                                                onClick={refreshCaptcha}
                                                className="flex items-center gap-1 px-3 py-2 border border-[#3A4F24] rounded-lg bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#3A4F24] transition-colors duration-150"
                                                aria-label="Refresh verification code"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                <span className="font-medium">Refresh</span>
                                            </button>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg mb-3 text-center">
                                            <span className="font-mono text-2xl tracking-wider text-[#3A4F24]">{captcha}</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={profileData.captcha}
                                            onChange={(e) => handleProfileDataChange('captcha', e.target.value)}
                                            required
                                            className="w-full border rounded-lg px-4 py-3 text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A4F24]"
                                            placeholder="Enter the verification code shown above"
                                        />
                                        {profileErrors.captcha && <div className="text-red-500 text-sm mt-1">{profileErrors.captcha}</div>}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={profileProcessing}
                                        className="w-full h-14 text-lg bg-[#3A4F24] hover:bg-[#2c3a18] text-white rounded-lg"
                                    >
                                        {profileProcessing ? 'Updating...' : 'Update Profile'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                )}

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
            </main>
        </div>
    );
}
