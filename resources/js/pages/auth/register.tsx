import { type FormEvent } from 'react';
import { Link, useForm, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Shield, IdCard, UserCheck } from 'lucide-react';

interface RegisterForm {
    student_id: string;
    email: string;
    password: string;
    password_confirmation: string;
    captcha: string;
    alias: string;
    [key: string]: string;
}

export default function Register({ captcha }: { captcha: string }) {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        student_id: '',
        email: '',
        password: '',
        password_confirmation: '',
        captcha: '',
        alias: '',
    });

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'student_id') {
            // Only allow numbers and hyphens
            if (/^[0-9-]*$/.test(value)) {
                setData(name, value);
            }
        } else if (name === 'alias') {
            // Only allow alphabets and ensure first letter is uppercase
            if (/^[A-Z][a-zA-Z]*$/.test(value) || value === '') {
                setData(name, value);
            }
        } else {
            setData(name, value);
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />
            <AuthLayout title="Register" description="Create your account" variant="split">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md mx-auto"
                >
                    <Card className="bg-white shadow-xl border-0">
                        <CardHeader className="text-center pb-8">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.3 }}
                                className="w-16 h-16 bg-gradient-to-r from-[#3A4F24] to-[#5B7B3A] rounded-full flex items-center justify-center mx-auto mb-4"
                            >
                                <UserPlus className="h-8 w-8 text-white" />
                            </motion.div>
                            <CardTitle className="text-2xl font-bold text-[#3A4F24]">Create Account</CardTitle>
                            <CardDescription className="text-gray-600">Enter your details to create your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={submit} className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="student_id" className="text-sm font-semibold text-gray-700">Student ID</Label>
                                    <div className="relative">
                                        <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                        <Input
                                            id="student_id"
                                            type="text"
                                            name="student_id"
                                            value={data.student_id}
                                            onChange={handleRegisterChange}
                                            required
                                            placeholder="Enter your student ID"
                                            className="pl-10 h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#3A4F24] focus:border-[#3A4F24] text-black"
                                        />
                                    </div>
                                    {errors.student_id && <p className="text-sm text-red-500">{errors.student_id}</p>}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            onChange={handleRegisterChange}
                                            required
                                            placeholder="Enter your email"
                                            className="pl-10 h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#3A4F24] focus:border-[#3A4F24] text-black"
                                        />
                                    </div>
                                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="alias" className="text-sm font-semibold text-gray-700">Alias</Label>
                                    <div className="relative">
                                        <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                        <Input
                                            id="alias"
                                            type="text"
                                            name="alias"
                                            value={data.alias}
                                            onChange={handleRegisterChange}
                                            required
                                            placeholder="Enter your alias (e.g., John)"
                                            pattern="[A-Z][a-zA-Z]*"
                                            title="Alias must start with an uppercase letter and contain only alphabets"
                                            className="pl-10 h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#3A4F24] focus:border-[#3A4F24] text-black"
                                        />
                                    </div>
                                    {errors.alias && <p className="text-sm text-red-500">{errors.alias}</p>}
                                    <p className="text-xs text-gray-500">Must start with an uppercase letter and contain only alphabets</p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            onChange={handleRegisterChange}
                                            required
                                            error={errors.password}
                                            className="pl-10 h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#3A4F24] focus:border-[#3A4F24] text-black"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            onChange={handleRegisterChange}
                                            required
                                            error={errors.password_confirmation}
                                            className="pl-10 h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#3A4F24] focus:border-[#3A4F24] text-black"
                                            placeholder="Confirm your password"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="captcha" className="text-sm font-semibold text-gray-700">Verification Code</Label>
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-1 relative">
                                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                            <Input
                                                id="captcha"
                                                type="text"
                                                name="captcha"
                                                value={data.captcha}
                                                onChange={handleRegisterChange}
                                                required
                                                placeholder="Enter the code shown"
                                                className="pl-10 h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#3A4F24] focus:border-[#3A4F24] text-black"
                                            />
                                        </div>
                                        <div className="bg-gradient-to-r from-[#3A4F24] to-[#5B7B3A] px-4 py-3 rounded-lg font-mono text-lg font-bold text-white shadow-md">
                                            {captcha}
                                        </div>
                                    </div>
                                    {errors.captcha && <p className="text-sm text-red-500">{errors.captcha}</p>}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.5 }}
                                >
                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 bg-gradient-to-r from-[#3A4F24] to-[#5B7B3A] hover:from-[#2c3a18] hover:to-[#4a6b2f] text-white font-semibold text-lg shadow-lg" 
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                                Creating account...
                                            </div>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.0, duration: 0.5 }}
                                className="text-sm text-center text-gray-600"
                            >
                                Already have an account?{' '}
                                <Link href={route('login')} className="text-[#3A4F24] hover:text-[#5B7B3A] font-semibold transition-colors">
                                    Sign in
                                </Link>
                            </motion.div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </AuthLayout>
        </>
    );
}
