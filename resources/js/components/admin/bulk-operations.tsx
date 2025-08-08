import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
    Filter, 
    Download, 
    Archive, 
    CheckCircle, 
    Clock, 
    AlertTriangle,
    Users,
    FileText,
    Search,
    MoreHorizontal,
    Trash2,
    Send,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Grievance {
    id: number;
    grievance_id: string;
    category: string;
    status: string;
    subject: string;
    created_at: string;
    message: string;
    priority?: string;
}

interface BulkOperationsProps {
    grievances: Grievance[];
    onBulkAction: (action: string, selectedIds: number[]) => void;
    onFilterChange: (filters: any) => void;
    isLoading?: boolean;
}

export default function BulkOperations({ 
    grievances, 
    onBulkAction, 
    onFilterChange, 
    isLoading = false 
}: BulkOperationsProps) {
    const [selectedGrievances, setSelectedGrievances] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        status: 'all',
        priority: 'all',
        dateRange: 'all'
    });

    const [bulkAction, setBulkAction] = useState<string>('');

    const handleSelectAll = () => {
        if (selectedGrievances.length === grievances.length) {
            setSelectedGrievances([]);
        } else {
            setSelectedGrievances(grievances.map(g => g.id));
        }
    };

    const handleSelectGrievance = (id: number) => {
        setSelectedGrievances(prev => 
            prev.includes(id) 
                ? prev.filter(gId => gId !== id)
                : [...prev, id]
        );
    };

    const handleBulkAction = () => {
        if (!bulkAction) {
            toast.error('Please select an action');
            return;
        }
        if (selectedGrievances.length === 0) {
            toast.error('Please select at least one grievance');
            return;
        }
        onBulkAction(bulkAction, selectedGrievances);
        setSelectedGrievances([]);
        setBulkAction('');
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'under_review': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'archived': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'normal': return 'bg-blue-100 text-blue-800';
            case 'low': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredGrievances = grievances.filter(grievance => {
        const matchesSearch = grievance.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
                             grievance.grievance_id.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = filters.category === 'all' || grievance.category === filters.category;
        const matchesStatus = filters.status === 'all' || grievance.status === filters.status;
        const matchesPriority = filters.priority === 'all' || grievance.priority === filters.priority;
        
        return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });

    return (
        <div className="space-y-6">
            {/* Enhanced Filters */}
            <Card className="bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            <Filter className="inline mr-2 h-5 w-5 text-[#3A4F24]" />
                            Grievance Management
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="border-[#3A4F24] text-[#3A4F24] hover:bg-[#3A4F24] hover:text-white"
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </Button>
                            <Badge variant="outline" className="bg-[#3A4F24] text-white">
                                {filteredGrievances.length} grievances
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Search and Quick Filters */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search grievances by ID, subject, or content..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Select
                                value={filters.category}
                                onValueChange={(value) => handleFilterChange('category', value)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="complaint">Complaint</SelectItem>
                                    <SelectItem value="feedback">Feedback</SelectItem>
                                    <SelectItem value="suggestion">Suggestion</SelectItem>
                                    <SelectItem value="inquiry">Inquiry</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.status}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
                                <SelectTrigger className="w-[140px]">
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

                            <Select
                                value={filters.priority}
                                onValueChange={(value) => handleFilterChange('priority', value)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="border-t pt-4"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date Range
                                        </label>
                                        <Select
                                            value={filters.dateRange}
                                            onValueChange={(value) => handleFilterChange('dateRange', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Date Range" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Time</SelectItem>
                                                <SelectItem value="today">Today</SelectItem>
                                                <SelectItem value="week">This Week</SelectItem>
                                                <SelectItem value="month">This Month</SelectItem>
                                                <SelectItem value="quarter">This Quarter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bulk Actions Bar */}
                    <AnimatePresence>
                        {selectedGrievances.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4"
                            >
                                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <Checkbox
                                            checked={selectedGrievances.length === filteredGrievances.length}
                                            onCheckedChange={handleSelectAll}
                                        />
                                        <span className="text-sm font-medium text-blue-900">
                                            {selectedGrievances.length} of {filteredGrievances.length} selected
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Select
                                            value={bulkAction}
                                            onValueChange={setBulkAction}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mark_review">Mark as Under Review</SelectItem>
                                                <SelectItem value="resolve">Resolve Selected</SelectItem>
                                                <SelectItem value="archive">Archive Selected</SelectItem>
                                                <SelectItem value="delete">Delete Selected</SelectItem>
                                                <SelectItem value="export">Export Selected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        
                                        <Button
                                            onClick={handleBulkAction}
                                            disabled={!bulkAction}
                                            className="bg-[#3A4F24] hover:bg-[#2c3a18] text-white"
                                        >
                                            Apply Action
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>

            {/* Grievances Table */}
            <Card className="bg-white">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        <Checkbox
                                            checked={selectedGrievances.length === filteredGrievances.length && filteredGrievances.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Subject</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-4"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredGrievances.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No grievances found matching your criteria
                                        </td>
                                    </tr>
                                ) : (
                                    filteredGrievances.map((grievance) => (
                                        <tr key={grievance.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <Checkbox
                                                    checked={selectedGrievances.includes(grievance.id)}
                                                    onCheckedChange={() => handleSelectGrievance(grievance.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {grievance.grievance_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate" title={grievance.subject}>
                                                    {grievance.subject}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="capitalize">
                                                    {grievance.category}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`capitalize ${getPriorityColor(grievance.priority || 'normal')}`}>
                                                    {grievance.priority || 'normal'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge className={`capitalize ${getStatusColor(grievance.status)}`}>
                                                    {grievance.status.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(grievance.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="View Details"
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Download Attachment"
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 