import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
    return (
        <div className="min-h-screen w-full bg-[#F8FAF9]">
            <Head title="Update Profile" />
            <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
                <Card className="bg-white max-w-lg w-full">
                    <CardHeader>
                        <CardTitle className="text-[#3A4F24]">Update Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Profile form will go here */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 