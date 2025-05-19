import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

export default function AdminDashboard() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="container py-6">
                <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
                <div className="rounded-lg border p-8">
                    <p className="text-muted-foreground">.</p>
                </div>
            </div>
        </>
    );
} 