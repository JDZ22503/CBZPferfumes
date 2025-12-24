
import { useForm } from '@inertiajs/react';
import { Calendar, User, ShoppingBag, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OrderItem {
    id: number;
    product: {
        name: string;
        sku: string;
    } | null;
    product_set: {
        name: string;
        sku: string;
    } | null;
    quantity: number;
    unit_price: string;
    total_price: string;
}

interface Order {
    id: number;
    party: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    order_date: string;
    status: string;
    payment_status: string;
    total_amount: string;
    type: 'sale' | 'purchase';
    message: string | null;
    items: OrderItem[];
}

interface Props {
    order: Order | null;
    open: boolean;
    onClose: () => void;
}

export default function OrderDetailsModal({ order, open, onClose }: Props) {
    if (!order) return null;

    const { data, setData, put, processing } = useForm({
        status: order.status,
        payment_status: order.payment_status,
        message: order.message || '',
    });

    // Update form data when order changes
    // React's key on the Dialog component in parent will handle reset, 
    // but explicit effect or key is safer. For now let's rely on mounting.

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('orders.update', order.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <span>Order #{order.id}</span>
                        <a
                            href={route('orders.print', order.id)}
                            target="_blank"
                            className="inline-flex items-center justify-center rounded-md bg-green-500 border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-green-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Download Bill
                        </a>
                    </DialogTitle>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        View and manage details for order #{order.id}
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                    {/* Main Order Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                <ShoppingBag className="h-4 w-4 mr-2 text-indigo-500" />
                                Order Items
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead>
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {order.items.map((item) => {
                                            const productName = item.product ? item.product.name : item.product_set?.name || 'Unknown Item';
                                            const productSku = item.product ? item.product.sku : item.product_set?.sku || '-';
                                            const isSet = !!item.product_set;

                                            return (
                                                <tr key={item.id}>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                                        <div className="font-medium">{productName}</div>
                                                        <div className="text-xs text-gray-500 mb-1">{productSku}</div>
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${isSet
                                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                            }`}>
                                                            {isSet ? 'Gift Set' : 'Single Unit'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-right align-top pt-3">{item.quantity}</td>
                                                    <td className="px-3 py-2 text-sm text-gray-900 dark:text-white text-right align-top pt-3">₹{Number(item.unit_price).toFixed(2)}</td>
                                                    <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white text-right align-top pt-3">
                                                        ₹{Number(item.total_price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">Total Amount + GST</td>
                                            <td className="px-3 py-2 text-right text-sm font-bold text-gray-900 dark:text-white">
                                                {/* ₹{Number(order.total_amount).toFixed(2)} */}
                                                ₹{(Number(order.total_amount) * 1.18).toFixed(2)}


                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Customer & Status */}
                    <div className="space-y-6">
                        {/* Customer Details */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                <User className="h-4 w-4 mr-2 text-indigo-500" />
                                Customer Details
                            </h3>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-900 dark:text-white font-medium">{order.party.name}</p>
                                {order.party.phone && (
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <span className="w-16 text-xs uppercase tracking-wider text-gray-400">Phone</span> {order.party.phone}
                                    </p>
                                )}
                                {order.party.email && (
                                    <p className="text-sm text-gray-500 flex items-center">
                                        <span className="w-16 text-xs uppercase tracking-wider text-gray-400">Email</span> {order.party.email}
                                    </p>
                                )}
                                {order.party.address && (
                                    <p className="text-sm text-gray-500 flex items-start">
                                        <span className="w-16 text-xs uppercase tracking-wider text-gray-400 shrink-0">Address</span> {order.party.address}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Status Form */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                                Update Status
                            </h3>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Order Status</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2.5 px-4"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Payment Status</label>
                                    <select
                                        value={data.payment_status}
                                        onChange={(e) => setData('payment_status', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2.5 px-4"
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Message</label>
                                    <textarea
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        rows={4}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2.5 px-4"
                                        placeholder="Add a message or notes about this order..."
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
