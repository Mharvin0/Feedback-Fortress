<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\GrievanceController;
use App\Http\Controllers\InboxMessageController;
use App\Http\Controllers\AdminDashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

// User routes
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\GrievanceController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('/grievances', [GrievanceController::class, 'index'])->name('grievances.index');
    Route::post('/grievances', [GrievanceController::class, 'store'])->name('grievances.store');
    Route::delete('/grievances/{grievance_id}', [\App\Http\Controllers\GrievanceController::class, 'destroy'])->name('grievances.destroy');
    Route::get('/grievance-attachment/{grievance_id}', [\App\Http\Controllers\GrievanceController::class, 'downloadAttachment'])->name('grievance.attachment.download');
    Route::get('/grievances/deleted', [\App\Http\Controllers\GrievanceController::class, 'deleted'])->name('grievances.deleted');
    Route::delete('/grievances/force-delete/{grievance_id}', [\App\Http\Controllers\GrievanceController::class, 'forceDelete'])->name('grievances.forceDelete');
    Route::put('/grievances/restore/{grievance_id}', [\App\Http\Controllers\GrievanceController::class, 'restore'])->name('grievances.restore');
    Route::get('/inbox-messages', [\App\Http\Controllers\InboxMessageController::class, 'index'])->name('inbox.messages');
});

// Admin routes
Route::middleware(['auth:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('admin.dashboard');

    Route::get('/users', function () {
        return Inertia::render('admin/users');
    })->name('admin.users');

    Route::get('/grievances', [GrievanceController::class, 'adminIndex'])->name('admin.grievances.index');
    Route::put('/grievances/{id}', [GrievanceController::class, 'update'])->name('admin.grievances.update');
    Route::put('/grievances/{id}/archive', [GrievanceController::class, 'archive'])->name('admin.grievances.archive');
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'getStats'])->name('admin.dashboard.stats');
    Route::get('/analytics', [\App\Http\Controllers\AdminDashboardController::class, 'getAnalytics'])->name('admin.analytics');
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
