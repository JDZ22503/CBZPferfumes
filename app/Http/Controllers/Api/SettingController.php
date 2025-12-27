<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    public function index()
    {
        // Return key-value pairs as a simple object
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json(['data' => $settings]);
    }

    public function update(Request $request)
    {
        // Accept any input as potential setting keys
        $data = $request->all();
        $settingsToUpdate = [];

        // Handle Logo Upload
        if ($request->hasFile('company_logo')) {
            try {
                $image = $request->file('company_logo');
                $filename = 'logo-' . time() . '-' . \Illuminate\Support\Str::random(10) . '.webp';
                $folder = 'company';
                $path = $folder . '/' . $filename;

                // Use Intervention Image (assuming v3 as per existing controller)
                $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                $img = $manager->read($image);
                $img->scale(width: 400);

                $storagePath = storage_path('app/public/' . $folder);
                if (!file_exists($storagePath)) {
                    mkdir($storagePath, 0775, true);
                }

                $fullPath = storage_path('app/public/' . $path);
                $img->toWebp(quality: 80)->save($fullPath);

                $settingsToUpdate['company_logo'] = '/storage/' . $path;

            } catch (\Exception $e) {
                Log::error('API Settings Upload Error: ' . $e->getMessage());
                return response()->json(['message' => 'Failed to upload logo'], 500);
            }
        }

        // Merge other non-file inputs
        foreach ($data as $key => $value) {
            if ($key === 'company_logo' || $key === '_method') continue; // Skip file and method override
            $settingsToUpdate[$key] = $value;
        }

        // Update DB
        foreach ($settingsToUpdate as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => (string) $value]
            );
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => Setting::all()->pluck('value', 'key')
        ]);
    }
}
