<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run()
    {
        $defaults = [
            'company_name' => 'Sun Enterprise.',
            'company_address' => '"Purusharth", 3 Karan Para, Morden Studio Street, Prahlad Plot Main Road, Rajkot Mo - 9913075005',
            'company_gstin' => '24ABKFS1162J1Z4',
            'invoice_terms' => "Subject to RAJKOT jurisdiction.\nPayment Condition Seven Day/Cheque Return Charges 200 is added in next invoice E. & O. E.",
        ];

        foreach ($defaults as $key => $value) {
            Setting::firstOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
