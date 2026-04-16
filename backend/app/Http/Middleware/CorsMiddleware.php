<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Log that CORS middleware is being executed
        \Log::info('CORS Middleware executed for: ' . $request->method() . ' ' . $request->path());
        
        // Handle preflight OPTIONS request
        if ($request->isMethod('OPTIONS')) {
            \Log::info('CORS: Handling OPTIONS preflight');
            $response = response('', 200);
        } else {
            $response = $next($request);
        }
        
        $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        $response->headers->set('Access-Control-Allow-Credentials', 'true');
        
        \Log::info('CORS headers set successfully');
        return $response;
    }
}
