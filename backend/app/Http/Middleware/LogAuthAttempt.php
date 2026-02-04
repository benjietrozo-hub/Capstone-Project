<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogAuthAttempt
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('=== AUTH ATTEMPT ===');
        Log::info('URL: ' . $request->fullUrl());
        Log::info('Method: ' . $request->method());
        Log::info('Headers:', $request->headers->all());
        Log::info('Has Authorization header: ' . ($request->hasHeader('Authorization') ? 'Yes' : 'No'));
        
        if ($request->hasHeader('Authorization')) {
            $auth = $request->header('Authorization');
            Log::info('Authorization header: ' . substr($auth, 0, 30) . '...');
        }
        
        Log::info('User before auth: ' . ($request->user() ? $request->user()->id : 'null'));
        
        $response = $next($request);
        
        Log::info('User after auth: ' . ($request->user() ? $request->user()->id : 'null'));
        Log::info('Response status: ' . $response->getStatusCode());
        
        return $response;
    }
}
