import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import logo from '/public/logo.png';

interface AuthSplitLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthSplitLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                    <img src={logo} alt="Feedback Fortress" className="w-32 h-32 object-contain" />
                    <h1 className="text-4xl font-bold text-primary-foreground">Feedback Fortress</h1>
                    <p className="text-primary-foreground/80 text-center max-w-md">
                        Your trusted platform for managing and providing feedback
                    </p>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 bg-[#3A4F24] flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <img src={logo} alt="Feedback Fortress" className="w-8 h-8 object-contain" />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
