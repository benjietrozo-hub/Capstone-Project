<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttpsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only enforce HTTPS in production environment
        if (app()->environment('production')) {
            if (!$request->secure() && env('APP_ENV') !== 'local') {
                // Redirect to HTTPS
                return redirect()->secure($request->getRequestUri());
            }
        }

        return $next($request);
    }
}
