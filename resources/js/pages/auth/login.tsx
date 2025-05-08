import { type FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AuthLayout from '@/layouts/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
    [key: string]: string | boolean;
}

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
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
        <AuthLayout title="Login" description="Enter your credentials to access your account" variant="split">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={handleLoginChange}
                                autoComplete="username"
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={handleLoginChange}
                                autoComplete="current-password"
                                required
                                error={errors.password}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                />
                                <Label htmlFor="remember" className="text-sm font-normal">
                                    Remember me
                                </Label>
                            </div>
                            <Link
                                href={route('password.request')}
                                className="text-sm text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href={route('register')} className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </AuthLayout>
    );
}
