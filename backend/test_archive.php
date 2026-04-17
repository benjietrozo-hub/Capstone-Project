<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = new Illuminate\Http\Request();
$req->merge(['type' => 'all']);
$ctrl = new App\Http\Controllers\API\Admin\ArchiveController();
echo json_encode($ctrl->index($req)->getData());
