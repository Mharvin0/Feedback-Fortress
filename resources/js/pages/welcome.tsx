import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, MessageSquare, Shield, Users } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to Feedback Fortress">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col">
                {/* Navigation */}
                <header className="sticky top-0 z-50 w-full border-b bg-[#3A4F24]/95 backdrop-blur supports-[backdrop-filter]:bg-[#3A4F24]/60">
                    <div className="container flex h-14 items-center">
                        <div className="mr-4 flex">
                            <Link href={route('home')} className="mr-6 flex items-center space-x-2">
                                <img src="/logo.png" alt="Feedback Fortress Logo" className="h-8 w-auto" />
                                <span className="font-bold text-white">Feedback Fortress</span>
                            </Link>
                        </div>
                        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                            <nav className="flex items-center space-x-2">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={route('dashboard')}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-[#3A4F24] hover:bg-white/90 h-10 px-4 py-2"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white bg-transparent text-white hover:bg-white/10 h-10 px-4 py-2"
                                        >
                                            Logout
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white bg-transparent text-white hover:bg-white/10 h-10 px-4 py-2"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-[#3A4F24] hover:bg-white/90 h-10 px-4 py-2"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="flex-1 flex items-center justify-center bg-white">
                    <div className="container flex flex-col items-center gap-4 py-8 md:py-12 lg:py-24">
                        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
                            <img src="/logo.png" alt="Feedback Fortress" className="w-32 h-32 object-contain mb-4" />
                            <h1 className="text-3xl font-bold leading-tight tracking-tighter text-[#3A4F24] md:text-6xl lg:leading-[1.1]">
                                Secure Feedback Management
                            </h1>
                            <p className="max-w-[750px] text-lg text-gray-600 sm:text-xl">
                                A fortress for your feedback. Collect, manage, and analyze feedback securely with our powerful platform.
                            </p>
                        </div>
                        <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#3A4F24] text-white hover:bg-[#3A4F24]/90 h-11 px-8"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-[#3A4F24] bg-transparent text-[#3A4F24] hover:bg-[#3A4F24]/10 h-11 px-8"
                            >
                                Learn More
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="container space-y-6 py-8 md:py-12 lg:py-24 bg-white">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                        <h2 className="font-bold text-3xl leading-[1.1] text-[#3A4F24] sm:text-3xl md:text-6xl">Features</h2>
                        <p className="max-w-[85%] leading-normal text-gray-600 sm:text-lg sm:leading-7">
                            Everything you need to manage feedback effectively
                        </p>
                    </div>
                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                        <div className="relative overflow-hidden rounded-lg border bg-gray-50 p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <MessageSquare className="h-12 w-12 text-[#3A4F24]" />
                                <div className="space-y-2">
                                    <h3 className="font-bold text-[#3A4F24]">Feedback Collection</h3>
                                    <p className="text-sm text-gray-600">
                                        Collect feedback through multiple channels with customizable forms
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-gray-50 p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <Shield className="h-12 w-12 text-[#3A4F24]" />
                                <div className="space-y-2">
                                    <h3 className="font-bold text-[#3A4F24]">Secure Storage</h3>
                                    <p className="text-sm text-gray-600">
                                        Your feedback is encrypted and stored securely in our fortress
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-gray-50 p-2">
                            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                                <Users className="h-12 w-12 text-[#3A4F24]" />
                                <div className="space-y-2">
                                    <h3 className="font-bold text-[#3A4F24]">Team Collaboration</h3>
                                    <p className="text-sm text-gray-600">
                                        Work together with your team to analyze and act on feedback
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/10 py-6 md:py-0 bg-[#3A4F24]">
                    <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                        <p className="text-center text-sm leading-loose text-white/80 md:text-left">
                            Built with ❤️ for better feedback management
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
