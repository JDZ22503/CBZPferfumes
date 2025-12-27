import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Text, Modal, FlatList, TextInput } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import client from '../../../../src/api/client';
import FormField from '../../../../src/components/FormField';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProductSelector from '../../../../src/components/ProductSelector';

// Helper for Party Selection Modal (Simple List)
const PartySelector = ({ visible, onClose, onSelect }: any) => {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) fetch();
    }, [visible, query]);

    const fetch = async () => {
        try {
            setLoading(true);
            const res = await client.get('/parties');
            let items = res.data.data;
            if (query) {
                items = items.filter((i: any) => i.name.toLowerCase().includes(query.toLowerCase()));
            }
            setData(items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal visible={visible} animationType="slide">
            <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
                <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} /></TouchableOpacity>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Party..."
                        value={query}
                        onChangeText={setQuery}
                    />
                </View>
                {loading ? <ActivityIndicator /> : (
                    <FlatList
                        data={data}
                        keyExtractor={(item: any) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.listItem} onPress={() => onSelect(item)}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemSub}>{item.phone}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </Modal>
    );
};

export default function OrderForm() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);

    const [showPartyModal, setShowPartyModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedParty, setSelectedParty] = useState<any>(null);
    const [orderType, setOrderType] = useState<'sale' | 'purchase'>('sale'); // Default Sale
    const [customPrices, setCustomPrices] = useState<any>(null); // Store parsed custom prices

    const { control, handleSubmit, setValue, watch, register, getValues } = useForm({
        defaultValues: {
            party_id: '',
            order_date: new Date().toISOString().split('T')[0],
            status: 'pending',
            payment_status: 'unpaid',
            items: [] as any[]
        }
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'items'
    });

    // Watch items to calculate total
    const items = watch('items');

    // GST State & Logic
    const [gstRate, setGstRate] = useState(18);

    useEffect(() => {
        client.get('/dashboard').then(res => {
            if (res.data.settings?.gst_rate) {
                setGstRate(parseFloat(res.data.settings.gst_rate));
            }
        }).catch(err => console.log('GST Fetch Error', err));
    }, []);

    const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
    const gstAmount = subTotal * (gstRate / 100);
    const grandTotal = subTotal + gstAmount;

    useEffect(() => {
        if (isEdit) {
            loadOrder();
        }
    }, [id]);

    const loadOrder = async () => {
        // Fetch order details logic here... 
        // Simplified for Create New focus first
        Alert.alert('Edit Not Implemented', 'Focusing on Create Flow first');
        router.back();
    };

    const onPartySelect = async (party: any) => {
        setSelectedParty(party);
        setValue('party_id', party.id.toString());
        setShowPartyModal(false);

        // Auto-detect Order Type
        if (party.type === 'supplier') {
            setOrderType('purchase');
        } else {
            setOrderType('sale');
        }

        // Fetch Full Party Details for Custom Prices
        try {
            setLoading(true);
            const res = await client.get(`/parties/${party.id}`);
            const fullParty = res.data;

            // Parse productPrices into lookup map
            // Structure: { product: { id: price }, set: { id: price }, attar: { id: price } }
            const prices: any = { product: {}, set: {}, attar: {} };

            if (fullParty.product_prices) {
                fullParty.product_prices.forEach((pp: any) => {
                    if (pp.product_id) prices.product[pp.product_id] = parseFloat(pp.price);
                    if (pp.product_set_id) prices.set[pp.product_set_id] = parseFloat(pp.price);
                    if (pp.attar_id) prices.attar[pp.attar_id] = parseFloat(pp.price);
                });
            }
            setCustomPrices(prices);

        } catch (e) {
            console.error("Failed to fetch party prices", e);
        } finally {
            setLoading(false);
        }
    };

    const onProductUpdate = (product: any, action: 'add' | 'remove' | 'delete') => {
        const unitPrice = product.price;
        const currentItems = getValues('items');

        // Find if item exists
        // Match by item_id AND item_type (product vs set vs attar)
        // Since product obj from selector has _type, we use that relative to stored items
        const incomingType = product._type || 'product';

        const existingIndex = currentItems.findIndex((i: any) =>
            i.item_id === product.id && i.item_type === incomingType
        );

        if (existingIndex > -1) {
            // Update Existing
            const existingItem = currentItems[existingIndex];
            let newQty = parseFloat(existingItem.quantity);

            if (action === 'add') newQty += 1;
            else if (action === 'remove') newQty -= 1;
            else if (action === 'delete') newQty = 0;

            if (newQty <= 0) {
                remove(existingIndex);
            } else {
                update(existingIndex, {
                    ...existingItem,
                    quantity: newQty.toString(),
                    total_price: (newQty * parseFloat(existingItem.unit_price)).toFixed(2)
                });
            }
        } else {
            // Add New (only if action is add)
            if (action === 'add') {
                append({
                    item_id: product.id,
                    item_type: incomingType,
                    name: product.name,
                    quantity: '1',
                    unit_price: unitPrice.toString(),
                    total_price: unitPrice.toString()
                });
            }
        }
    };

    const updateQuantity = (index: number, qty: string) => {
        const item = getValues(`items.${index}`);
        const quantity = parseFloat(qty) || 0;
        const unitPrice = parseFloat(item.unit_price) || 0;
        update(index, {
            ...item,
            quantity: qty,
            total_price: (quantity * unitPrice).toFixed(2)
        });
    };

    const onSubmit = async (data: any) => {
        try {
            if (!data.party_id) {
                Alert.alert('Error', 'Please select a party');
                return;
            }
            if (data.items.length === 0) {
                Alert.alert('Error', 'Please add at least one item');
                return;
            }

            setLoading(true);
            const payload = {
                ...data,
                type: orderType, // Include Type
                items: data.items.map((i: any) => {
                    const item: any = {
                        quantity: i.quantity,
                        unit_price: i.unit_price,
                    };

                    // Map generic ID to specific column based on type
                    if (i.item_type === 'set') {
                        item.product_set_id = i.item_id;
                    } else if (i.item_type === 'attar') {
                        item.attar_id = i.item_id;
                    } else {
                        item.product_id = i.item_id;
                    }
                    return item;
                })
            };

            if (isEdit) {
                await client.put(`/orders/${id}`, payload);
            } else {
                await client.post('/orders', payload);
            }

            Alert.alert('Success', 'Order saved');
            router.push('/(app)/(tabs)/orders' as any);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'Failed to save order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: isEdit ? 'Edit Order' : 'New Order' }} />
            <ScrollView contentContainerStyle={styles.container}>

                {/* Party Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer</Text>
                    <TouchableOpacity style={styles.selector} onPress={() => setShowPartyModal(true)}>
                        <Text style={styles.selectorText}>
                            {selectedParty ? selectedParty.name : 'Select Party'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Date & Status */}
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <FormField control={control} name="order_date" label="Date (YYYY-MM-DD)" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.pickerWrapper}>
                            <Controller control={control} name="status" render={({ field }) => (
                                <Picker selectedValue={field.value} onValueChange={field.onChange} style={styles.picker}>
                                    <Picker.Item label="Pending" value="pending" />
                                    <Picker.Item label="Completed" value="completed" />
                                </Picker>
                            )} />
                        </View>
                    </View>
                </View>

                {/* Items List */}
                <View style={[styles.section, !selectedParty && { opacity: 0.5 }]}>
                    <View style={styles.flexRow}>
                        <Text style={styles.sectionTitle}>Items ({fields.length})</Text>
                        <TouchableOpacity
                            style={[styles.addItemBtn, !selectedParty && styles.disabledBtn]}
                            onPress={() => selectedParty && setShowProductModal(true)}
                            disabled={!selectedParty}
                        >
                            <Ionicons name="add-circle" size={20} color="#fff" />
                            <Text style={styles.addItemText}>Add Product</Text>
                        </TouchableOpacity>
                    </View>

                    {fields.map((field: any, index) => (
                        <View key={field.id} style={styles.itemRow}>
                            <View style={{ flex: 2 }}>
                                <Text numberOfLines={1} style={{ fontWeight: 'bold' }}>{field.name}</Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>₹{field.unit_price}</Text>
                            </View>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <TextInput
                                    style={styles.qtyInput}
                                    value={field.quantity}
                                    onChangeText={(val) => updateQuantity(index, val)}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={{ fontWeight: 'bold' }}>₹{field.total_price}</Text>
                            </View>
                            <TouchableOpacity onPress={() => remove(index)} style={{ marginLeft: 10 }}>
                                <Ionicons name="trash-outline" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    ))}




                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal:</Text>
                        <Text style={styles.subTotalValue}>₹{subTotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.gstRow}>
                        <Text style={styles.totalLabel}>GST ({gstRate}%):</Text>
                        <Text style={styles.gstValue}>+ ₹{gstAmount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.grandTotalRow}>
                        <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                        <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, (loading || !selectedParty) && styles.disabledBtn]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={loading || !selectedParty}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Place Order</Text>}
                </TouchableOpacity>

                <PartySelector visible={showPartyModal} onClose={() => setShowPartyModal(false)} onSelect={onPartySelect} />
                <ProductSelector
                    visible={showProductModal}
                    onClose={() => setShowProductModal(false)}
                    onSelect={onProductUpdate}
                    priceType={orderType}
                    customPrices={customPrices}
                    currentItems={items} // Pass current field array
                />

            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#f5f5f5', flexGrow: 1 },
    section: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
    sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
    selector: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between' },
    selectorText: { fontSize: 16 },
    row: { flexDirection: 'row', marginBottom: 15 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#333' },
    pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
    picker: { height: 50, width: '100%' },
    flexRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    itemRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 10 },
    qtyInput: { borderWidth: 1, borderColor: '#ddd', textAlign: 'center', borderRadius: 4, width: 40, padding: 5 },
    submitBtn: { backgroundColor: '#2E8B57', padding: 15, borderRadius: 8, alignItems: 'center' },
    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#ddd' },
    gstRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 },
    grandTotalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#333' },

    totalLabel: { fontSize: 14, marginRight: 10, color: '#666' },
    grandTotalLabel: { fontSize: 18, fontWeight: 'bold', marginRight: 10, color: '#111' },

    subTotalValue: { fontSize: 16, fontWeight: '600', color: '#333' },
    gstValue: { fontSize: 14, fontWeight: '600', color: '#666' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#2E8B57' },
    // ... rest ...
    disabledBtn: { backgroundColor: '#a5d6a7' },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    // Modal
    modalContainer: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    searchInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginLeft: 10 },
    listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemSub: { fontSize: 12, color: '#666' },
    addItemBtn: { flexDirection: 'row', backgroundColor: '#2E8B57', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, alignItems: 'center' },
    addItemText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 }
});
