<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'student_id' => '1111111111',
            'email' => 'test3@example.com',
            'password' => Hash::make('password123'),
            'alias' => Hash::make('TestUser'),
            'email_verified_at' => now(),
        ]);
    }
} 