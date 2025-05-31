import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, BarChart3, FileText, History, Settings, Bell, TrendingUp, Activity, Zap, Gauge, Eye, Download, Loader2, CheckCircle, Archive as ArchiveIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
} from 'chart.js';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Grievance {
    id: number;
    grievance_id: string;
    category: string;
    status: string;
    subject: string;
    created_at: string;
    message: string;
    attachment_path?: string;
}

interface Analytics {
    submissionVolume: {
        total: number;
        thisMonth: number;
        thisWeek: number;
        byCategory: Record<string, number>;
        trend: Record<string, number>;
    };
    statusBreakdown: {
        counts: Record<string, number>;
        avgTimeInStatus: Record<string, number>;
    };
    resolutionMetrics: {
        avgResolutionTime: number;
        fastest: Array<{ grievance_id: string; subject: string; created_at: string; updated_at: string }>;
        slowest: Array<{ grievance_id: string; subject: string; created_at: string; updated_at: string }>;
        percentWithinSLA: number;
    };
    userEngagement: {
        mostActiveUsers: Array<{ id: number; email: string; student_id: string; grievances_count: number }>;
        repeatSubmitters: Array<{ id: number; email: string; student_id: string; grievances_count: number }>;
        byUserType: Record<string, number>;
    };
    adminPerformance: {
        handledPerAdmin: Array<{ admin: string; count: number }>;
        avgResponseTime: number;
    };
    trendingTopics: Record<string, number>;
}

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        underReview: 0,
        resolved: 0,
        archived: 0
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        status: 'all'
    });

    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [analytics, setAnalytics] = useState<Analytics | null>(null);

    const [resolutionModal, setResolutionModal] = useState<{ open: boolean; grievanceId: number | null; message: string }>({ open: false, grievanceId: null, message: '' });

    useEffect(() => {
        console.log('Initial activeTab:', activeTab);
        fetchDashboardData();
        fetchGrievances();
        if (activeTab === 'analytics') {
            axios.get(route('admin.analytics')).then(res => {
                console.log('Analytics API response:', res.data);
                setAnalytics(res.data);
            });
        }
    }, [filters, activeTab]);

    useEffect(() => {
        console.log('activeTab changed to:', activeTab);
    }, [activeTab]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(route('admin.dashboard.stats'));
            setStats(response.data.stats);
            setRecentActivity(response.data.recentActivity);
            setChartData(response.data.chartData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to fetch dashboard data');
        }
    };

    const fetchGrievances = async () => {
        try {
            setIsLoading(true);
            const params = {
                ...filters,
                category: filters.category === 'all' ? '' : filters.category,
                status: filters.status === 'all' ? '' : filters.status
            };
            console.log('Fetching grievances with params:', params);
            const response = await axios.get(route('admin.grievances.index'), { params });
            console.log('Grievances response:', response.data);
            if (Array.isArray(response.data)) {
                setGrievances(response.data);
            } else {
                console.error('Invalid response format:', response.data);
                toast.error('Invalid data format received');
            }
        } catch (error) {
            console.error('Error fetching grievances:', error);
            toast.error('Failed to fetch grievances');
            setGrievances([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        router.post(route('logout'), {}, {
            onSuccess: () => {
                window.location.href = '/';
            }
        });
    };

    const handleStatusChange = async (id: number, status: string) => {
        console.log('handleStatusChange called with:', { id, status });
        try {
            setIsLoading(true);
            if (status === 'resolved') {
                console.log('Opening resolution modal for grievance:', id);
                setResolutionModal({ open: true, grievanceId: id, message: '' });
                return;
            }
            
            const response = await axios.put(route('admin.grievances.update', { id }), { status });
            console.log('Status update response:', response.data);
            if (response.data.message) {
                setGrievances(prevGrievances =>
                    prevGrievances.map(grievance =>
                        grievance.id === id ? { ...grievance, status } : grievance
                    )
                );
                toast.success('Status updated successfully');
            }
        } catch (error) {
            console.error('Error updating grievance status:', error);
            toast.error('Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!resolutionModal.message.trim()) {
            toast.error('Please provide a resolution message');
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.put(route('admin.grievances.update', { id: resolutionModal.grievanceId }), {
                status: 'resolved',
                resolution_message: resolutionModal.message
            });
            
            if (response.data.message) {
                setGrievances(prevGrievances =>
                    prevGrievances.map(grievance =>
                        grievance.id === resolutionModal.grievanceId 
                            ? { ...grievance, status: 'resolved' } 
                            : grievance
                    )
                );
                toast.success('Grievance resolved successfully');
                setResolutionModal({ open: false, grievanceId: null, message: '' });
            }
        } catch (error) {
            console.error('Error resolving grievance:', error);
            toast.error('Failed to resolve grievance');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (id: number) => {
        try {
            const response = await axios.get(route('grievance.attachment.download', { grievance_id: id }), {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `grievance-${id}-attachment`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Attachment downloaded successfully');
        } catch (error) {
            console.error('Error downloading attachment:', error);
            toast.error('Failed to download attachment');
        }
    };

    const handleArchive = async (id: number) => {
        try {
            setIsLoading(true);
            const response = await axios.put(route('admin.grievances.update', { id }), { status: 'archived' });
            if (response.data.message) {
                setGrievances(prevGrievances =>
                    prevGrievances.map(grievance =>
                        grievance.id === id ? { ...grievance, status: 'archived' } : grievance
                    )
                );
                toast.success('Grievance archived successfully');
            }
        } catch (error) {
            console.error('Error archiving grievance:', error);
            toast.error('Failed to archive grievance');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                                            <h3 className="text-2xl font-bold text-[#3A4F24]">{stats.total}</h3>
                                        </div>
                                        <Activity className="h-8 w-8 text-[#3A4F24]" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Pending</p>
                                            <h3 className="text-2xl font-bold text-yellow-500">{stats.pending}</h3>
                                        </div>
                                        <Bell className="h-8 w-8 text-yellow-500" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Under Review</p>
                                            <h3 className="text-2xl font-bold text-blue-500">{stats.underReview}</h3>
                                        </div>
                                        <Activity className="h-8 w-8 text-blue-500" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                                            <h3 className="text-2xl font-bold text-green-500">{stats.resolved}</h3>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Archived</p>
                                            <h3 className="text-2xl font-bold text-gray-500">{stats.archived}</h3>
                                        </div>
                                        <History className="h-8 w-8 text-gray-500" />
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-[#3A4F24]" />
                                            <p className="text-sm font-medium text-gray-600">Quick Actions</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button 
                                                className="w-full bg-[#3A4F24] hover:bg-[#2c3a18] text-white text-sm py-1"
                                                onClick={() => setActiveTab('grievances')}
                                            >
                                                View Pending
                                            </Button>
                                            <Button className="w-full bg-[#3A4F24] hover:bg-[#2c3a18] text-white text-sm py-1">
                                                Generate Report
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Feedback Trend Chart */}
                        <Card className="bg-white mb-8">
                            <CardHeader>
                                <CardTitle className="text-[#3A4F24] flex items-center">
                                    <TrendingUp className="mr-2 h-5 w-5" /> Feedback Trend
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <Line
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    ticks: {
                                                        stepSize: 1
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity and System Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Recent Activity */}
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="text-[#3A4F24] flex items-center">
                                        <Bell className="mr-2 h-5 w-5" /> Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recentActivity.map((activity: any, index: number) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-500" />
                                                <div>
                                                    <p className="text-sm text-gray-600">{activity.description}</p>
                                                    <p className="text-xs text-gray-400">{activity.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* System Overview */}
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="text-[#3A4F24] flex items-center">
                                        <Gauge className="mr-2 h-5 w-5" /> System Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">System Status</p>
                                            <p className="text-sm text-green-500">All systems operational</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Last Backup</p>
                                            <p className="text-sm text-gray-600">2 hours ago</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                );
            case 'grievances':
                console.log('Rendering Grievance Management tab');
                return (
                    <Card className="mb-8 bg-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[#3A4F24]">Grievance Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <Input
                                        placeholder="Search grievances..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        className="max-w-sm"
                                    />
                                    <Select
                                        value={filters.category}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white border-[#3A4F24] hover:bg-[#2c3a18]">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="complaint">Complaint</SelectItem>
                                            <SelectItem value="feedback">Feedback</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white border-[#3A4F24] hover:bg-[#2c3a18]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="under_review">Under Review</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {isLoading ? (
                                    <div className="flex justify-center items-center h-32">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#3A4F24]" />
                                    </div>
                                ) : grievances.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No grievances found
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-lg shadow">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-black">ID</TableHead>
                                                    <TableHead className="text-black">Category</TableHead>
                                                    <TableHead className="text-black">Status</TableHead>
                                                    <TableHead className="text-black">Subject</TableHead>
                                                    <TableHead className="text-black">Created At</TableHead>
                                                    <TableHead className="text-black">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {grievances.filter(g => g.status !== 'resolved' && g.status !== 'archived').map((grievance) => {
                                                    console.log('Rendering grievance:', grievance.id, 'Status:', grievance.status);
                                                    return (
                                                    <TableRow key={grievance.id} className="text-black">
                                                        <TableCell className="text-black">{grievance.grievance_id}</TableCell>
                                                        <TableCell className="capitalize text-black">{grievance.category}</TableCell>
                                                        <TableCell>
                                                            {grievance.status !== 'resolved' && grievance.status !== 'archived' ? (
                                                                <Select
                                                                    value={grievance.status}
                                                                    onValueChange={(value) => handleStatusChange(grievance.id, value)}
                                                                >
                                                                    <SelectTrigger className="w-[140px] text-black capitalize bg-transparent border-none shadow-none">
                                                                        <SelectValue placeholder="Change Status" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="pending">Pending</SelectItem>
                                                                        <SelectItem value="under_review">Under Review</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    grievance.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                                                    grievance.status === 'archived' ? 'bg-gray-100 text-gray-800' :
                                                                    grievance.status === 'under_review' ? 'bg-orange-400 text-orange-800' :
                                                                    'bg-yellow-400 text-yellow-800'
                                                                }`}>
                                                                    {grievance.status.replace('_', ' ').toUpperCase()}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-black">{grievance.subject}</TableCell>
                                                        <TableCell className="text-black">{new Date(grievance.created_at).toLocaleDateString()}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setSelectedGrievance(grievance);
                                                                        setIsModalOpen(true);
                                                                    }}
                                                                    title="View Details"
                                                                    className="text-black"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                {grievance.attachment_path && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleDownload(grievance.id)}
                                                                        title="Download Attachment"
                                                                        className="text-black"
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                {grievance.status !== 'resolved' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleStatusChange(grievance.id, 'resolved')}
                                                                        title="Resolve Grievance"
                                                                        className="text-black"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                                {grievance.status !== 'archived' && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => handleArchive(grievance.id)}
                                                                        title="Archive Grievance"
                                                                        className="text-black"
                                                                    >
                                                                        <ArchiveIcon className="h-4 w-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            case 'resolved':
                return (
                    <Card className="mb-8 bg-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[#3A4F24]">Resolved Grievances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <Input
                                    placeholder="Search grievances..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="max-w-sm"
                                />
                                <Select
                                    value={filters.category}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white border-[#3A4F24] hover:bg-[#2c3a18]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="academic">Academic</SelectItem>
                                        <SelectItem value="administrative">Administrative</SelectItem>
                                        <SelectItem value="financial">Financial</SelectItem>
                                        <SelectItem value="facilities">Facilities</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white border-[#3A4F24] hover:bg-[#2c3a18]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-black">ID</TableHead>
                                        <TableHead className="text-black">Category</TableHead>
                                        <TableHead className="text-black">Status</TableHead>
                                        <TableHead className="text-black">Subject</TableHead>
                                        <TableHead className="text-black">Date Submitted</TableHead>
                                        <TableHead className="text-black">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grievances.filter(g =>
                                        g.status === 'resolved' &&
                                        (filters.category === 'all' || g.category === filters.category) &&
                                        (filters.status === 'all' || g.status === filters.status) &&
                                        (filters.search === '' || g.subject.toLowerCase().includes(filters.search.toLowerCase()) || g.grievance_id.toLowerCase().includes(filters.search.toLowerCase()))
                                    ).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">No resolved grievances found</TableCell>
                                        </TableRow>
                                    ) : (
                                        grievances.filter(g =>
                                            g.status === 'resolved' &&
                                            (filters.category === 'all' || g.category === filters.category) &&
                                            (filters.status === 'all' || g.status === filters.status) &&
                                            (filters.search === '' || g.subject.toLowerCase().includes(filters.search.toLowerCase()) || g.grievance_id.toLowerCase().includes(filters.search.toLowerCase()))
                                        ).map((grievance) => (
                                            <TableRow key={grievance.id}>
                                                <TableCell className="text-black">{grievance.grievance_id}</TableCell>
                                                <TableCell className="capitalize text-black">{grievance.category}</TableCell>
                                                <TableCell className="text-black">{grievance.status}</TableCell>
                                                <TableCell className="text-black">{grievance.subject}</TableCell>
                                                <TableCell className="text-black">{new Date(grievance.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-black">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedGrievance(grievance);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {grievance.attachment_path && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDownload(grievance.id)}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            case 'archived':
                return (
                    <Card className="mb-8 bg-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-[#3A4F24]">Archived Grievances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-6">
                                <Input
                                    placeholder="Search grievances..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="max-w-sm"
                                />
                                <Select
                                    value={filters.category}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white border-[#3A4F24] hover:bg-[#2c3a18]">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="academic">Academic</SelectItem>
                                        <SelectItem value="administrative">Administrative</SelectItem>
                                        <SelectItem value="financial">Financial</SelectItem>
                                        <SelectItem value="facilities">Facilities</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white border-[#3A4F24] hover:bg-[#2c3a18]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-black">ID</TableHead>
                                        <TableHead className="text-black">Category</TableHead>
                                        <TableHead className="text-black">Status</TableHead>
                                        <TableHead className="text-black">Subject</TableHead>
                                        <TableHead className="text-black">Date Submitted</TableHead>
                                        <TableHead className="text-black">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grievances.filter(g =>
                                        g.status === 'archived' &&
                                        (filters.category === 'all' || g.category === filters.category) &&
                                        (filters.status === 'all' || g.status === filters.status) &&
                                        (filters.search === '' || g.subject.toLowerCase().includes(filters.search.toLowerCase()) || g.grievance_id.toLowerCase().includes(filters.search.toLowerCase()))
                                    ).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">No archived grievances found</TableCell>
                                        </TableRow>
                                    ) : (
                                        grievances.filter(g =>
                                            g.status === 'archived' &&
                                            (filters.category === 'all' || g.category === filters.category) &&
                                            (filters.status === 'all' || g.status === filters.status) &&
                                            (filters.search === '' || g.subject.toLowerCase().includes(filters.search.toLowerCase()) || g.grievance_id.toLowerCase().includes(filters.search.toLowerCase()))
                                        ).map((grievance) => (
                                            <TableRow key={grievance.id}>
                                                <TableCell className="text-black">{grievance.grievance_id}</TableCell>
                                                <TableCell className="capitalize text-black">{grievance.category}</TableCell>
                                                <TableCell className="text-black">{grievance.status}</TableCell>
                                                <TableCell className="text-black">{grievance.subject}</TableCell>
                                                <TableCell className="text-black">{new Date(grievance.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-black">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setSelectedGrievance(grievance);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {grievance.attachment_path && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDownload(grievance.id)}
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                );
            case 'analytics':
                if (!analytics) {
                    return (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-[#3A4F24]" />
                        </div>
                    );
                }
                const avgResolutionTimeNum: number = Number(analytics.resolutionMetrics.avgResolutionTime ?? 0);
                return (
                    <div className="space-y-8">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            <Card className="bg-white"><CardContent className="p-6"><div><p className="text-sm font-medium text-black">Total Grievances</p><h3 className="text-2xl font-bold text-black">{analytics.submissionVolume.total}</h3></div></CardContent></Card>
                            <Card className="bg-white"><CardContent className="p-6"><div><p className="text-sm font-medium text-black">This Month</p><h3 className="text-2xl font-bold text-black">{analytics.submissionVolume.thisMonth}</h3></div></CardContent></Card>
                            <Card className="bg-white"><CardContent className="p-6"><div><p className="text-sm font-medium text-black">This Week</p><h3 className="text-2xl font-bold text-black">{analytics.submissionVolume.thisWeek}</h3></div></CardContent></Card>
                            <Card className="bg-white"><CardContent className="p-6"><div><p className="text-sm font-medium text-black">% Resolved in SLA</p><h3 className="text-2xl font-bold text-black">{analytics.resolutionMetrics.percentWithinSLA}%</h3></div></CardContent></Card>
                            <Card className="bg-white"><CardContent className="p-6"><div><p className="text-sm font-medium text-black">Avg. Resolution Time</p><h3 className="text-2xl font-bold text-black">{Number.isFinite(avgResolutionTimeNum) ? (avgResolutionTimeNum as number).toFixed(1) + ' hrs' : 'N/A'}</h3></div></CardContent></Card>
                        </div>
                        {/* Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Submissions Over Time</CardTitle></CardHeader><CardContent><div className="h-[300px] w-full"><Line data={{ labels: Object.keys(analytics.submissionVolume.trend), datasets: [{ label: 'Submissions', data: Object.values(analytics.submissionVolume.trend), borderColor: '#3A4F24', backgroundColor: 'rgba(58, 79, 36, 0.1)', tension: 0.4 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'black' } } }, scales: { x: { ticks: { color: 'black' } }, y: { ticks: { color: 'black' } } } }} /></div></CardContent></Card>
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Submissions by Category</CardTitle></CardHeader><CardContent><div className="h-[300px] w-full"><Pie data={{ labels: Object.keys(analytics.submissionVolume.byCategory), datasets: [{ data: Object.values(analytics.submissionVolume.byCategory), backgroundColor: ['#3A4F24', '#5B7B3A', '#A3B18A', '#D9ED92', '#B5C99A'] }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'black' } } } }} /></div></CardContent></Card>
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Status Distribution</CardTitle></CardHeader><CardContent><div className="h-[300px] w-full"><Pie data={{ labels: Object.keys(analytics.statusBreakdown.counts), datasets: [{ data: Object.values(analytics.statusBreakdown.counts), backgroundColor: ['#FFD700', '#1E90FF', '#32CD32', '#A9A9A9'] }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'black' } } } }} /></div></CardContent></Card>
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Avg. Time in Each Status (hrs)</CardTitle></CardHeader><CardContent><div className="h-[300px] w-full"><Bar data={{ labels: Object.keys(analytics.statusBreakdown.avgTimeInStatus), datasets: [{ label: 'Avg. Time (hrs)', data: Object.values(analytics.statusBreakdown.avgTimeInStatus).map(v => v !== null && v !== undefined ? Number(v).toFixed(1) : 0), backgroundColor: '#3A4F24' }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'black' } } }, scales: { x: { ticks: { color: 'black' } }, y: { ticks: { color: 'black' } } } }} /></div></CardContent></Card>
                        </div>
                        {/* Tables/Lists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Fastest Resolved</CardTitle></CardHeader><CardContent><ul className="divide-y divide-gray-200">{analytics.resolutionMetrics.fastest.map((g: any, i: number) => (<li key={i} className="py-2 text-sm text-black">{g.grievance_id} - {g.subject} ({g.created_at} → {g.updated_at})</li>))}</ul></CardContent></Card>
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Slowest Resolved</CardTitle></CardHeader><CardContent><ul className="divide-y divide-gray-200">{analytics.resolutionMetrics.slowest.map((g: any, i: number) => (<li key={i} className="py-2 text-sm text-black">{g.grievance_id} - {g.subject} ({g.created_at} → {g.updated_at})</li>))}</ul></CardContent></Card>
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Most Active Users</CardTitle></CardHeader><CardContent><ul className="divide-y divide-gray-200">{analytics.userEngagement.mostActiveUsers.map((u: any, i: number) => (<li key={i} className="py-2 text-sm text-black">{u.email} ({u.grievances_count} grievances)</li>))}</ul></CardContent></Card>
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Repeat Submitters</CardTitle></CardHeader><CardContent><ul className="divide-y divide-gray-200">{analytics.userEngagement.repeatSubmitters.map((u: any, i: number) => (<li key={i} className="py-2 text-sm text-black">{u.email} ({u.grievances_count} grievances)</li>))}</ul></CardContent></Card>
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Feedback by User Type</CardTitle></CardHeader><CardContent><ul className="divide-y divide-gray-200">{Object.entries(analytics.userEngagement.byUserType).map(([type, count]: any, i: number) => (<li key={i} className="py-2 text-sm text-black">{type}: {count}</li>))}</ul></CardContent></Card>
                            <Card className="bg-white"><CardHeader><CardTitle className="text-black">Grievances Handled per Admin</CardTitle></CardHeader><CardContent><ul className="divide-y divide-gray-200">{analytics.adminPerformance.handledPerAdmin.map((a: any, i: number) => (<li key={i} className="py-2 text-sm text-black">{a.admin}: {a.count}</li>))}</ul></CardContent></Card>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white">
            <Head title="Admin Dashboard" />
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
                        <div className="text-xs text-gray-500">Admin Panel</div>
                        <div className="font-bold text-[#3A4F24] text-lg">Dashboard</div>
                    </motion.div>
                    <nav className="flex flex-col gap-2">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${
                                activeTab === 'dashboard' 
                                    ? 'bg-[#3A4F24] text-white border-[#3A4F24]' 
                                    : 'bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]'
                            }`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${
                                activeTab === 'analytics' 
                                    ? 'bg-[#3A4F24] text-white border-[#3A4F24]' 
                                    : 'bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]'
                            }`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <BarChart3 className="mr-2 h-5 w-5" /> Analytics
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${
                                activeTab === 'grievances' 
                                    ? 'bg-[#3A4F24] text-white border-[#3A4F24]' 
                                    : 'bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]'
                            }`}
                            onClick={() => setActiveTab('grievances')}
                        >
                            <FileText className="mr-2 h-5 w-5" /> Grievances
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${
                                activeTab === 'resolved' 
                                    ? 'bg-[#3A4F24] text-white border-[#3A4F24]' 
                                    : 'bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]'
                            }`}
                            onClick={() => setActiveTab('resolved')}
                        >
                            <CheckCircle className="mr-2 h-5 w-5" /> Resolved
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${
                                activeTab === 'archived' 
                                    ? 'bg-[#3A4F24] text-white border-[#3A4F24]' 
                                    : 'bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]'
                            }`}
                            onClick={() => setActiveTab('archived')}
                        >
                            <ArchiveIcon className="mr-2 h-5 w-5" /> Archived
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 ${
                                activeTab === 'audit' 
                                    ? 'bg-[#3A4F24] text-white border-[#3A4F24]' 
                                    : 'bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]'
                            }`}
                            onClick={() => setActiveTab('audit')}
                        >
                            <History className="mr-2 h-5 w-5" /> Audit Logs
                        </Button>
                    </nav>
                </div>
                <motion.form
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    method="POST"
                    action={route('logout')}
                    onSubmit={(e: FormEvent) => {
                        e.preventDefault();
                        handleLogout();
                    }}
                    className="mt-8"
                >
                    <Button 
                        type="submit" 
                        variant="outline" 
                        className="w-full justify-start text-base h-14 px-6 font-semibold border-2 border-[#3A4F24] bg-[#3A4F24] text-white hover:bg-[#2c3a18] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24] transition-colors duration-150"
                    >
                        <LogOut className="mr-2 h-5 w-5" /> Logout
                    </Button>
                </motion.form>
            </motion.aside>

            {/* Main Content */}
            <motion.main 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex-1 p-8"
            >
                {renderContent()}
            </motion.main>

            {/* Grievance Details Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Grievance Details</DialogTitle>
                    </DialogHeader>
                    {selectedGrievance && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Subject</h3>
                                <p>{selectedGrievance.subject}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Message</h3>
                                <p className="whitespace-pre-wrap">{selectedGrievance.message}</p>
                            </div>
                            {selectedGrievance.attachment_path && (
                                <div>
                                    <h3 className="font-semibold">Attachment</h3>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownload(selectedGrievance.id)}
                                        className="mt-2"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Attachment
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Resolution Modal */}
            <Dialog open={resolutionModal.open} onOpenChange={(open) => !open && setResolutionModal({ open: false, grievanceId: null, message: '' })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Resolve Grievance</DialogTitle>
                        <DialogDescription>
                            Please provide a resolution message for this grievance.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="resolution-message">Resolution Message</Label>
                        <Textarea
                            id="resolution-message"
                            value={resolutionModal.message}
                            onChange={(e) => setResolutionModal(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Enter the resolution message..."
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setResolutionModal({ open: false, grievanceId: null, message: '' })}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResolve}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Resolve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 