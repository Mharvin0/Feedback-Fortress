import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Grievance {
    grievance_id: string;
    student_id: string;
    type: string;
    details: string;
    status: string;
    created_at: string;
}

interface Props {
    grievances: Grievance[];
}

export default function GrievancesIndex({ grievances }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'resolved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Grievances" />
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Grievances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Grievance ID</TableHead>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date Submitted</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {grievances.map((grievance) => (
                                    <TableRow key={grievance.grievance_id}>
                                        <TableCell className="font-medium">
                                            {grievance.grievance_id}
                                        </TableCell>
                                        <TableCell>{grievance.student_id}</TableCell>
                                        <TableCell className="capitalize">
                                            {grievance.type}
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {grievance.details}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getStatusColor(grievance.status)}
                                            >
                                                {grievance.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{grievance.created_at}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 