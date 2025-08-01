import { type FormEvent } from 'react';
import { Link, useForm, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';

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
                <Card>
                    <CardHeader>
                        <CardTitle>Create an account</CardTitle>
                        <CardDescription>Enter your details to create your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="student_id">Student ID</Label>
                                <Input
                                    id="student_id"
                                    type="text"
                                    name="student_id"
                                    value={data.student_id}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder="Enter your student ID"
                                />
                                {errors.student_id && <p className="text-sm text-red-500">{errors.student_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder="Enter your email"
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="alias">Alias</Label>
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
                                />
                                {errors.alias && <p className="text-sm text-red-500">{errors.alias}</p>}
                                <p className="text-xs text-gray-500">Must start with an uppercase letter and contain only alphabets</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    onChange={handleRegisterChange}
                                    required
                                    error={errors.password}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={handleRegisterChange}
                                    required
                                    error={errors.password_confirmation}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="captcha">Verification Code</Label>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1">
                                        <Input
                                            id="captcha"
                                            type="text"
                                            name="captcha"
                                            value={data.captcha}
                                            onChange={handleRegisterChange}
                                            required
                                            placeholder="Enter the code shown"
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="bg-gray-100 px-4 py-2 rounded-md font-mono text-lg font-bold text-gray-700">
                                        {captcha}
                                    </div>
                                </div>
                                {errors.captcha && <p className="text-sm text-red-500">{errors.captcha}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Creating account...' : 'Create account'}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            Already have an account?{' '}
                            <Link href={route('login')} className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </AuthLayout>
        </>
    );
}
