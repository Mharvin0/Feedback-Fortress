import { type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function AuthSimpleLayout({ children }: Props) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-background">
            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-card shadow-md overflow-hidden sm:rounded-lg">
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Feedback Fortress" className="w-8 h-8 object-contain" />
                        <h1 className="text-2xl font-bold text-foreground">Feedback Fortress</h1>
                    </div>
                </div>
                {children}
            </div>
        </div>
    );
}
