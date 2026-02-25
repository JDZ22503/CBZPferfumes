<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Royal Amber Noir',
                'sku' => 'CBZ-001',
                'price' => 185.00,
                'cost_price' => 45.00,
                'stock_quantity' => 100,
                'image_path' => null, // Placeholder will be used
            ],
            [
                'name' => 'Ethereal Essence',
                'sku' => 'CBZ-002',
                'price' => 160.00,
                'cost_price' => 40.00,
                'stock_quantity' => 50,
                'image_path' => null,
            ],
            [
                'name' => 'Midnight Oud',
                'sku' => 'CBZ-003',
                'price' => 220.00,
                'cost_price' => 60.00,
                'stock_quantity' => 25,
                'image_path' => null,
            ],
            [
                'name' => 'Golden Saffron',
                'sku' => 'CBZ-004',
                'price' => 195.00,
                'cost_price' => 55.00,
                'stock_quantity' => 75,
                'image_path' => null,
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['sku' => $product['sku']],
                $product
            );
        }
    }
}
