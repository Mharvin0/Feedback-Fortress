<?php

namespace App\Http\Controllers;

use App\Models\Grievance;
use App\Services\CaptchaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GrievanceController extends Controller
{
    protected $captchaService;

    public function __construct(CaptchaService $captchaService)
    {
        $this->captchaService = $captchaService;
    }

    public function index()
    {
        $user = auth()->user();
        $grievances = Grievance::with('user')
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($grievance) {
                return [
                    'grievance_id' => $grievance->grievance_id,
                    'subject' => $grievance->subject,
                    'type' => $grievance->type,
                    'details' => $grievance->details,
                    'status' => ucfirst($grievance->status),
                    'created_at' => $grievance->created_at->format('d/m/Y H:i'),
                ];
            });

        $captcha = $this->captchaService->generateCaptcha();

        return Inertia::render('dashboard', [
            'grievances' => $grievances,
            'student_id' => $user->student_id,
            'total_submissions' => $grievances->count(),
            'captcha' => $captcha,
            'user' => [
                'email' => $user->email,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|min:8|max:255',
            'type' => 'required|in:request,complaint,feedback',
            'details' => 'required|string|min:10',
        ]);

        $grievance = Grievance::create([
            'user_id' => auth()->id(),
            'subject' => $validated['subject'],
            'type' => $validated['type'],
            'details' => $validated['details'],
        ]);

        return redirect()->back()->with('success', 'Grievance submitted successfully.');
    }

    public function adminIndex()
    {
        $grievances = Grievance::with('user')
            ->latest()
            ->get()
            ->map(function ($grievance) {
                return [
                    'grievance_id' => $grievance->grievance_id,
                    'student_id' => $grievance->user->student_id,
                    'type' => $grievance->type,
                    'details' => $grievance->details,
                    'status' => $grievance->status,
                    'created_at' => $grievance->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('Admin/Grievances/Index', [
            'grievances' => $grievances
        ]);
    }

    public function userSubmissions()
    {
        $user = auth()->user();
        $grievances = Grievance::where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($grievance) {
                return [
                    'grievance_id' => $grievance->grievance_id,
                    'subject' => $grievance->subject,
                    'type' => $grievance->type,
                    'details' => $grievance->details,
                    'status' => ucfirst($grievance->status),
                    'created_at' => $grievance->created_at->format('d/m/Y H:i'),
                ];
            });
        return Inertia::render('submissions', [
            'grievances' => $grievances,
            'student_id' => $user->student_id,
        ]);
    }

    public function destroy($grievance_id)
    {
        $user = auth()->user();
        $grievance = Grievance::where('grievance_id', $grievance_id)
            ->where('user_id', $user->id)
            ->firstOrFail();
        $grievance->delete();
        return redirect()->back()->with('success', 'Grievance deleted successfully.');
    }
} 