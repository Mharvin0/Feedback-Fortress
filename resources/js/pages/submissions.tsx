import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Grievance {
    grievance_id: string;
    type: string;
    details: string;
    status: string;
    created_at: string;
    subject: string;
}

export default function Submissions() {
    const { grievances = [], student_id } = usePage().props as any;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'Approved':
                return 'bg-green-100 text-green-800';
            case 'Denied':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#F8FAF9]">
            <Head title="Your Submissions" />
            <div className="container mx-auto p-4 flex flex-col items-center min-h-[60vh]">
                <Card className="bg-white w-full max-w-4xl">
                    <CardHeader>
                        <CardTitle className="text-[#3A4F24]">Your Submissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#F3F4F6]">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grievance ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {grievances.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center text-gray-400 py-8">No submissions found.</td>
                                        </tr>
                                    ) : (
                                        grievances.map((g: Grievance) => (
                                            <tr key={g.grievance_id}>
                                                <td className="px-4 py-3 font-semibold text-[#3A4F24]">{g.grievance_id}</td>
                                                <td className="px-4 py-3 font-medium">{g.subject}</td>
                                                <td className="px-4 py-3 capitalize">{g.type}</td>
                                                <td className="px-4 py-3 max-w-xs truncate" title={g.details}>{g.details.length > 60 ? g.details.slice(0, 60) + '...' : g.details}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(g.status)}`}>{g.status}</span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500">{g.created_at}</td>
                                                <td className="px-4 py-3">
                                                    <Button size="sm" variant="outline" className="text-[#3A4F24] border-[#3A4F24]">View</Button>
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
        </div>
    );
} 