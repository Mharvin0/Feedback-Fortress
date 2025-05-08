import { type ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import AuthSimpleLayout from './auth/auth-simple-layout';
import AuthCardLayout from './auth/auth-card-layout';
import AuthSplitLayout from './auth/auth-split-layout';

interface Props {
    children: ReactNode;
    title?: string;
    description?: string;
    variant?: 'simple' | 'card' | 'split';
}

export default function AuthLayout({ children, title, description, variant = 'simple' }: Props) {
    return (
        <>
            <Head title={title} />
            {variant === 'simple' && <AuthSimpleLayout>{children}</AuthSimpleLayout>}
            {variant === 'card' && <AuthCardLayout>{children}</AuthCardLayout>}
            {variant === 'split' && (
                <AuthSplitLayout title={title} description={description}>
                    {children}
                </AuthSplitLayout>
            )}
        </>
    );
}
