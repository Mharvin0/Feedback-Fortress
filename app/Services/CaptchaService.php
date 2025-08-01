<?php

namespace App\Services;

class CaptchaService
{
    public function generateCaptcha()
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $captchaString = '';
        $length = 6;

        for ($i = 0; $i < $length; $i++) {
            $captchaString .= $characters[rand(0, strlen($characters) - 1)];
        }

        session(['captcha' => $captchaString]);
        return $captchaString;
    }

    public function validateCaptcha($input)
    {
        return session('captcha') === $input;
    }
} 