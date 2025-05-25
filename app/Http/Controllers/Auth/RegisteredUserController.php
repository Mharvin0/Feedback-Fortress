<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CaptchaService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    protected $captchaService;

    public function __construct(CaptchaService $captchaService)
    {
        $this->captchaService = $captchaService;
    }

    /**
     * Display the registration view.
     */
    public function create()
    {
        $captcha = $this->captchaService->generateCaptcha();
        return Inertia::render('auth/register', [
            'captcha' => $captcha
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        if (!$this->captchaService->validateCaptcha($request->captcha)) {
            throw ValidationException::withMessages([
                'captcha' => 'Invalid CAPTCHA. Please try again.',
            ]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'student_id' => 'required|string|max:255|unique:'.User::class,
            'alias' => [
                'required',
                'string',
                'max:255',
                'unique:'.User::class,
                'regex:/^[A-Z][a-zA-Z]*$/',
            ],
            'captcha' => ['required', 'string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'student_id' => $request->student_id,
            'email' => $request->email,
            'alias' => Hash::make($request->alias),
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}
