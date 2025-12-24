<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$partyId = 2;
$total = \App\Models\Order::where('party_id', $partyId)->sum('total_amount');

echo "Total amount sum for party_id {$partyId}: {$total}\n";
