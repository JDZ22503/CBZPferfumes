import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput
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
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Editable States
    const [items, setItems] = useState<any[]>([]);
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
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
                items: items.map(i => ({
                    id: i.id,
                    quantity: parseInt(i.quantity),
                    unit_price: parseFloat(i.unit_price)
                }))
            };

            await client.put(`/orders/${id}`, payload);
            Alert.alert('Success', 'Order updated successfully');
            fetchOrder(); // Refresh
        } catch (error) {
            console.error('Update Error:', error);
            Alert.alert('Error', 'Failed to update order');
        } finally {
            setSaving(false);
        }
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
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: `Order #${id}`, headerTintColor: '#000', headerStyle: { backgroundColor: '#fff' } }} />

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

                        <View style={styles.statusSection}>
                            <Text style={styles.statusLabel}>ORDER STATUS</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={status}
                                    onValueChange={(itemValue) => setStatus(itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#000"
                                    mode="dropdown"
                                >
                                    <Picker.Item label="Pending" value="pending" color="#000" />
                                    <Picker.Item label="Completed" value="completed" color="#000" />
                                    <Picker.Item label="Cancelled" value="cancelled" color="#000" />
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.statusSection}>
                            <Text style={styles.statusLabel}>PAYMENT STATUS</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={paymentStatus}
                                    onValueChange={(itemValue) => setPaymentStatus(itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#000"
                                    mode="dropdown"
                                >
                                    <Picker.Item label="Unpaid" value="unpaid" color="#000" />
                                    <Picker.Item label="Paid" value="paid" color="#000" />
                                    <Picker.Item label="Partial" value="partial" color="#000" />
                                </Picker>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
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
    pickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        overflow: 'hidden'
    },
    picker: {
        color: '#000',
        height: 50,
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
});
