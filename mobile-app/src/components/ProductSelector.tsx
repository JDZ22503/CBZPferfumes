import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import client from '../api/client';
import { IMAGE_BASE_URL } from '../api/config';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 2; // 20 padding side + 20 gap

interface ProductSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: any, action: 'add' | 'remove' | 'delete') => void;
    priceType: 'sale' | 'purchase';
    customPrices?: any;
    currentItems?: any[]; // New Prop
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ visible, onClose, onSelect, priceType, customPrices, currentItems }) => {
    const [activeTab, setActiveTab] = useState<'product' | 'gift' | 'attar'>('product');
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Internal cache to avoid refetching constantly if desired, 
    // but for simplicity we'll fetch on tab change or mount.

    useEffect(() => {
        if (visible) {
            fetchItems();
        }
    }, [visible, activeTab]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            let endpoint = '';
            switch (activeTab) {
                case 'product': endpoint = '/products'; break;
                case 'attar': endpoint = '/attars'; break;
                case 'gift': endpoint = '/product-sets'; break; // Now implemented
                default: endpoint = '/products';
            }

            const res = await client.get(endpoint);
            // Assuming API returns { data: [...] } for pagination or list
            setItems(res.data.data || res.data || []); // Handle paginated or list response
        } catch (error) {
            console.error('Failed to fetch items', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredItems = () => {
        if (!query) return items;
        return items.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));
    };

    const getImageUrl = (path: string) => {
        if (!path) return 'https://via.placeholder.com/150';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${IMAGE_BASE_URL}${cleanPath}`;
    };

    const getPrice = (item: any) => {
        // Priority 1: Custom Prices from Party Product Prices Table
        if (customPrices) {
            let override = null;
            if (activeTab === 'product' && customPrices.product[item.id]) override = customPrices.product[item.id];
            else if (activeTab === 'gift' && customPrices.set[item.id]) override = customPrices.set[item.id];
            else if (activeTab === 'attar' && customPrices.attar[item.id]) override = customPrices.attar[item.id];

            if (override !== null && override !== undefined) return override;
        }

        // Priority 2: Wholesale/Cost Price Strategy
        // User requested cost_price for BOTH customers and suppliers (Shop Person logic)
        const cost = parseFloat(item.cost_price || 0);
        const price = parseFloat(item.price || 0);

        // Use cost_price if available, otherwise fallback to price (just in case)
        return cost > 0 ? cost : price;
    };

    const getQty = (item: any) => {
        if (!currentItems) return 0;
        // Determine type based on active tab for matching
        const type = activeTab === 'gift' ? 'set' : (activeTab === 'attar' ? 'attar' : 'product');
        const found = currentItems.find((i: any) => i.item_id === item.id && i.item_type === type);
        return found ? parseFloat(found.quantity) : 0;
    };

    const renderItem = ({ item }: { item: any }) => {
        const displayPrice = getPrice(item);
        const qty = getQty(item);

        return (
            <View style={styles.card}>
                <Image source={{ uri: getImageUrl(item.image_path) }} style={styles.cardImage} resizeMode="cover" />

                <View style={styles.cardContent}>
                    <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardCategory}>
                        {activeTab === 'gift' ? 'Gift Set' : (activeTab === 'attar' ? 'Attar' : 'Product')}
                    </Text>

                    <Text style={styles.price}>₹{displayPrice.toFixed(2)}</Text>

                    {qty === 0 ? (
                        <TouchableOpacity
                            style={styles.addToCartBtn}
                            onPress={() => onSelect({
                                ...item,
                                price: displayPrice,
                                _type: activeTab === 'gift' ? 'set' : (activeTab === 'attar' ? 'attar' : 'product')
                            }, 'add')}
                        >
                            <Ionicons name="cart-outline" size={18} color="#fff" style={{ marginRight: 5 }} />
                            <Text style={styles.addToCartText}>Add</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.counterContainer}>
                            <TouchableOpacity
                                style={styles.counterBtn}
                                onPress={() => onSelect({
                                    ...item,
                                    price: displayPrice,
                                    _type: activeTab === 'gift' ? 'set' : (activeTab === 'attar' ? 'attar' : 'product')
                                }, 'remove')}
                            >
                                <Ionicons name="remove" size={18} color="#fff" />
                            </TouchableOpacity>

                            <Text style={styles.counterText}>{qty}</Text>

                            <TouchableOpacity
                                style={styles.counterBtn}
                                onPress={() => onSelect({
                                    ...item,
                                    price: displayPrice,
                                    _type: activeTab === 'gift' ? 'set' : (activeTab === 'attar' ? 'attar' : 'product')
                                }, 'add')}
                            >
                                <Ionicons name="add" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Select Item</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search items..."
                        value={query}
                        onChangeText={setQuery}
                        autoCorrect={false}
                    />
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity style={[styles.tab, activeTab === 'product' && styles.activeTab]} onPress={() => setActiveTab('product')}>
                        <Text style={[styles.tabText, activeTab === 'product' && styles.activeTabText]}>Products</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'gift' && styles.activeTab]} onPress={() => setActiveTab('gift')}>
                        <Text style={[styles.tabText, activeTab === 'gift' && styles.activeTabText]}>Gift Sets</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, activeTab === 'attar' && styles.activeTab]} onPress={() => setActiveTab('attar')}>
                        <Text style={[styles.tabText, activeTab === 'attar' && styles.activeTabText]}>Attars</Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                    </View>
                ) : (
                    <FlatList
                        data={getFilteredItems()}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        contentContainerStyle={styles.listContent}
                        columnWrapperStyle={styles.columnWrapper}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Confirm Button Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.confirmButton} onPress={onClose}>
                        <Text style={styles.confirmButtonText}>Confirm Order / Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerTitle: { fontSize: 18, fontWeight: '600', color: '#111' },
    closeButton: { padding: 4 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, height: 44, color: '#111' },
    tabContainer: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10 },
    tab: { marginRight: 12, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#e5e7eb' },
    activeTab: { backgroundColor: '#4F46E5' },
    tabText: { color: '#4b5563', fontWeight: '500' },
    activeTabText: { color: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { paddingHorizontal: 16, paddingBottom: 80 },
    columnWrapper: { justifyContent: 'space-between' },
    card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    cardImage: { width: '100%', height: 120, backgroundColor: '#f3f4f6' },
    cardContent: { padding: 10 },
    cardTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 },
    cardCategory: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
    price: { fontSize: 16, fontWeight: '700', color: '#4F46E5', marginBottom: 8 },
    addToCartBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4F46E5', paddingVertical: 8, borderRadius: 6 },
    addToCartText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        elevation: 10,
    },
    confirmButton: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    // Counter Styles
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#e0e7ff', // Light Indigo
        borderRadius: 6,
        padding: 4,
    },
    counterBtn: {
        backgroundColor: '#4338CA',
        borderRadius: 4,
        padding: 4,
    },
    counterText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111',
        marginHorizontal: 8,
    }
});

export default ProductSelector;
