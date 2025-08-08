<?php

namespace App\Http\Controllers;

use App\Models\Grievance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/dashboard');
    }

    public function getStats()
    {
        // Get counts for different statuses
        $stats = [
            'total' => Grievance::count(),
            'pending' => Grievance::where('status', 'under_review')->count(),
            'underReview' => Grievance::where('status', 'under_review')->count(),
            'resolved' => Grievance::where('status', 'resolved')->count(),
            'archived' => Grievance::where('status', 'archived')->count(),
        ];

        // Get submissions per day for the last 7 days
        $last7Days = collect(range(6, 0))->map(function ($day) {
            $date = Carbon::now()->subDays($day);
            return [
                'date' => $date->format('Y-m-d'),
                'count' => Grievance::whereDate('created_at', $date)->count(),
            ];
        });

        $chartData = [
            'labels' => $last7Days->pluck('date'),
            'datasets' => [
                [
                    'label' => 'Submissions',
                    'data' => $last7Days->pluck('count'),
                    'borderColor' => '#3A4F24',
                    'backgroundColor' => 'rgba(58, 79, 36, 0.1)',
                    'tension' => 0.4,
                ],
            ],
        ];

        // Get recent activity
        $recentActivity = Grievance::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($grievance) {
                return [
                    'description' => "Grievance #{$grievance->grievance_id} was {$grievance->status}",
                    'timestamp' => $grievance->updated_at->diffForHumans(),
                ];
            });

        return response()->json([
            'stats' => $stats,
            'chartData' => $chartData,
            'recentActivity' => $recentActivity,
        ]);
    }

    public function getAnalytics()
    {
        $now = now();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfMonth = $now->copy()->startOfMonth();
        $SLA_DAYS = 7;

        // Submission Volume
        $total = \App\Models\Grievance::count();
        $thisMonth = \App\Models\Grievance::where('created_at', '>=', $startOfMonth)->count();
        $thisWeek = \App\Models\Grievance::where('created_at', '>=', $startOfWeek)->count();
        $byCategory = \App\Models\Grievance::selectRaw('type, COUNT(*) as count')->groupBy('type')->pluck('count', 'type');
        $trend = \App\Models\Grievance::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')->orderBy('date')->pluck('count', 'date');

        // Status Breakdown
        $statusCounts = \App\Models\Grievance::selectRaw('status, COUNT(*) as count')->groupBy('status')->pluck('count', 'status');
        $avgTimeInStatus = [];
        foreach (['pending', 'under_review', 'resolved', 'archived'] as $status) {
            $avgTimeInStatus[$status] = \App\Models\Grievance::where('status', $status)
                ->whereNotNull('created_at')
                ->avg(\DB::raw('TIMESTAMPDIFF(HOUR, created_at, updated_at)'));
        }

        // Resolution Metrics
        $resolved = \App\Models\Grievance::where('status', 'resolved')->get();
        $avgResolutionTime = $resolved->avg(function($g) {
            return $g->created_at && $g->updated_at ? $g->created_at->diffInHours($g->updated_at) : null;
        });
        $fastest = $resolved->sortBy(function($g) { return $g->created_at && $g->updated_at ? $g->created_at->diffInSeconds($g->updated_at) : PHP_INT_MAX; })->take(5)->values();
        $slowest = $resolved->sortByDesc(function($g) { return $g->created_at && $g->updated_at ? $g->created_at->diffInSeconds($g->updated_at) : 0; })->take(5)->values();
        $resolvedWithinSLA = $resolved->filter(function($g) use ($SLA_DAYS) {
            return $g->created_at && $g->updated_at && $g->created_at->diffInDays($g->updated_at) <= $SLA_DAYS;
        })->count();
        $percentWithinSLA = $resolved->count() > 0 ? round($resolvedWithinSLA / $resolved->count() * 100, 1) : 0;

        // User Engagement
        $mostActiveUsers = \App\Models\User::withCount('grievances')->orderByDesc('grievances_count')->take(5)->get(['id', 'email', 'student_id', 'grievances_count']);
        $repeatSubmitters = \App\Models\User::withCount('grievances')->having('grievances_count', '>', 1)->get(['id', 'email', 'student_id', 'grievances_count']);
        $byUserType = \App\Models\Grievance::join('users', 'grievances.user_id', '=', 'users.id')
            ->selectRaw('CASE WHEN users.student_id LIKE "ADMIN%" THEN "admin" ELSE "user" END as user_type, COUNT(*) as count')
            ->groupBy('user_type')->pluck('count', 'user_type');

        // Admin Performance
        $admins = \App\Models\Admin::all();
        $handledPerAdmin = [];
        foreach ($admins as $admin) {
            $handledPerAdmin[] = [
                'admin' => $admin->email,
                'count' => \App\Models\Grievance::where('updated_at', '!=', \DB::raw('created_at'))->count() // Placeholder, adjust if you have admin_id
            ];
        }
        $avgResponseTime = \App\Models\Grievance::whereColumn('created_at', '!=', 'updated_at')
            ->avg(\DB::raw('TIMESTAMPDIFF(HOUR, created_at, updated_at)'));

        // Trending Topics/Keywords (from subject)
        $subjects = \App\Models\Grievance::pluck('subject')->toArray();
        $allWords = collect($subjects)->flatMap(function($subject) {
            return preg_split('/\s+/', strtolower(preg_replace('/[^a-zA-Z0-9 ]/', '', $subject)));
        })->filter()->countBy()->sortDesc()->take(20);

        return response()->json([
            'submissionVolume' => [
                'total' => $total,
                'thisMonth' => $thisMonth,
                'thisWeek' => $thisWeek,
                'byCategory' => $byCategory,
                'trend' => $trend,
            ],
            'statusBreakdown' => [
                'counts' => $statusCounts,
                'avgTimeInStatus' => $avgTimeInStatus,
            ],
            'resolutionMetrics' => [
                'avgResolutionTime' => $avgResolutionTime,
                'fastest' => $fastest,
                'slowest' => $slowest,
                'percentWithinSLA' => $percentWithinSLA,
            ],
            'userEngagement' => [
                'mostActiveUsers' => $mostActiveUsers,
                'repeatSubmitters' => $repeatSubmitters,
                'byUserType' => $byUserType,
            ],
            'adminPerformance' => [
                'handledPerAdmin' => $handledPerAdmin,
                'avgResponseTime' => $avgResponseTime,
            ],
            'trendingTopics' => $allWords,
        ]);
    }
} 