import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { FormEvent } from 'react';

export default function AdminDashboard() {
    const handleLogout = () => {
        router.post(route('logout'), {}, {
            onSuccess: () => {
                window.location.href = '/';
            }
        });
    };

    return (
        <div className="min-h-screen w-full flex bg-[#F8FAF9]">
            <Head title="Admin Dashboard" />
            {/* Sidebar Navigation - Empty for now */}
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
                            className="w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 bg-[#3A4F24] text-white border-[#3A4F24]"
                        >
                            Dashboard
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]"
                        >
                            Charts
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]"
                        >
                            Grievance Management
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]"
                        >
                            Audit Logs
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-base h-14 px-6 font-semibold border-2 transition-colors duration-150 bg-white text-[#3A4F24] border-transparent hover:bg-[#3A4F24] hover:text-white focus:bg-[#3A4F24] focus:text-white focus:border-[#3A4F24]"
                        >
                            Settings
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
                {/* Main Content Area */}
                <div className="w-full max-w-6xl mx-auto">
                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle className="text-[#3A4F24]">Admin Dashboard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">Welcome to the admin dashboard. Content will be added here.</p>
                        </CardContent>
                    </Card>
                </div>
            </motion.main>
        </div>
    );
} 