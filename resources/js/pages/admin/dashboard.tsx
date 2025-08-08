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
import EnhancedAnalytics from '@/components/admin/enhanced-analytics';
import BulkOperations from '@/components/admin/bulk-operations';

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
                    <BulkOperations
                        grievances={grievances}
                        onBulkAction={(action, selectedIds) => {
                            console.log('Bulk action:', action, 'Selected IDs:', selectedIds);
                            // Handle bulk actions
                            switch (action) {
                                case 'mark_review':
                                    selectedIds.forEach(id => handleStatusChange(id, 'under_review'));
                                    toast.success(`${selectedIds.length} grievances marked as under review`);
                                    break;
                                case 'resolve':
                                    selectedIds.forEach(id => handleStatusChange(id, 'resolved'));
                                    toast.success(`${selectedIds.length} grievances resolved`);
                                    break;
                                case 'archive':
                                    selectedIds.forEach(id => handleArchive(id));
                                    toast.success(`${selectedIds.length} grievances archived`);
                                    break;
                                case 'delete':
                                    selectedIds.forEach(id => {
                                        // Add delete functionality
                                        console.log('Deleting grievance:', id);
                                    });
                                    toast.success(`${selectedIds.length} grievances deleted`);
                                    break;
                                case 'export':
                                    // Add export functionality
                                    console.log('Exporting grievances:', selectedIds);
                                    toast.success(`Exporting ${selectedIds.length} grievances`);
                                    break;
                            }
                        }}
                        onFilterChange={(newFilters) => {
                            setFilters(prev => ({ ...prev, ...newFilters }));
                        }}
                        isLoading={isLoading}
                    />
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
                                    <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white hover:bg-[#2c3a18]">
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
                                    <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white hover:bg-[#2c3a18]">
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
                                    <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white hover:bg-[#2c3a18]">
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
                                    <SelectTrigger className="w-[180px] bg-[#3A4F24] text-white hover:bg-[#2c3a18]">
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
                return (
                    <EnhancedAnalytics 
                        data={analytics} 
                        isLoading={isLoading}
                    />
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
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${
                                activeTab === 'dashboard' 
                                    ? 'bg-[#3A4F24] text-white' 
                                    : 'bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white'
                            }`}
                            onClick={() => setActiveTab('dashboard')}
                        >
                            <LayoutDashboard className="mr-2 h-5 w-5" /> Dashboard
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${
                                activeTab === 'analytics' 
                                    ? 'bg-[#3A4F24] text-white' 
                                    : 'bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white'
                            }`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <BarChart3 className="mr-2 h-5 w-5" /> Analytics
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${
                                activeTab === 'grievances' 
                                    ? 'bg-[#3A4F24] text-white' 
                                    : 'bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white'
                            }`}
                            onClick={() => setActiveTab('grievances')}
                        >
                            <FileText className="mr-2 h-5 w-5" /> Grievances
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${
                                activeTab === 'resolved' 
                                    ? 'bg-[#3A4F24] text-white' 
                                    : 'bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white'
                            }`}
                            onClick={() => setActiveTab('resolved')}
                        >
                            <CheckCircle className="mr-2 h-5 w-5" /> Resolved
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${
                                activeTab === 'archived' 
                                    ? 'bg-[#3A4F24] text-white' 
                                    : 'bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white'
                            }`}
                            onClick={() => setActiveTab('archived')}
                        >
                            <ArchiveIcon className="mr-2 h-5 w-5" /> Archived
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-base h-14 px-6 font-semibold transition-colors duration-150 ${
                                activeTab === 'audit' 
                                    ? 'bg-[#3A4F24] text-white' 
                                    : 'bg-white text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white'
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
                        className="w-full justify-start text-base h-14 px-6 font-semibold bg-[#3A4F24] text-white hover:bg-[#2c3a18] hover:text-white focus:bg-[#3A4F24] focus:text-white transition-colors duration-150"
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