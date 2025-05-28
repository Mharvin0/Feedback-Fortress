import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Eye, Download, Archive, FileText, Filter, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

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

export default function AdminGrievances() {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        search: ''
    });

    useEffect(() => {
        fetchGrievances();
    }, [filters]);

    const fetchGrievances = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(route('admin.grievances.index'), {
                params: filters
            });
            setGrievances(response.data);
        } catch (error) {
            console.error('Error fetching grievances:', error);
            toast.error('Failed to fetch grievances');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (grievanceId: number, newStatus: string) => {
        try {
            await axios.put(route('admin.grievances.update', grievanceId), {
                status: newStatus
            });
            toast.success('Status updated successfully');
            fetchGrievances();
            if (selectedGrievance?.id === grievanceId) {
                setSelectedGrievance({ ...selectedGrievance, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleArchive = async (grievanceId: number) => {
        try {
            await axios.put(route('admin.grievances.archive', grievanceId));
            toast.success('Grievance archived successfully');
            fetchGrievances();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error archiving grievance:', error);
            toast.error('Failed to archive grievance');
        }
    };

    const handleDownload = async (grievanceId: number) => {
        try {
            const response = await axios.get(route('grievance.attachment.download', grievanceId), {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `grievance-${grievanceId}-attachment`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Attachment downloaded successfully');
        } catch (error) {
            console.error('Error downloading attachment:', error);
            toast.error('Failed to download attachment');
        }
    };

    return (
        <div className="p-8">
            <Head title="Admin Grievances" />

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#3A4F24]">Grievances Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search grievances..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full"
                            />
                        </div>
                        <Select
                            value={filters.category}
                            onValueChange={(value) => setFilters({ ...filters, category: value })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Categories</SelectItem>
                                <SelectItem value="academic">Academic</SelectItem>
                                <SelectItem value="administrative">Administrative</SelectItem>
                                <SelectItem value="facilities">Facilities</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.status}
                            onValueChange={(value) => setFilters({ ...filters, status: value })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-[#3A4F24]" />
                        </div>
                    ) : (
                        <Table className="text-black">
                            <TableHeader className="text-black">
                                <TableRow className="text-black">
                                    <TableHead style={{ color: '#000' }}>ID</TableHead>
                                    <TableHead style={{ color: '#000' }}>Category</TableHead>
                                    <TableHead style={{ color: '#000' }}>Status</TableHead>
                                    <TableHead style={{ color: '#000' }}>Subject</TableHead>
                                    <TableHead style={{ color: '#000' }}>Date Submitted</TableHead>
                                    <TableHead style={{ color: '#000' }}>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="text-black">
                                {grievances.length === 0 ? (
                                    <TableRow className="text-black">
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500" style={{ color: '#000' }}>
                                            No grievances found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    grievances.map((grievance) => (
                                        <TableRow key={grievance.id} className="text-black">
                                            <TableCell style={{ color: '#000' }}>{grievance.grievance_id}</TableCell>
                                            <TableCell className="capitalize" style={{ color: '#000' }}>{grievance.category}</TableCell>
                                            <TableCell style={{ color: '#000' }}>
                                                <Select
                                                    value={grievance.status}
                                                    onValueChange={(value) => handleStatusChange(grievance.id, value)}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="under_review">Under Review</SelectItem>
                                                        <SelectItem value="resolved">Resolved</SelectItem>
                                                        <SelectItem value="archived">Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell style={{ color: '#000' }}>{grievance.subject}</TableCell>
                                            <TableCell style={{ color: '#000' }}>{new Date(grievance.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell style={{ color: '#000' }}>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
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
                                                            size="sm"
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
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Grievance Details</DialogTitle>
                        <DialogDescription>
                            Grievance ID: {selectedGrievance?.grievance_id}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Subject</h3>
                            <p className="text-black">{selectedGrievance?.subject}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Message</h3>
                            <p className="whitespace-pre-wrap text-black">{selectedGrievance?.message}</p>
                        </div>
                        {selectedGrievance?.attachment_path && (
                            <div>
                                <h3 className="font-semibold mb-2">Attachment</h3>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDownload(selectedGrievance.id)}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Download Attachment
                                </Button>
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => handleArchive(selectedGrievance?.id!)}
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive Submission
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 