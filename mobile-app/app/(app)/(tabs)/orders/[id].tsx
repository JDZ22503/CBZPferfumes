import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import client from '../../../../src/api/client';
import { Colors } from '@/constants/theme';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// Using Light theme colors
const PRIMARY_COLOR = Colors.light.primary;
const BACKGROUND_COLOR = '#F3F4F6'; // Light Gray

export default function OrderDetails() {
    const { id, fromParty } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Editable States
    const [items, setItems] = useState<any[]>([]);
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [paidAmount, setPaidAmount] = useState('0');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [gstRate, setGstRate] = useState(18); // Default 18


    const fetchOrder = async () => {
        try {
            console.log('Fetching Order ID:', id);
            const response = await client.get(`/orders/${id}`);
            const data = response.data;
            setOrder(data);
            setItems(data.items || []);
            setStatus(data.status);
            setPaymentStatus(data.payment_status);
            setPaidAmount(data.paid_amount ? data.paid_amount.toString() : '0');
            setMessages(data.messages || []);
            setTransactions(data.transactions || []);


            // Try fetch settings for GST if possible, or assume 18
            client.get('/dashboard').then(res => {
                if (res.data.settings?.gst_rate) {
                    setGstRate(parseFloat(res.data.settings.gst_rate));
                }
            }).catch(() => { });

        } catch (error) {
            console.error('Error fetching order:', error);
            Alert.alert('Error', 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleDownloadBill = async () => {
        try {
            setDownloading(true);
            const response = await client.get(`/orders/${id}/invoice`);
            const html = response.data.html;

            const { uri } = await Print.printToFileAsync({ html });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            } else {
                Alert.alert('Success', `PDF saved to ${uri}`);
            }
        } catch (error) {
            console.error('Error downloading bill:', error);
            Alert.alert('Error', 'Failed to generate bill');
        } finally {
            setDownloading(false);
        }
    };

    const handleUpdateItem = (index: number, field: 'quantity' | 'unit_price', value: string) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateTotals = () => {
        const subTotal = items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unit_price) || 0;
            return sum + (qty * price);
        }, 0);
        const gst = subTotal * (gstRate / 100);
        return { subTotal, gst, total: subTotal + gst };
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                status,
                payment_status: paymentStatus,
                paid_amount: paymentStatus === 'partial' ? parseFloat(paidAmount) || 0 : 0,
                message: message,
                items: items.map(i => ({
                    id: i.id,
                    quantity: parseInt(i.quantity),
                    unit_price: parseFloat(i.unit_price)
                }))
            };

            await client.put(`/orders/${id}`, payload);
            Alert.alert('Success', 'Order updated successfully');
            setMessage(''); // Clear message field
            fetchOrder(); // Refresh
        } catch (error) {
            console.error('Update Error:', error);
            Alert.alert('Error', 'Failed to update order');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteMessage = (messageId: number) => {
        Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await client.delete(`/order-messages/${messageId}`);
                            setMessages(prev => prev.filter(m => m.id !== messageId));
                        } catch (error) {
                            console.error('Delete message error:', error);
                            Alert.alert('Error', 'Failed to delete message');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    const { bill_details, party } = order;
    const totals = calculateTotals();

    // Fallback to party details if bill_details is empty (though controller fills it)
    const customerDetails = bill_details || {
        party_name: party?.name,
        party_phone: party?.phone,
        party_address: party?.address
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
            <Stack.Screen
                options={{
                    title: `Order #${id}`,
                    headerTintColor: '#000',
                    headerStyle: { backgroundColor: '#fff' },
                    headerLeft: fromParty
                        ? () => (
                            <TouchableOpacity
                                onPress={() => router.push(`/(app)/(tabs)/parties/${fromParty}` as any)}
                                style={{ paddingHorizontal: 8 }}
                            >
                                <Ionicons name="arrow-back" size={24} color="#000" />
                            </TouchableOpacity>
                        )
                        : undefined,
                }}
            />

            {/* Header / Actions */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={styles.headerTitle}>Order #{id}</Text>
                    <Text style={styles.headerSubtitle}>View and manage details</Text>
                </View>
                <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={handleDownloadBill}
                    disabled={downloading}
                >
                    {downloading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Ionicons name="document-text-outline" size={20} color="#fff" />
                            <Text style={styles.downloadButtonText}>Bill</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.contentRow}>
                {/* Left Column: Order Items */}
                <View style={styles.leftColumn}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="cube-outline" size={20} color={PRIMARY_COLOR} />
                            <Text style={styles.cardTitle}>Order Items</Text>
                        </View>

                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeadText, { flex: 4 }]}>PRODUCT</Text>
                            <Text style={[styles.tableHeadText, { flex: 1, textAlign: 'center' }]}>QTY</Text>
                            <Text style={[styles.tableHeadText, { flex: 2, textAlign: 'center' }]}>PRICE</Text>
                            <Text style={[styles.tableHeadText, { flex: 2, textAlign: 'right' }]}>TOTAL</Text>
                        </View>

                        {items.map((item: any, index: number) => {
                            const product = item.product || item.product_set || item.attar;
                            const qty = parseFloat(item.quantity) || 0;
                            const price = parseFloat(item.unit_price) || 0;
                            const total = qty * price;

                            return (
                                <View key={item.id} style={styles.tableRow}>
                                    <View style={{ flex: 4 }}>
                                        <Text style={styles.itemName}>{product?.name || 'Unknown Item'}</Text>
                                        <Text style={styles.itemSku}>{product?.sku || product?.code || ''}</Text>
                                        <View style={styles.badgeContainer}>
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>
                                                    {item.product_id ? 'SINGLE UNIT' : (item.product_set_id ? 'SET' : 'ATTAR')}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <TextInput
                                            style={styles.input}
                                            value={item.quantity.toString()}
                                            onChangeText={(val) => handleUpdateItem(index, 'quantity', val)}
                                            keyboardType="numeric"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                    <View style={{ flex: 2, alignItems: 'center', justifyContent: 'center' }}>
                                        <TextInput
                                            style={[styles.input, { width: 60 }]}
                                            value={item.unit_price.toString()}
                                            onChangeText={(val) => handleUpdateItem(index, 'unit_price', val)}
                                            keyboardType="numeric"
                                            placeholderTextColor="#999"
                                        />
                                    </View>
                                    <View style={{ flex: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
                                        <Text style={styles.totalText}>₹{total.toFixed(2)}</Text>
                                    </View>
                                </View>
                            );
                        })}

                        <View style={styles.footerRow}>
                            <Text style={styles.footerLabel}>Subtotal</Text>
                            <Text style={styles.footerValue}>₹{totals.subTotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.footerRowNoBorder}>
                            <Text style={styles.footerLabel}>GST ({gstRate}%)</Text>
                            <Text style={styles.footerValue}>+ ₹{totals.gst.toFixed(2)}</Text>
                        </View>
                        <View style={styles.footerRowNoBorder}>
                            <Text style={[styles.footerLabel, { color: '#22c55e' }]}>Total Amount</Text>
                            <Text style={[styles.footerValue, { color: '#22c55e' }]}>₹{totals.total.toFixed(2)}</Text>
                        </View>
                        {(parseFloat(order.paid_amount) > 0) && (
                            <>
                                <View style={styles.footerRowNoBorder}>
                                    <Text style={styles.footerLabel}>Paid Amount</Text>
                                    <Text style={styles.footerValue}>- ₹{parseFloat(order.paid_amount).toFixed(2)}</Text>
                                </View>
                                <View style={[styles.footerRowNoBorder, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginTop: 4 }]}>
                                    <Text style={[styles.footerLabel, { fontWeight: 'bold', color: '#EF4444' }]}>Remaining Balance</Text>
                                    <Text style={[styles.footerValue, { fontWeight: 'bold', color: '#EF4444' }]}>
                                        ₹{parseFloat(order.due_amount).toFixed(2)}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Right Column: Customer & Status */}
                <View style={styles.rightColumn}>
                    {/* Customer Details */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="person-outline" size={20} color={PRIMARY_COLOR} />
                            <Text style={styles.cardTitle}>Customer Details</Text>
                        </View>
                        <View style={styles.customerInfo}>
                            <Text style={styles.customerName}>{customerDetails.party_name?.toUpperCase()}</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>PHONE</Text>
                                <Text style={styles.infoValue}>{customerDetails.party_phone || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>ADDRESS</Text>
                                <Text style={styles.infoValue}>{customerDetails.party_address || '-'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Update Status */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="calendar-outline" size={20} color={PRIMARY_COLOR} />
                            <Text style={styles.cardTitle}>Current Status</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.statusLabel}>ORDER STATUS</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={status}
                                        onValueChange={setStatus}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Pending" value="pending" />
                                        <Picker.Item label="Completed" value="completed" />
                                        <Picker.Item label="Cancelled" value="cancelled" />
                                    </Picker>
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.statusLabel}>PAYMENT STATUS</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={paymentStatus}
                                        onValueChange={setPaymentStatus}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Unpaid" value="unpaid" />
                                        <Picker.Item label="Partial" value="partial" />
                                        <Picker.Item label="Paid" value="paid" />
                                    </Picker>
                                </View>
                            </View>
                        </View>

                        {/* Paid Amount — only shown when Partial is selected */}
                        {paymentStatus === 'partial' && (
                            <View style={styles.statusSection}>
                                <Text style={styles.statusLabel}>PAID AMOUNT (₹)</Text>
                                <View style={styles.paidAmountRow}>
                                    <Text style={styles.paidAmountPrefix}>₹</Text>
                                    <TextInput
                                        style={styles.paidAmountInput}
                                        value={paidAmount}
                                        onChangeText={setPaidAmount}
                                        onFocus={() => {
                                            if (paidAmount === '0' || paidAmount === '0.00') {
                                                setPaidAmount('');
                                            }
                                        }}
                                        onBlur={() => {
                                            if (paidAmount === '' || isNaN(parseFloat(paidAmount))) {
                                                setPaidAmount('0');
                                            }
                                        }}
                                        keyboardType="numeric"
                                        placeholder="Enter amount"
                                        placeholderTextColor="#999"
                                    />
                                    <Text style={styles.paidAmountSuffix}>
                                        of ₹{parseFloat(order?.total_amount || '0').toFixed(2)}
                                    </Text>
                                </View>
                                {parseFloat(paidAmount) > 0 && order?.total_amount && (
                                    <Text style={styles.paidAmountRemaining}>
                                        Remaining: ₹{Math.max(0, parseFloat(order.total_amount) - parseFloat(paidAmount)).toFixed(2)}
                                    </Text>
                                )}
                            </View>
                        )}


                        <View style={styles.statusSection}>
                            <Text style={styles.statusLabel}>MESSAGE</Text>
                            <TextInput
                                style={styles.textArea}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Add a message or notes..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                        </TouchableOpacity>
                    </View>

                    {messages.length > 0 && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={PRIMARY_COLOR} />
                                <Text style={styles.cardTitle}>Message History</Text>
                            </View>
                            <View style={styles.historyContainer}>
                                {messages.map((msg, index) => (
                                    <View key={msg.id || index} style={styles.historyItem}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.historyMessage}>{msg.message}</Text>
                                            <Text style={styles.historyDate}>
                                                {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}
                                            </Text>
                                        </View>
                                        {msg.id && (
                                            <TouchableOpacity
                                                onPress={() => handleDeleteMessage(msg.id)}
                                                style={styles.deleteMessageBtn}
                                            >
                                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Transaction History */}
                    {transactions.length > 0 && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="wallet-outline" size={20} color={PRIMARY_COLOR} />
                                <Text style={styles.cardTitle}>Transaction History</Text>
                            </View>
                            <View style={styles.historyContainer}>
                                {transactions.map((txn, index) => {
                                    const isCredit = txn.type === 'credit';
                                    return (
                                        <View key={txn.id || index} style={styles.historyItem}>
                                            <View style={[styles.txnBadge, { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }]}>
                                                <Ionicons
                                                    name={isCredit ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                                                    size={18}
                                                    color={isCredit ? '#16A34A' : '#DC2626'}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.historyMessage}>{txn.description}</Text>
                                                <Text style={styles.historyDate}>
                                                    {new Date(txn.transaction_date || txn.created_at).toLocaleDateString()} {new Date(txn.transaction_date || txn.created_at).toLocaleTimeString()}
                                                </Text>
                                            </View>
                                            <Text style={[styles.txnAmount, { color: isCredit ? '#16A34A' : '#DC2626' }]}>
                                                {isCredit ? '+' : '-'}₹{parseFloat(txn.amount).toFixed(2)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light Background
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    errorText: {
        color: '#ff4444',
        fontSize: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap', // Allow wrapping for responsiveness
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827', // Dark Text
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280', // Gray Text
        marginTop: 4,
    },
    downloadButton: {
        backgroundColor: '#10B981', // Emerald-500
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        gap: 6,
    },
    downloadButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    contentRow: {
        flexDirection: 'column',
        gap: 20,
    },
    leftColumn: {
        flex: 1,
    },
    rightColumn: {
        gap: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    cardTitle: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '600',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableHeadText: {
        color: '#6B7280',
        fontSize: 12,
        fontWeight: '600',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        alignItems: 'center',
    },
    itemName: {
        color: '#111827',
        fontWeight: 'bold',
        fontSize: 14,
    },
    itemSku: {
        color: '#6B7280',
        fontSize: 12,
        marginBottom: 4,
    },
    badgeContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    badge: {
        backgroundColor: '#E5E7EB',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
    },
    badgeText: {
        color: '#4B5563',
        fontSize: 10,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#fff',
        color: '#111827',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        width: 50,
        textAlign: 'center',
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#D1D5DB'
    },
    footerRowNoBorder: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    saveButton: {
        backgroundColor: PRIMARY_COLOR,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    totalText: {
        color: '#111827',
        fontSize: 14,
        fontWeight: 'bold',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    footerLabel: {
        color: '#374151',
        fontSize: 14,
        fontWeight: 'bold',
    },
    footerValue: {
        color: '#111827',
        fontSize: 16,
        fontWeight: 'bold',
    },
    customerInfo: {
        gap: 12,
    },
    customerName: {
        color: '#111827',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoRow: {
        gap: 2,
    },
    infoLabel: {
        color: '#6B7280',
        fontSize: 10,
        fontWeight: 'bold',
    },
    infoValue: {
        color: '#374151',
        fontSize: 13,
        lineHeight: 18,
    },
    statusSection: {
        marginBottom: 16,
    },
    statusLabel: {
        color: '#6B7280',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 10,
    },
    pickerWrapper: {
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        overflow: 'hidden',
        height: 50,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    textArea: {
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        padding: 10,
        height: 100,
        color: '#111827',
        fontSize: 14,
        textAlignVertical: "top"
    },
    historyContainer: {
        gap: 12,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 10,
        marginBottom: 2,
    },
    historyMessage: {
        color: '#374151',
        fontSize: 14,
        marginBottom: 4,
        lineHeight: 20,
    },
    historyDate: {
        color: '#9CA3AF',
        fontSize: 11,
    },
    deleteMessageBtn: {
        padding: 6,
        marginLeft: 8,
        alignSelf: 'center',
    },
    paidAmountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 6,
    },
    paidAmountPrefix: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    paidAmountInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        paddingVertical: 4,
    },
    paidAmountSuffix: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    paidAmountRemaining: {
        marginTop: 6,
        fontSize: 13,
        color: '#EF4444',
        fontWeight: '600',
    },
    txnBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    txnAmount: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
    },
});
