<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorrelationIdMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Use provided ID or generate a new one
        $correlationId = $request->header('X-Correlation-ID') ?? (string) \Illuminate\Support\Str::uuid();
        
        // Add to request for easy access
        $request->attributes->set('correlation_id', $correlationId);
        
        $response = $next($request);
        
        // Attach to response header
        $response->headers->set('X-Correlation-ID', $correlationId);
        
        return $response;
    }
}
