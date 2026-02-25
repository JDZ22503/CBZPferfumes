import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { User, Phone, Mail, MapPin, Edit } from 'lucide-react';

interface Party {
    id: number;
    name: string;
    type: 'customer' | 'supplier';
    phone: string | null;
    email: string | null;
    address: string | null;
    gst_no: string | null;
    balance: string;
    image_path: string | null;
}

interface Props {
    party: Party | null;
    open: boolean;
    onClose: () => void;
}

export default function PartyDetailsModal({ party, open, onClose }: Props) {
    if (!party) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        {party.image_path ? (
                            <img src={party.image_path} alt={party.name} className="h-16 w-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700" />
                        ) : (
                            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold border-2 border-indigo-50 dark:border-indigo-900">
                                {party.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <DialogTitle className="text-xl font-bold">{party.name}</DialogTitle>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${party.type === 'customer'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                {party.type.charAt(0).toUpperCase() + party.type.slice(1)}
                            </span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-2">
                    {/* Balance Card */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Current Balance</span>
                        <div className="text-right">
                            <span className={`text-xl font-bold ${(Number(party.balance) < 0 && party.type === 'supplier') || (Number(party.balance) > 0 && party.type === 'customer')
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                                }`}>
                                ₹{Math.abs(Number(party.balance)).toFixed(2)}
                            </span>
                            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-0.5">
                                {Number(party.balance) === 0 ? 'Settled' : (
                                    (Number(party.balance) > 0 ? (party.type === 'customer' ? 'To Receive' : 'Advance') : (party.type === 'customer' ? 'Advance' : 'To Pay'))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        {party.phone ? (
                            <div className="flex items-center text-base">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0">
                                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{party.phone}</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-base opacity-50">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0">
                                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 italic">No phone number</span>
                            </div>
                        )}

                        {party.email ? (
                            <div className="flex items-center text-base">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0">
                                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{party.email}</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-base opacity-50">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0">
                                    <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 italic">No email address</span>
                            </div>
                        )}

                        {party.address ? (
                            <div className="flex items-start text-base">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium leading-normal">{party.address}</span>
                            </div>
                        ) : (
                            <div className="flex items-start text-base opacity-50">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                                    <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 italic">No address provided</span>
                            </div>
                        )}

                        {party.gst_no ? (
                            <div className="flex items-center text-base">
                                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3 shrink-0">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">GST</span>
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{party.gst_no}</span>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-700">
                        <Link
                            href={route('parties.edit', party.id)}
                            className="flex items-center justify-center w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit details
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
