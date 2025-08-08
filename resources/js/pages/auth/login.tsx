import { type FormEvent } from 'react';
import { Link, useForm, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/layouts/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';
import { motion } from 'framer-motion';
import { Lock, User, Shield } from 'lucide-react';

interface LoginForm {
    login: string;
    password: string;
    remember: boolean;
    captcha: string;
    [key: string]: string | boolean;
}

export default function Login({ captcha }: { captcha: string }) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        login: '',
        password: '',
        remember: false,
        captcha: '',
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('login'), {
            onSuccess: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <AuthLayout title="Login" description="Enter your credentials to access your account" variant="split">
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
                                <Lock className="h-8 w-8 text-white" />
                            </motion.div>
                            <CardTitle className="text-2xl font-bold text-[#3A4F24]">Welcome Back</CardTitle>
                            <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Login Field */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="login" className="text-sm font-semibold text-gray-700">Email or Student ID</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                        <Input
                                            id="login"
                                            type="text"
                                            name="login"
                                            value={data.login}
                                            onChange={handleLoginChange}
                                            autoComplete="username"
                                            required
                                            className="pl-10 h-12 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-0 focus:border-[#3A4F24] text-black"
                                            placeholder="Enter your email or student ID"
                                        />
                                    </div>
                                    {errors.login && <p className="text-sm text-red-500">{errors.login}</p>}
                                </motion.div>

                                {/* Password Field */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            value={data.password}
                                            onChange={handleLoginChange}
                                            autoComplete="current-password"
                                            required
                                            error={errors.password}
                                            className="pl-10 h-12 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-0 focus:border-[#3A4F24] text-black"
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </motion.div>

                                {/* Captcha Field */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5, duration: 0.5 }}
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
                                                onChange={handleLoginChange}
                                                required
                                                placeholder="Enter the code shown"
                                                className="pl-10 h-12 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-0 focus:border-[#3A4F24] text-black"
                                            />
                                        </div>
                                        <div className="bg-gradient-to-r from-[#3A4F24] to-[#5B7B3A] px-4 py-3 rounded-lg font-mono text-lg font-bold text-white shadow-md">
                                            {captcha}
                                        </div>
                                    </div>
                                    {errors.captcha && <p className="text-sm text-red-500">{errors.captcha}</p>}
                                </motion.div>

                                {/* Remember + Forgot Password */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6, duration: 0.5 }}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                        />
                                        <Label htmlFor="remember" className="text-sm font-normal text-gray-600">
                                            Remember me
                                        </Label>
                                    </div>
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-[#3A4F24] hover:text-[#5B7B3A] font-medium transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </motion.div>

                                {/* Submit Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                >
                                    <Button 
                                        type="submit" 
                                        className="w-full h-12 bg-gradient-to-r from-[#3A4F24] to-[#5B7B3A] hover:from-[#2c3a18] hover:to-[#4a6b2f] text-white font-semibold text-lg shadow-lg focus:outline-none focus:ring-0 focus:border-0" 
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                                Signing in...
                                            </div>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </motion.div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-6 border-t border-gray-100">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="text-sm text-center text-gray-600"
                            >
                                Don't have an account?{' '}
                                <Link href={route('register')} className="text-[#3A4F24] hover:text-[#5B7B3A] font-semibold transition-colors">
                                    Sign up
                                </Link>
                            </motion.div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </AuthLayout>
        </>
    );
}
