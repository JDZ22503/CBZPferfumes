<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Party;
use Inertia\Inertia;

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

        $parties = $query->paginate(10);

        return Inertia::render('Parties/Index', [
            'parties' => $parties,
            'filters' => [
                'search' => $search,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Parties/Create');
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
            $filename = \Illuminate\Support\Str::slug($validated['name']) . '-' . time() . '.webp';
            $path = 'parties/' . $filename;

            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 400); 

            $storagePath = storage_path('app/public/parties');
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
            $validated['image_path'] = '/storage/' . $path;
        }

        Party::create($validated);

        return redirect()->route('parties.index');
    }


    public function edit(Party $party)
    {
        $party->load('productPrices');

        return Inertia::render('Parties/Edit', [
            'party' => $party,
            'products' => \App\Models\Product::select('id', 'name', 'sku', 'cost_price')->get(),
            'productSets' => \App\Models\ProductSet::select('id', 'name', 'sku', 'cost_price')->get(),
            'attars' => \App\Models\Attar::select('id', 'name', 'sku', 'cost_price')->get(),
        ]);
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
            // Delete old image
            if ($party->image_path) {
                $oldPath = str_replace('/storage/', '', $party->image_path);
                if (file_exists(storage_path('app/public/' . $oldPath))) {
                    unlink(storage_path('app/public/' . $oldPath));
                }
            }

            $image = $request->file('image');
            $filename = \Illuminate\Support\Str::slug($validated['name']) . '-' . time() . '.webp';
            $path = 'parties/' . $filename;

            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $img = $manager->read($image);
            $img->scale(width: 400);

            $storagePath = storage_path('app/public/parties');
            if (!file_exists($storagePath)) {
                mkdir($storagePath, 0755, true);
            }

            $img->toWebp(quality: 80)->save(storage_path('app/public/' . $path));
            $validated['image_path'] = '/storage/' . $path;
        }

        $party->update($validated);

        return redirect()->route('parties.index');
    }

    public function updatePrices(Request $request, Party $party)
    {
        $validated = $request->validate([
            'prices' => 'array',
            'prices.*.product_id' => 'nullable|exists:products,id',
            'prices.*.product_set_id' => 'nullable|exists:product_sets,id',
            'prices.*.attar_id' => 'nullable|exists:attars,id',
            'prices.*.price' => 'required|numeric|min:0',
        ]);

        if (isset($validated['prices'])) {
             foreach ($validated['prices'] as $priceData) {
                 $conditions = [
                     'party_id' => $party->id,
                 ];
                 
                 if (!empty($priceData['product_id'])) {
                     $conditions['product_id'] = $priceData['product_id'];
                     $conditions['product_set_id'] = null;
                     $conditions['attar_id'] = null;
                 } elseif (!empty($priceData['product_set_id'])) {
                     $conditions['product_set_id'] = $priceData['product_set_id'];
                     $conditions['product_id'] = null;
                     $conditions['attar_id'] = null;
                 } elseif (!empty($priceData['attar_id'])) {
                     $conditions['attar_id'] = $priceData['attar_id'];
                     $conditions['product_id'] = null;
                     $conditions['product_set_id'] = null;
                 } else {
                     continue;
                 }

                 \App\Models\PartyProductPrice::updateOrCreate(
                     $conditions,
                     ['price' => $priceData['price']]
                 );
             }
        }

        return back();
    }

    public function getPrices(Party $party)
    {
        return response()->json([
            'prices' => $party->productPrices
        ]);
    }

    public function destroy(Party $party)
    {
        if ($party->image_path) {
            $path = str_replace('/storage/', '', $party->image_path);
            if (file_exists(storage_path('app/public/' . $path))) {
                unlink(storage_path('app/public/' . $path));
            }
        }
        
        $party->delete();

        return redirect()->route('parties.index');
    }
}
