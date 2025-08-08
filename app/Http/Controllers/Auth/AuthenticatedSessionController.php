<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\CaptchaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    protected $captchaService;

    public function __construct(CaptchaService $captchaService)
    {
        $this->captchaService = $captchaService;
    }

    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        $captcha = $this->captchaService->generateCaptcha();
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
            'captcha' => $captcha
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        if (!$this->captchaService->validateCaptcha($request->captcha)) {
            throw ValidationException::withMessages([
                'captcha' => 'Invalid CAPTCHA. Please try again.',
            ]);
        }

        $credentials = [
            'email' => $request->input('login'),
            'password' => $request->input('password'),
        ];

        Log::info('Login attempt:', ['email' => $credentials['email']]);

        // Try admin login first
        if (Auth::guard('admin')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            Log::info('Admin login successful');
            return redirect('/admin/dashboard');
        }

        // Try regular user login
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();
            Log::info('User login successful:', ['user_id' => $user->id]);
            
            if (!$user->hasVerifiedEmail()) {
                Auth::logout();
                throw ValidationException::withMessages([
                    'login' => 'Please verify your email address before logging in.',
                ]);
            }

            $request->session()->regenerate();
            return redirect('/dashboard');
        }

        Log::info('Login failed');
        throw ValidationException::withMessages([
            'login' => __('auth.failed'),
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
