import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, MessageSquare, Shield, Users, Star, CheckCircle, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to Feedback Fortress">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center">
                {/* Navigation */}
                <motion.header 
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="sticky top-0 z-50 w-full border-b bg-[#3A4F24]/95 backdrop-blur supports-[backdrop-filter]:bg-[#3A4F24]/60"
                >
                    <div className="container mx-auto flex h-14 items-center max-w-7xl px-4">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mr-4 flex"
                        >
                            <Link href={route('home')} className="mr-6 flex items-center space-x-2">
                                <img src="/logo.png" alt="Feedback Fortress Logo" className="h-8 w-auto" />
                                <span className="font-bold text-white">Feedback Fortress</span>
                            </Link>
                        </motion.div>
                        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                            <nav className="flex items-center space-x-2">
                                {auth.user ? (
                                    <>
                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                        >
                                            <Link
                                                href={route('dashboard')}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-[#3A4F24] hover:bg-white/90 h-10 px-4 py-2"
                                            >
                                                Dashboard
                                            </Link>
                                        </motion.div>
                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                        >
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white bg-transparent text-white hover:bg-white/10 h-10 px-4 py-2"
                                            >
                                                Logout
                                            </Link>
                                        </motion.div>
                                    </>
                                ) : (
                                    <>
                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                        >
                                            <Link
                                                href={route('login')}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white bg-transparent text-white hover:bg-white/10 h-10 px-4 py-2"
                                            >
                                                Log in
                                            </Link>
                                        </motion.div>
                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                        >
                                            <Link
                                                href={route('register')}
                                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-[#3A4F24] hover:bg-white/90 h-10 px-4 py-2"
                                            >
                                                Get Started
                                            </Link>
                                        </motion.div>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </motion.header>

                {/* Hero Section */}
                <section className="flex-1 flex items-center justify-center relative overflow-hidden w-full">
                    {/* Background Image with Blur */}
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: 'url(/home_1.jpeg)',
                            filter: 'blur(8px)',
                            transform: 'scale(1.1)'
                        }}
                    />
                    {/* Enhanced gradient overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
                    
                    {/* Floating animated elements */}
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-20 left-10 w-4 h-4 bg-white/20 rounded-full blur-sm"
                    />
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-40 right-20 w-6 h-6 bg-white/15 rounded-full blur-sm"
                    />
                    
                    <div className="container mx-auto flex flex-col items-center gap-6 py-12 md:py-16 lg:py-32 relative z-10 max-w-6xl px-4">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="mx-auto flex max-w-[980px] flex-col items-center gap-6 text-center"
                        >
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="relative"
                            >
                                <motion.img 
                                    src="/logo.png" 
                                    alt="Feedback Fortress" 
                                    className="w-32 h-32 object-contain mb-6 drop-shadow-lg" 
                                />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                                >
                                    <Star className="w-4 h-4 text-white" />
                                </motion.div>
                            </motion.div>
                            
                            <div className="space-y-4">
                                <motion.h1 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.7, duration: 0.5 }}
                                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter text-white drop-shadow-lg"
                                >
                                    Secure Feedback
                                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                                        Management
                                    </span>
                                </motion.h1>
                                <motion.p 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.5 }}
                                    className="max-w-[750px] text-xl text-white/90 sm:text-2xl drop-shadow-md leading-relaxed"
                                >
                                    A fortress for your feedback. Collect, manage, and analyze feedback securely with our powerful platform.
                                </motion.p>
                            </div>
                            

                        </motion.div>
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9, duration: 0.5 }}
                            className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10"
                        >
                            <Link
                                href={route('register')}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#3A4F24] text-white hover:bg-[#3A4F24]/90 h-11 px-8"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link
                                href="#features"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white bg-white text-[#3A4F24] hover:bg-white/90 h-11 px-8"
                            >
                                Learn More
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full bg-gradient-to-b from-white to-gray-50">
                    <div className="container mx-auto space-y-12 py-16 md:py-20 lg:py-32 max-w-7xl px-4">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.0, duration: 0.5 }}
                            className="mx-auto flex max-w-[58rem] flex-col items-center space-y-6 text-center"
                        >
                            <div className="space-y-4">
                                <h2 className="font-bold text-4xl leading-[1.1] text-[#3A4F24] sm:text-5xl md:text-6xl lg:text-7xl">
                                    Features
                                </h2>
                                <p className="max-w-[85%] leading-normal text-gray-600 sm:text-xl sm:leading-7 text-lg">
                                    Everything you need to manage feedback effectively and securely
                                </p>
                            </div>
                        </motion.div>
                        <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
                        {[
                            {
                                icon: MessageSquare,
                                title: "Feedback Collection",
                                description: "Collect feedback through multiple channels with customizable forms",
                                delay: 1.1
                            },
                            {
                                icon: Shield,
                                title: "Secure Storage",
                                description: "Your feedback is encrypted and stored securely in our fortress",
                                delay: 1.2
                            },
                            {
                                icon: Users,
                                title: "Anonymous Reporting",
                                description: "Submit feedback anonymously to ensure honest and candid responses",
                                delay: 1.3
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: feature.delay, duration: 0.5 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300"
                            >
                                {/* Gradient background on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <div className="relative z-10 flex h-full flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="p-3 bg-gradient-to-r from-[#3A4F24] to-[#5B7B3A] rounded-xl group-hover:scale-110 transition-transform duration-300">
                                                <feature.icon className="h-8 w-8 text-white" />
                                            </div>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileHover={{ opacity: 1 }}
                                                className="text-green-500"
                                            >
                                                <CheckCircle className="h-6 w-6" />
                                            </motion.div>
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-xl font-bold text-[#3A4F24] group-hover:text-[#2c3a18] transition-colors">
                                                {feature.title}
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                    

                                </div>
                            </motion.div>
                        ))}
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section className="w-full bg-[#3A4F24] py-16 md:py-20 lg:py-32">
                    <div className="container mx-auto max-w-7xl px-4">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.4, duration: 0.5 }}
                            className="text-center space-y-6 mb-12"
                        >
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                                About Us
                            </h2>
                            <p className="text-xl text-white/80 max-w-2xl mx-auto">
                                Dedicated to creating a secure and efficient feedback management system
                            </p>
                        </motion.div>
                        
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.5, duration: 0.5 }}
                                className="space-y-6"
                            >
                                <h3 className="text-2xl font-bold text-white">Our Mission</h3>
                                <p className="text-white/90 leading-relaxed text-lg">
                                    We believe that every voice matters. Our platform is designed to provide a secure, 
                                    anonymous, and efficient way for students to submit feedback and grievances while 
                                    ensuring their privacy and confidentiality.
                                </p>
                                <p className="text-white/90 leading-relaxed text-lg">
                                    With advanced security measures and user-friendly interfaces, we're committed to 
                                    making feedback management accessible, transparent, and effective for PHINMA 
                                    University of Pangasinan.
                                </p>
                            </motion.div>
                            
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.6, duration: 0.5 }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl">
                                            <Users className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white text-lg">Anonymous Reporting</h4>
                                            <p className="text-white/70 text-sm">Submit feedback without revealing your identity</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl">
                                            <Clock className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white text-lg">24/7 Availability</h4>
                                            <p className="text-white/70 text-sm">Access the platform anytime, anywhere</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <motion.footer 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.5 }}
                    className="w-full border-t border-white/10 py-12 md:py-16 bg-[#2c3a18]"
                >
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="grid md:grid-cols-3 gap-8 mb-8">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <img src="/logo.png" alt="Feedback Fortress Logo" className="h-8 w-auto" />
                                    <span className="font-bold text-white text-lg">Feedback Fortress</span>
                                </div>
                                <p className="text-white/70 text-sm leading-relaxed">
                                    Secure, anonymous, and efficient feedback management for educational institutions.
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold text-white">Support</h3>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
                                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">Contact Us</a></li>
                                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">Documentation</a></li>
                                </ul>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="font-semibold text-white">Company</h3>
                                <ul className="space-y-2 text-sm">
                                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">About</a></li>
                                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-center text-sm leading-loose text-white/70 md:text-left">
                                © 2024 Feedback Fortress.
                            </p>
                            <div className="flex items-center gap-4">
                            </div>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </>
    );
}
