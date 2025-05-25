<?php

namespace App\Http\Controllers;

use App\Models\Grievance;
use App\Services\CaptchaService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
                    'status' => match($grievance->status) {
                        'under_review' => 'Under Review',
                        'solved' => 'Solved',
                        'unsolved' => 'Unsolved',
                        default => ucfirst($grievance->status)
                    },
                    'created_at' => $grievance->created_at->format('d/m/Y H:i'),
                    'attachments' => !empty($grievance->attachments) ? $grievance->attachments[0] : null,
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
            'type' => 'required|in:complaint,feedback',
            'details' => 'required|string|min:10',
            'attachment' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,txt|max:5120',
        ], [
            'subject.required' => 'Subject is required.',
            'type.required' => 'Type is required.',
            'details.required' => 'Details are required.',
            'attachment.required' => 'Attachment is required.',
            'attachment.file' => 'Attachment must be a valid file.',
            'attachment.mimes' => 'Attachment must be an image or document.',
            'attachment.max' => 'Attachment must not exceed 5MB.',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $originalName = $file->getClientOriginalName();
            $encryptedContents = Crypt::encrypt(file_get_contents($file->getRealPath()));
            $encryptedFileName = uniqid() . '_' . $originalName . '.enc';
            Storage::disk('public')->put('grievance_attachments/' . $encryptedFileName, $encryptedContents);
            $attachmentPath = 'grievance_attachments/' . $encryptedFileName;
        }

        Grievance::create([
            'user_id' => auth()->id(),
            'subject' => $validated['subject'],
            'type' => $validated['type'],
            'details' => $validated['details'],
            'attachments' => $attachmentPath ? [$attachmentPath] : [],
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

    public function downloadAttachment($grievance_id)
    {
        $user = auth()->user();
        $grievance = Grievance::where('grievance_id', $grievance_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $attachmentPath = !empty($grievance->attachments) ? $grievance->attachments[0] : null;
        if (!$attachmentPath || !Storage::disk('public')->exists($attachmentPath)) {
            abort(404, 'Attachment not found.');
        }

        $encryptedContents = Storage::disk('public')->get($attachmentPath);
        $decryptedContents = Crypt::decrypt($encryptedContents);

        $originalName = preg_replace('/\.enc$/', '', basename($attachmentPath));

        return response($decryptedContents, 200, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'attachment; filename="'.$originalName.'"',
        ]);
    }

    public function deleted()
    {
        $user = auth()->user();
        $deletedGrievances = Grievance::onlyTrashed()
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($grievance) {
                return [
                    'grievance_id' => $grievance->grievance_id,
                    'subject' => $grievance->subject,
                    'type' => $grievance->type,
                    'details' => $grievance->details,
                    'status' => match($grievance->status) {
                        'under_review' => 'Under Review',
                        'solved' => 'Solved',
                        'unsolved' => 'Unsolved',
                        default => ucfirst($grievance->status)
                    },
                    'created_at' => $grievance->created_at->format('d/m/Y H:i'),
                ];
            });
        return response()->json(['deletedGrievances' => $deletedGrievances]);
    }

    public function forceDelete($grievance_id)
    {
        $user = auth()->user();
        $grievance = Grievance::onlyTrashed()
            ->where('grievance_id', $grievance_id)
            ->where('user_id', $user->id)
            ->firstOrFail();
        $grievance->forceDelete();
        return response()->json(['success' => true]);
    }

    public function restore($grievance_id)
    {
        $user = auth()->user();
        $grievance = Grievance::onlyTrashed()
            ->where('grievance_id', $grievance_id)
            ->where('user_id', $user->id)
            ->firstOrFail();
        $grievance->restore();
        return response()->json(['success' => true]);
    }
} 