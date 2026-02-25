import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    Alert,
    FlatList
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import client from '../../../../src/api/client';
import { Colors } from '@/constants/theme';
import { IMAGE_BASE_URL } from '../../../../src/api/config';
import Avatar from '../../../../src/components/Avatar';

const PRIMARY_COLOR = Colors.light.primary;

const getImageUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${IMAGE_BASE_URL}${cleanPath}`;
};

export default function PartyDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [party, setParty] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchParty = async () => {
        try {
            const response = await client.get(`/parties/${id}`);
            setParty(response.data);
        } catch (error) {
            console.error('Error fetching party:', error);
            Alert.alert('Error', 'Failed to fetch party details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParty();
    }, [id]);

    const renderTransaction = ({ item }: { item: any }) => {
        // Handle both Transaction and Order models gracefully
        const isOrder = !item.party_id || (!item.order_id && item.items); // Simple heuristic
        const displayId = isOrder ? item.id : (item.order_id || item.id);
        const displayDate = item.transaction_date || item.order_date || item.created_at;
        const displayAmount = isOrder ? item.total_amount : item.amount;
        const displayType = item.type || (isOrder ? 'order' : 'N/A');
        const displayDescription = item.description || (isOrder ? `${item.status?.toUpperCase()} Order` : (item.type === 'debit' ? 'Purchased Items' : 'Payment Received'));
        
        // Statuses
        const orderStatus = item.order?.status || item.status;
        const paymentStatus = item.order?.payment_status || item.payment_status;
        
        // Check for messages in either item.order.messages (Transaction) or item.messages (Order)
        const messages = item.order?.messages || item.messages || [];

        return (
            <TouchableOpacity
                style={styles.orderItem}
                onPress={() => displayId ? router.push(`/(app)/(tabs)/orders/${displayId}?fromParty=${id}` as any) : null}
            >
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.orderNumber}>
                                {isOrder || item.order_id ? `Order #${displayId}` : 'Transaction'}
                            </Text>
                            <Text style={styles.transactionDescription} numberOfLines={2}>
                                {displayDescription}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                                <Text style={styles.orderDate}>
                                    {displayDate ? new Date(displayDate).toLocaleDateString() : 'N/A'}
                                </Text>
                                {orderStatus && (
                                    <View style={[styles.statusBadge, { 
                                        backgroundColor: orderStatus === 'completed' ? '#D1FAE5' : (orderStatus === 'cancelled' ? '#FEE2E2' : '#FEF3C7') 
                                    }]}>
                                        <Text style={[styles.statusBadgeText, { 
                                            color: orderStatus === 'completed' ? '#065F46' : (orderStatus === 'cancelled' ? '#991B1B' : '#92400E') 
                                        }]}>
                                            {orderStatus.toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                {paymentStatus && (
                                    <View style={[styles.statusBadge, { 
                                        backgroundColor: paymentStatus === 'paid' ? '#D1FAE5' : (paymentStatus === 'unpaid' ? '#FEE2E2' : '#FEF3C7') 
                                    }]}>
                                        <Text style={[styles.statusBadgeText, { 
                                            color: paymentStatus === 'paid' ? '#065F46' : (paymentStatus === 'unpaid' ? '#991B1B' : '#92400E') 
                                        }]}>
                                            {paymentStatus.toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                            <Text style={[
                                styles.orderAmount,
                                { color: (item.type === 'debit' || item.type === 'purchase' || isOrder) ? '#EF4444' : '#10B981' }
                            ]}>
                                {(item.type === 'debit' || item.type === 'purchase' || isOrder) ? '-' : '+'}₹{displayAmount}
                            </Text>
                            <Text style={styles.transactionTypeBadge}>
                                {displayType.toUpperCase()}
                            </Text>
                            {(item.order || isOrder) && (
                                <Text style={[styles.orderDate, { marginTop: 4, fontWeight: 'bold' }]}>
                                    Bal: ₹{((item.order?.total_amount || item.total_amount || 0) - (item.order?.paid_amount || item.paid_amount || 0)).toFixed(2)}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Messages History - Highlighted */}
                    {messages && messages.length > 0 && (
                        <View style={styles.highlightedMessagesContainer}>
                            <View style={styles.messageHeader}>
                                <Ionicons name="chatbubbles-outline" size={14} color={PRIMARY_COLOR} />
                                <Text style={styles.messageHeaderText}>Recent Message History</Text>
                            </View>
                            {messages.map((msg: any, idx: number) => (
                                <View key={msg.id || idx} style={styles.orderMessageItem}>
                                    <View style={styles.messageDot} />
                                    <Text style={styles.orderMessageText} numberOfLines={2}>{msg.message}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
        );
    }

    if (!party) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Party not found</Text>
            </View>
        );
    }

    const transactions = party.transactions || party.orders || [];

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: `Party Details`, headerTintColor: '#000', headerStyle: { backgroundColor: '#fff' } }} />

            {/* Header / Actions */}
            <View style={styles.headerRow}>
                <Avatar uri={getImageUrl(party.image_path)} name={party.name} size={50} />
                <View style={{ flex: 1, marginHorizontal: 12, justifyContent: 'center' }}>
                    <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{party.name}</Text>
                    <Text style={styles.headerSubtitle} numberOfLines={1}>
                        {party.type.toUpperCase()} • {party.phone || 'No Phone'}
                    </Text>
                </View>
                <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
                     <Text style={styles.balanceLabel}>Balance</Text>
                     <Text style={[styles.balanceAmount, { color: party.balance >= 0 ? '#10B981' : '#EF4444' }]}>
                        ₹{Math.abs(party.balance).toFixed(2)}
                     </Text>
                     <Text style={styles.balanceType}>{party.balance >= 0 ? 'Advanced' : 'Due'}</Text>
                </View>
            </View>

            {/* Basic Info Card */}
            <View style={styles.card}>

                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={18} color="#6B7280" />
                        <Text style={styles.infoText}>{party.phone || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={18} color="#6B7280" />
                        <Text style={styles.infoText}>{party.email || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={18} color="#6B7280" />
                        <Text style={styles.infoText}>{party.address || 'N/A'}</Text>
                    </View>
                     <View style={styles.infoRow}>
                        <Ionicons name="document-text-outline" size={18} color="#6B7280" />
                        <Text style={styles.infoText}>GST: {party.gst_no || 'N/A'}</Text>
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => router.push(`/(app)/(tabs)/parties/form?id=${party.id}` as any)}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.editButtonText}>Edit Party</Text>
                </TouchableOpacity>
            </View>

            {/* Transaction History */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
            </View>

            {transactions && transactions.length > 0 ? (
                <View style={styles.ordersList}>
                    {transactions.map((transaction: any) => (
                        <View key={transaction.id} style={styles.orderWrapper}>
                            {renderTransaction({ item: transaction })}
                        </View>
                    ))}
                </View>
            ) : (
                <View style={[styles.card, styles.center, { padding: 30 }]}>
                    <Text style={styles.emptyText}>No transactions found</Text>
                </View>
            )}
            
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    typeBadge: {
        fontSize: 10,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    balanceLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    balanceAmount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    balanceType: {
        fontSize: 10,
        color: '#6B7280',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f0f0f0',
    },
    headerInfo: {
        marginLeft: 16,
        flex: 1,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    type: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
        backgroundColor: '#E5E7EB',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    balance: {
        fontSize: 16,
        color: '#10B981',
        fontWeight: 'bold',
        marginTop: 6,
    },
    infoSection: {
        gap: 12,
        marginBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        color: '#374151',
        fontSize: 14,
        flex: 1,
    },
    sectionHeader: {
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    ordersList: {
        gap: 12,
    },
    orderWrapper: {
        marginBottom: 10,
    },
    orderItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    orderDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    transactionDescription: {
        fontSize: 13,
        color: '#374151',
        marginTop: 2,
    },
    transactionTypeBadge: {
        fontSize: 10,
        color: '#9CA3AF',
        fontWeight: 'bold',
        marginTop: 4,
    },
    orderAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    orderStatus: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 4,
        textAlign: 'right',
    },
    orderMessagesContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: 4,
    },
    orderMessageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    orderMessageText: {
        fontSize: 12,
        color: '#4B5563',
        flex: 1,
    },
    highlightedMessagesContainer: {
        marginTop: 12,
        padding: 10,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: PRIMARY_COLOR,
        gap: 6,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    messageHeaderText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: PRIMARY_COLOR,
        textTransform: 'uppercase',
    },
    messageDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
        marginTop: 6,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 16,
    },
    emptyText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    editButton: {
        backgroundColor: PRIMARY_COLOR,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
