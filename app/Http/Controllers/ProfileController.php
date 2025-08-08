<?php

namespace App\Http\Controllers;

use App\Services\CaptchaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProfileController extends Controller
{
    protected $captchaService;

    public function __construct(CaptchaService $captchaService)
    {
        $this->captchaService = $captchaService;
    }

    public function edit()
    {
        $user = Auth::user();
        $captcha = $user->isAdmin() ? null : $this->captchaService->generateCaptcha();
        
        return Inertia::render('dashboard', [
            'captcha' => $captcha,
            'user' => [
                'email' => $user->email,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        if (!$user->isAdmin()) {
            if (!$this->captchaService->validateCaptcha($request->captcha)) {
                throw ValidationException::withMessages([
                    'captcha' => 'Invalid CAPTCHA. Please try again.',
                ]);
            }
        }

        $rules = [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'current_password' => ['required', 'string'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ];
        if (!$user->isAdmin()) {
            $rules['captcha'] = ['required', 'string'];
        }

        $request->validate($rules);

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'The current password is incorrect.'])->withInput();
        }

        $user->email = $request->email;
        
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }
} 