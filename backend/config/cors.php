<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => env('APP_ENV') === 'production' 
        ? [
            'https://pims.example.com',  // UPDATE: Replace with your production domain
            'https://www.pims.example.com',
        ]
        : [
            'http://localhost',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:8000',
            'http://Benz',
            'http://Benz:3000',
            'http://Benz:5173',
            'http://Benz:8000',
            'https://Benz',
            'https://Benz:3000',
            'https://Benz:8000',
        ],

    'allowed_origins_patterns' => env('APP_ENV') === 'production'
        ? []  // No wildcard patterns in production
        : [
            '#^http://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$#',
            '#^https://192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$#',
            '#^http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$#',
            '#^https://10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$#',
        ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
