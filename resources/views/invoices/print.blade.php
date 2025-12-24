<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tax Invoice #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            margin: 0;
            padding: 0;
        }
        .invoice-container {
            width: 100%;
            /* 210mm (A4) - 10mm (Left Margin) - 10mm (Right Margin) = 190mm */
            max-width: 190mm; 
            margin: 0 auto;
            border: 1px solid #000;
            min-height: 270mm;
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            box-sizing: border-box;
            background: white; /* Ensure white background */
            padding: 2px; /* Prevent border clipping */
        }
        .header, .details, .items, .total-table, .footer {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            border: 1px solid #000;
            padding: 4px;
            vertical-align: top;
        }
        .no-border-table td { border: none; }
        .no-border, .no-border td { border: none !important; }
        .left { text-align: left; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
        .small { font-size: 10px; }
        
        .terms-box {
            border-top: 1px solid #000;
            padding: 5px;
            font-size: 10px;
        }

        /* Ensure totals table fills height */
        .total-table td {
            height: 100%;
        }
        
        @media print {
            body { padding: 0; }
            .no-print { display: none; }
            .invoice-container { border: none; min-height: auto; width: 100%; max-width: none; }
        }
    </style>
</head>
<body>

<div class="no-print" style="text-align: right; max-width: 190mm; margin: 0 auto 10px; padding-top: 20px;">
    <button id="download-pdf" style="padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
        Download PDF
    </button>
</div>

<div class="invoice-container" id="invoice-content">
    
    <!-- TOP SECTION: Grows to fill space -->
    <div style="flex: 1;">
        <!-- HEADER -->
        <table class="header">
            <tr>
                <td class="left no-border" width="40%">
                    @if(!empty($settings['company_logo']))
                        <img src="{{ asset($settings['company_logo']) }}" alt="Logo" style="max-height: 50px; margin-bottom: 5px;"><br>
                    @else
                         <div style="font-size: 20px; font-weight: bold;">CBZ</div>
                    @endif
                    <div style="font-weight: bold; font-size: 12px; margin-top: 5px;">{{ $settings['company_name'] ?? 'CBZ PERFUMES' }}</div>
                    <div class="small">
                        {!! nl2br(e($settings['company_address'] ?? '')) !!}<br>
                        <strong>GSTIN :</strong> {{ $settings['company_gstin'] ?? '' }}
                    </div>
                </td>

                <td class="center no-border" width="20%">
                    <div class="title">Tax Invoice</div>
                    <div class="small">Cash Memo</div>
                    <div class="bold">ORIGINAL</div>
                </td>

                <td class="left no-border" width="40%">
                    <div class="bold">M/s {{ strtoupper($order->party->name) }}.</div>
                    <div class="small">
                        {{ $order->party->address }}<br>
                        Mobile No : {{ $order->party->phone ?? '-' }}<br>
                        <strong>GSTIN :</strong> {{ $order->party->gst_no ?? '-' }}
                    </div>
                </td>
            </tr>
        </table>

        <!-- INVOICE META -->
        <table class="details" style="border-top: 1px solid #000;">
            <tr>
                <td class="left" width="50%" style="border-right: 1px solid #000;">
                    <strong>Invoice No :</strong> {{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}
                </td>
                <td class="left" width="25%" style="border-right: 1px solid #000;">
                    <strong>Date :</strong> {{ $order->created_at->format('d/m/Y') }}
                </td>
                <td class="left" width="25%">
                    <strong>PAN No :</strong> -
                </td>
            </tr>
        </table>

        <!-- ITEMS TABLE -->
        <table class="items" style="margin-top: -1px;">
            <thead>
                <tr style="background-color: #f9f9f9;">
                    <th width="5%">Co.</th>
                    <th class="left" width="25%">Particular</th>
                    <th width="5%">HSN</th>
                    <th width="8%">MRP</th>
                    <th width="5%">Qty</th>
                    <th width="5%">Free</th>
                    <th width="5%">RT/RP</th>
                    <th width="8%">Rate</th>
                    <th width="5%">Sch.</th>
                    <th width="5%">Disc.</th>
                    <th width="5%">GST</th>
                    <th width="7%">CGST</th>
                    <th width="7%">SGST</th>
                    <th width="10%">Amount</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $gstRate = (float)($settings['gst_rate'] ?? 18);
                    $defaultFree = $settings['default_free'] ?? '';
                    $defaultRtRp = $settings['default_rt_rp'] ?? '';
                    $defaultScheme = $settings['default_scheme'] ?? '';
                    $defaultDiscount = $settings['default_discount'] ?? '';

                    $totalTaxable = 0;
                    $totalCGST = 0;
                    $totalSGST = 0;
                    $grandTotal = 0;
                @endphp
                @foreach($order->items as $item)
                    @php
                        $isSet = $item->product_set_id ? true : false;
                        $isAttar = $item->attar_id ? true : false;
                        $product = $item->product ?? $item->productSet ?? $item->attar;
                        $name = $product ? $product->name : $item->product_name; 
                        
                        // Parse Discount
                        $discPercent = (float)$defaultDiscount;
                        
                        // Base Calculation using UNIT PRICE (Custom Price)
                        $rate = (float)($item->unit_price ?? 0); 
                        $grossAmount = $rate * $item->quantity;
                        
                        // Apply Discount
                        $discountAmount = 0;
                        if ($discPercent > 0) {
                            $discountAmount = $grossAmount * ($discPercent / 100);
                        }
                        
                        $taxable = $grossAmount - $discountAmount;
                        
                        // GST Calculation
                        $gstAmount = $taxable * ($gstRate / 100);
                        $cgst = $gstAmount / 2;
                        $sgst = $gstAmount / 2;
                        
                        $lineTotal = $taxable + $gstAmount;

                        $totalTaxable += $taxable;
                        $totalCGST += $cgst;
                        $totalSGST += $sgst;
                        $grandTotal += $lineTotal;
                        
                        // Product MRP (Display Only)
                        $mrp = optional($product)->price ?? 0;
                        $hsn = optional($product)->hsn_code ?? '-';
                    @endphp
<tr>
                        <td class="center">{{ $loop->iteration }}</td>
                        <td class="left">{{ $name }} {{ $isSet ? '(Set)' : ($isAttar ? '(Attar)' : '') }}</td>
                        <td class="center">{{ $hsn }}</td>
                        <td class="right">{{ number_format($mrp, 2) }}</td>
                        <td class="center">{{ $item->quantity }}</td>
                        <td class="center">{{ $defaultFree }}</td>
                        <td class="center">{{ $defaultRtRp }}</td>
                        <td class="right">{{ number_format($rate, 2) }}</td>
                        <td class="center">{{ $defaultScheme }}</td>
                        <td class="center">{{ $discPercent != 0 ? $discPercent.'%' : '' }}</td>
                        <td class="center">{{ $gstRate }}%</td>
                        <td class="right">{{ number_format($cgst, 2) }}</td>
                        <td class="right">{{ number_format($sgst, 2) }}</td>
                        <td class="right">{{ number_format($lineTotal, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- BOTTOM SECTION: Totals + Terms -->
    <div>
        <table class="total-table" style="width: 100%; border-top: 1px solid #000;">
            <tr>
                <td width="60%" style="padding: 0; vertical-align: top; border-right: 1px solid #000; border-top: none;">
                    <table style="width: 100%; border-collapse: collapse; border: none;">
                        <tr>
                            <td colspan="4" class="left bold" style="border: none; border-bottom: 1px solid #000;">GST Summary</td>
                        </tr>
                        <tr class="small bold center">
                            <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">Sales %</td>
                            <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">Taxable Amount</td>
                            <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">SGST</td>
                            <td style="border: none; border-bottom: 1px solid #000;">CGST</td>
                        </tr>
                        <tr class="small center">
                            <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">Sales {{ $gstRate }}%</td>
                            <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">{{ number_format($totalTaxable, 2) }}</td>
                            <td style="border: none; border-right: 1px solid #000; border-bottom: 1px solid #000;">{{ number_format($totalSGST, 2) }}</td>
                            <td style="border: none; border-bottom: 1px solid #000;">{{ number_format($totalCGST, 2) }}</td>
                        </tr>
                        <tr class="small bold center">
                            <td style="border: none; border-right: 1px solid #000;">Total</td>
                            <td style="border: none; border-right: 1px solid #000;">{{ number_format($totalTaxable, 2) }}</td>
                            <td style="border: none; border-right: 1px solid #000;">{{ number_format($totalSGST, 2) }}</td>
                            <td style="border: none;">{{ number_format($totalCGST, 2) }}</td>
                        </tr>
                    </table>
                    
                    <div style="padding: 10px; border-top: 1px solid #000;">
                        <span class="bold">Rs. Apx :</span><br>
                        Rs. {{ number_format($grandTotal, 2) }}
                    </div>
                </td>
                
                <td width="40%" style="padding: 0; vertical-align: top; border-top: none;">
                     <table style="width: 100%; border-collapse: collapse; border: none;">
                        <tr>
                            <td class="right bold" style="border: none; border-bottom: 1px solid #000; padding: 5px;">Sub Total</td>
                            <td class="right bold" style="border: none; border-bottom: 1px solid #000; border-left: 1px solid #000; padding: 5px;">{{ number_format($grandTotal, 2) }}</td>
                        </tr>
                         <tr>
                            <td class="right" style="border: none; border-bottom: 1px solid #000; padding: 5px;">Round Off</td>
                            <td class="right" style="border: none; border-bottom: 1px solid #000; border-left: 1px solid #000; padding: 5px;">0.00</td>
                        </tr>
                         <tr>
                            <td class="right bold" style="border: none; padding: 5px;">Grand Total ₹</td>
                            <td class="right bold" style="border: none; border-left: 1px solid #000; padding: 5px;">{{ number_format($grandTotal, 2) }}</td>
                        </tr>
                    </table>
                    
                    <div style="text-align: right; padding: 40px 10px 10px; border-top: 1px solid #000;">
                         <div class="small" style="margin-bottom: 30px;">For {{ $settings['company_name'] ?? 'CBZ PERFUMES' }}</div>
                         <div class="bold small">Authorised Signatory</div>
                    </div>
                </td>
            </tr>
        </table>
    
        <div class="terms-box">
            <div class="bold small" style="margin-bottom: 2px;">Terms & Conditions</div>
            <div class="small">
                {!! nl2br(e($settings['invoice_terms'] ?? "Subject to RAJKOT jurisdiction.\nPayment Condition Seven Day/Cheque Return Charges 200 is added in next invoice E. & O. E.")) !!}
            </div>
        </div>
    </div>

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
    document.getElementById('download-pdf').addEventListener('click', function() {
        var element = document.getElementById('invoice-content');
        var opt = {
            margin:       5, // 5mm Margin all around
            filename:     'invoice_{{ $order->id }}.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollX: 0, scrollY: 0 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        var btn = this;
        var originalText = btn.innerText;
        btn.innerText = 'Generating PDF...';
        btn.disabled = true;

        html2pdf().set(opt).from(element).save().then(function(){
            btn.innerText = originalText;
            btn.disabled = false;
        }).catch(function(err) {
             console.error(err);
             btn.innerText = 'Error';
             btn.disabled = false;
        });
    });
</script>
</body>
</html>
