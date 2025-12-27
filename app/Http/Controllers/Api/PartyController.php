<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Party;
use App\Models\PartyProductPrice;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class PartyController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $query = Party::latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:customer,supplier',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'gst_no' => 'nullable|string|max:20',
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = Str::slug($validated['name']) . '-' . time() . '.webp';
            $path = 'parties/' . $filename;

            $manager = new ImageManager(new Driver());
            $img = $manager->read($image);
            $img->scale(width: 400); 

            $storagePath = storage_path('app/public/parties');
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
            $validated['image_path'] = '/storage/' . $path;
        }

        $party = Party::create($validated);
        return response()->json($party, 201);
    }

    public function show(Party $party)
    {
        return response()->json($party->load('productPrices'));
    }

    public function update(Request $request, Party $party)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:customer,supplier',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'gst_no' => 'nullable|string|max:20',
        ]);

        if ($request->hasFile('image')) {
            if ($party->image_path) {
                $oldPath = str_replace('/storage/', '', $party->image_path);
                if (File::exists(storage_path('app/public/' . $oldPath))) {
                    unlink(storage_path('app/public/' . $oldPath));
                }
            }

            $image = $request->file('image');
            $filename = Str::slug($validated['name']) . '-' . time() . '.webp';
            $path = 'parties/' . $filename;

            $manager = new ImageManager(new Driver());
            $img = $manager->read($image);
            $img->scale(width: 400);

            $storagePath = storage_path('app/public/parties');
            if (!File::exists($storagePath)) {
                File::makeDirectory($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
            $validated['image_path'] = '/storage/' . $path;
        }

        $party->update($validated);
        return response()->json($party);
    }

    public function destroy(Party $party)
    {
        if ($party->image_path) {
            $path = str_replace('/storage/', '', $party->image_path);
            if (File::exists(storage_path('app/public/' . $path))) {
                unlink(storage_path('app/public/' . $path));
            }
        }
        
        $party->delete();
        return response()->json(['message' => 'Party deleted successfully']);
    }
}
