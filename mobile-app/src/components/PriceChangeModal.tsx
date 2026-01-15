import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import client from '../api/client';

interface Product {
    id: number;
    name: string;
    sku: string;
    cost_price: string;
}

interface ProductSet {
    id: number;
    name: string;
    sku: string;
    cost_price: string;
}

interface Attar {
    id: number;
    name: string;
    sku: string;
    cost_price: string;
}

interface PriceChangeModalProps {
    visible: boolean;
    onClose: () => void;
    partyId: number;
    partyName: string;
}

export default function PriceChangeModal({ visible, onClose, partyId, partyName }: PriceChangeModalProps) {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [productSets, setProductSets] = useState<ProductSet[]>([]);
    const [attars, setAttars] = useState<Attar[]>([]);
    const [prices, setPrices] = useState<Record<string, string>>({});
    const [viewMode, setViewMode] = useState<'mass' | 'individual'>('mass');
    const [itemFilter, setItemFilter] = useState<'all' | 'product' | 'set' | 'attar'>('all');
    const [massInputs, setMassInputs] = useState({ product: '', set: '', attar: '' });
    const [saving, setSaving] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (visible) {
            fetchData();
        }
    }, [visible, partyId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, setsRes, attarsRes, pricesRes] = await Promise.all([
                client.get('/products'),
                client.get('/product-sets'),
                client.get('/attars'),
                client.get(`/parties/${partyId}/prices`),
            ]);

            setProducts(productsRes.data.data || []);
            setProductSets(setsRes.data.data || []);
            setAttars(attarsRes.data.data || []);

            // Initialize prices from existing party prices
            const initialPrices: Record<string, string> = {};
            if (pricesRes.data) {
                pricesRes.data.forEach((pp: any) => {
                    let key = '';
                    if (pp.product_id) key = `p_${pp.product_id}`;
                    else if (pp.product_set_id) key = `s_${pp.product_set_id}`;
                    else if (pp.attar_id) key = `a_${pp.attar_id}`;
                    if (key) initialPrices[key] = pp.price;
                });
            }
            setPrices(initialPrices);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handlePriceChange = (key: string, value: string) => {
        setPrices(prev => ({ ...prev, [key]: value }));
    };

    const applyMassPrice = (type: 'product' | 'set' | 'attar') => {
        const price = massInputs[type];
        if (!price) return;

        const newPrices = { ...prices };
        if (type === 'product') {
            products.forEach(p => { newPrices[`p_${p.id}`] = price; });
        } else if (type === 'set') {
            productSets.forEach(s => { newPrices[`s_${s.id}`] = price; });
        } else {
            attars.forEach(a => { newPrices[`a_${a.id}`] = price; });
        }
        setPrices(newPrices);
    };

    const resetToDefault = (type: 'product' | 'set' | 'attar') => {
        const newPrices = { ...prices };
        if (type === 'product') {
            products.forEach(p => { delete newPrices[`p_${p.id}`]; });
        } else if (type === 'set') {
            productSets.forEach(s => { delete newPrices[`s_${s.id}`]; });
        } else {
            attars.forEach(a => { delete newPrices[`a_${a.id}`]; });
        }
        setPrices(newPrices);
    };

    const savePrices = async () => {
        try {
            setSaving(true);
            const payload = Object.entries(prices).map(([key, price]) => {
                const [type, id] = key.split('_');
                return {
                    product_id: type === 'p' ? parseInt(id) : undefined,
                    product_set_id: type === 's' ? parseInt(id) : undefined,
                    attar_id: type === 'a' ? parseInt(id) : undefined,
                    price: price === '' ? null : price,
                };
            });

            await client.put(`/parties/${partyId}/prices`, { prices: payload });
            Alert.alert('Success', 'Prices updated successfully');
            onClose();
        } catch (error) {
            console.error('Error saving prices:', error);
            Alert.alert('Error', 'Failed to save prices');
        } finally {
            setSaving(false);
        }
    };

    const allItems = [
        ...products.map(p => ({ ...p, type: 'product', key: `p_${p.id}` })),
        ...productSets.map(s => ({ ...s, type: 'set', key: `s_${s.id}` })),
        ...attars.map(a => ({ ...a, type: 'attar', key: `a_${a.id}` })),
    ];

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Custom Product Prices</Text>
                        <Text style={styles.subtitle}>{partyName}</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, viewMode === 'mass' && styles.activeTab]}
                        onPress={() => setViewMode('mass')}
                    >
                        <Text style={[styles.tabText, viewMode === 'mass' && styles.activeTabText]}>
                            Mass Assign
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, viewMode === 'individual' && styles.activeTab]}
                        onPress={() => setViewMode('individual')}
                    >
                        <Text style={[styles.tabText, viewMode === 'individual' && styles.activeTabText]}>
                            Individual Change
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#6366F1" />
                    </View>
                ) : (
                    <ScrollView style={styles.content}>
                        {viewMode === 'mass' ? (
                            <View style={styles.massContainer}>
                                {[
                                    { label: 'All Products', type: 'product' as const, count: products.length },
                                    { label: 'All Gift Sets', type: 'set' as const, count: productSets.length },
                                    { label: 'All Attars', type: 'attar' as const, count: attars.length },
                                ].map((cat) => (
                                    <View key={cat.type} style={styles.massCard}>
                                        <Text style={styles.massTitle}>{cat.label}</Text>
                                        <Text style={styles.massLabel}>Set Fixed Price</Text>
                                        <View style={styles.massInputRow}>
                                            <TextInput
                                                style={styles.massInput}
                                                placeholder="0.00"
                                                keyboardType="decimal-pad"
                                                value={massInputs[cat.type]}
                                                onChangeText={(val) => {
                                                    const cleaned = val.replace(/[^0-9.]/g, '');
                                                    setMassInputs({ ...massInputs, [cat.type]: cleaned });
                                                }}
                                            />
                                            <TouchableOpacity
                                                style={styles.applyBtn}
                                                onPress={() => applyMassPrice(cat.type)}
                                            >
                                                <Text style={styles.applyBtnText}>Apply</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={styles.orText}>OR</Text>
                                        <TouchableOpacity
                                            style={styles.resetBtn}
                                            onPress={() => resetToDefault(cat.type)}
                                        >
                                            <Text style={styles.resetBtnText}>Reset to Default MRP</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.itemCount}>Will update {cat.count} items</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.individualContainer}>
                                {/* Filter Buttons */}
                                <View style={styles.filterContainer}>
                                    <TouchableOpacity
                                        style={[styles.filterBtn, itemFilter === 'all' && styles.filterBtnActive]}
                                        onPress={() => setItemFilter('all')}
                                    >
                                        <Text style={[styles.filterBtnText, itemFilter === 'all' && styles.filterBtnTextActive]}>
                                            All
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.filterBtn, itemFilter === 'product' && styles.filterBtnActive]}
                                        onPress={() => setItemFilter('product')}
                                    >
                                        <Text style={[styles.filterBtnText, itemFilter === 'product' && styles.filterBtnTextActive]}>
                                            Products
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.filterBtn, itemFilter === 'set' && styles.filterBtnActive]}
                                        onPress={() => setItemFilter('set')}
                                    >
                                        <Text style={[styles.filterBtnText, itemFilter === 'set' && styles.filterBtnTextActive]}>
                                            Gift Sets
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.filterBtn, itemFilter === 'attar' && styles.filterBtnActive]}
                                        onPress={() => setItemFilter('attar')}
                                    >
                                        <Text style={[styles.filterBtnText, itemFilter === 'attar' && styles.filterBtnTextActive]}>
                                            Attars
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Filtered Items */}
                                {allItems
                                    .filter(item => itemFilter === 'all' || item.type === itemFilter)
                                    .map((item) => (
                                        <View key={item.key} style={styles.itemRow}>
                                            <View style={styles.itemInfo}>
                                                <Text style={styles.itemName}>{item.name}</Text>
                                                <Text style={styles.itemSku}>{item.sku}</Text>
                                                <Text style={styles.itemPrice}>Default: ₹{item.cost_price}</Text>
                                            </View>
                                            <TextInput
                                                style={styles.priceInput}
                                                placeholder={item.cost_price}
                                                keyboardType="decimal-pad"
                                                value={prices[item.key] || ''}
                                                onChangeText={(val) => {
                                                    const cleaned = val.replace(/[^0-9.]/g, '');
                                                    handlePriceChange(item.key, cleaned);
                                                }}
                                            />
                                        </View>
                                    ))}
                            </View>
                        )}
                    </ScrollView>
                )}

                <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={savePrices}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>SAVE PRICES</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    closeBtn: {
        padding: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        margin: 16,
        borderRadius: 8,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#111827',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    massContainer: {
        padding: 16,
    },
    massCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    massTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    massLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 8,
    },
    massInputRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    massInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    applyBtn: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: 'center',
    },
    applyBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    orText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 12,
        marginVertical: 8,
    },
    resetBtn: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    resetBtnText: {
        color: '#374151',
        fontWeight: '500',
        fontSize: 14,
    },
    itemCount: {
        textAlign: 'center',
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
    },
    individualContainer: {
        padding: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 8,
    },
    filterBtn: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    filterBtnActive: {
        backgroundColor: '#6366F1',
        borderColor: '#6366F1',
    },
    filterBtnText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    filterBtnTextActive: {
        color: '#fff',
    },
    itemRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    itemInfo: {
        flex: 1,
        marginRight: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    itemSku: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 12,
        color: '#10B981',
        marginTop: 4,
    },
    priceInput: {
        width: 100,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        textAlign: 'right',
    },
    footer: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    saveBtn: {
        backgroundColor: '#10B981',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
