<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('InvoiceSettings/Index', [
            'settings' => Setting::all()->pluck('value', 'key'),
        ]);
    }

public function update(Request $request)
{
    $request->validate([
        'settings' => ['required', 'array'],
    ]);

    $settings = $request->input('settings');

    // ✅ Handle logo upload
    if ($request->hasFile('settings.company_logo')) {
        $request->validate([
            'settings.company_logo' => ['image', 'max:2048'],
        ]);

        try {
            $image = $request->file('settings.company_logo');
            $filename = 'logo-' . time() . '-' . \Illuminate\Support\Str::random(10) . '.webp';
            
            // Use a different folder 'company' to avoid permission issues with 'settings' folder
            $folder = 'company';
            $path = $folder . '/' . $filename;

            // Use Intervention Image to process and save
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 400); 

            $storagePath = storage_path('app/public/' . $folder);
            
            // Ensure directory exists and is writable
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0775, true);
            }

            // Save the file
            $fullPath = storage_path('app/public/' . $path);
            $img->toWebp(quality: 80)->save($fullPath);
            
            $settings['company_logo'] = '/storage/' . $path;

        } catch (\Exception $e) {
            Log::error('Settings Upload: Exception caught - ' . $e->getMessage());
            unset($settings['company_logo']);
        }
    } else {
        unset($settings['company_logo']); // keep old value
    }

    foreach ($settings as $key => $value) {
        if (is_object($value)) continue;

        Setting::updateOrCreate(
            ['key' => $key],
            ['value' => (string) $value] // FORCE STRING
        );
    }

    return back()->with('success', 'Settings updated.');
}

}
