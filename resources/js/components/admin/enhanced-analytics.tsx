import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    TrendingUp, 
    TrendingDown, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    Users, 
    FileText,
    Download,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

interface AnalyticsData {
    submissionVolume: {
        total: number;
        thisMonth: number;
        thisWeek: number;
        byCategory: Record<string, number>;
        trend: Record<string, number>;
    };
    statusBreakdown: {
        counts: Record<string, number>;
        avgTimeInStatus: Record<string, number>;
    };
    resolutionMetrics: {
        avgResolutionTime: number;
        fastest: Array<{ grievance_id: string; subject: string; created_at: string; updated_at: string }>;
        slowest: Array<{ grievance_id: string; subject: string; created_at: string; updated_at: string }>;
        percentWithinSLA: number;
    };
    userEngagement: {
        mostActiveUsers: Array<{ id: number; email: string; student_id: string; grievances_count: number }>;
        repeatSubmitters: Array<{ id: number; email: string; student_id: string; grievances_count: number }>;
        byUserType: Record<string, number>;
    };
    adminPerformance: {
        handledPerAdmin: Array<{ admin: string; count: number }>;
        avgResponseTime: number;
    };
    trendingTopics: Record<string, number>;
}

interface EnhancedAnalyticsProps {
    data: AnalyticsData;
    isLoading?: boolean;
}

export default function EnhancedAnalytics({ data, isLoading = false }: EnhancedAnalyticsProps) {
    const metricCards = [
        {
            title: 'Total Submissions',
            value: data.submissionVolume.total,
            change: '+12%',
            trend: 'up',
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'This Month',
            value: data.submissionVolume.thisMonth,
            change: '+8%',
            trend: 'up',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Avg Resolution Time',
            value: `${data.resolutionMetrics.avgResolutionTime.toFixed(1)}h`,
            change: '-15%',
            trend: 'down',
            icon: Clock,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'SLA Compliance',
            value: `${data.resolutionMetrics.percentWithinSLA}%`,
            change: '+5%',
            trend: 'up',
            icon: CheckCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    const chartData = {
        submissions: {
            labels: Object.keys(data.submissionVolume.trend),
            datasets: [{
                label: 'Submissions',
                data: Object.values(data.submissionVolume.trend),
                borderColor: '#3A4F24',
                backgroundColor: 'rgba(58, 79, 36, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        categories: {
            labels: Object.keys(data.submissionVolume.byCategory),
            datasets: [{
                data: Object.values(data.submissionVolume.byCategory),
                backgroundColor: [
                    '#3A4F24',
                    '#5B7B3A',
                    '#A3B18A',
                    '#D9ED92',
                    '#B5C99A',
                    '#8FBC8F'
                ]
            }]
        },
        status: {
            labels: Object.keys(data.statusBreakdown.counts),
            datasets: [{
                data: Object.values(data.statusBreakdown.counts),
                backgroundColor: [
                    '#FFD700',
                    '#1E90FF',
                    '#32CD32',
                    '#A9A9A9',
                    '#FF6347'
                ]
            }]
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="bg-white">
                            <CardContent className="p-6">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div
                            key={metric.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="bg-white hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                                            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                            <div className="flex items-center mt-2">
                                                {metric.trend === 'up' ? (
                                                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                                )}
                                                <span className={`text-sm font-medium ${
                                                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {metric.change}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-full ${metric.bgColor}`}>
                                            <Icon className={`h-6 w-6 ${metric.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Submissions Trend */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-white">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                    <TrendingUp className="inline mr-2 h-5 w-5 text-[#3A4F24]" />
                                    Submission Trends
                                </CardTitle>
                                <Button variant="outline" size="sm">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Line
                                    data={chartData.submissions}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        },
                                        scales: {
                                            x: {
                                                grid: {
                                                    display: false
                                                }
                                            },
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(0,0,0,0.1)'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Category Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                <PieChart className="inline mr-2 h-5 w-5 text-[#3A4F24]" />
                                Submissions by Category
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <Doughnut
                                    data={chartData.categories}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Performers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                <Users className="inline mr-2 h-5 w-5 text-[#3A4F24]" />
                                Most Active Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.userEngagement.mostActiveUsers.slice(0, 5).map((user, index) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <Badge variant="secondary" className="bg-[#3A4F24] text-white">
                                                #{index + 1}
                                            </Badge>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.email}</p>
                                                <p className="text-sm text-gray-500">{user.student_id}</p>
                                            </div>
                                        </div>
                                        <Badge variant="outline">
                                            {user.grievances_count} submissions
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Admin Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                <Activity className="inline mr-2 h-5 w-5 text-[#3A4F24]" />
                                Admin Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.adminPerformance.handledPerAdmin.map((admin, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{admin.admin}</p>
                                            <p className="text-sm text-gray-500">Handled grievances</p>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            {admin.count} cases
                                        </Badge>
                                    </div>
                                ))}
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600">Average Response Time</p>
                                    <p className="text-lg font-semibold text-[#3A4F24]">
                                        {data.adminPerformance.avgResponseTime.toFixed(1)} hours
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Trending Topics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Card className="bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                <BarChart3 className="inline mr-2 h-5 w-5 text-[#3A4F24]" />
                                Trending Topics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(data.trendingTopics)
                                    .sort(([,a], [,b]) => b - a)
                                    .slice(0, 5)
                                    .map(([topic, count], index) => (
                                        <div key={topic} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                    #{index + 1}
                                                </Badge>
                                                <span className="text-sm font-medium text-gray-900">{topic}</span>
                                            </div>
                                            <Badge variant="outline">
                                                {count} mentions
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
} 