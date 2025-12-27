import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function CustomDrawerContent(props: any) {
    const { logout, user } = useAuth();
    const router = useRouter();

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={styles.container}
            scrollEnabled={true}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.platformText}>Platform</Text>
                <Text style={styles.headerTitle}>Perfumes</Text>
            </View>

            {/* Drawer Items */}
            <View style={styles.itemsContainer}>
                <DrawerItem
                    label="Dashboard"
                    icon={({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />}
                    onPress={() => router.push('/(app)/(tabs)/dashboard' as any)}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Parties"
                    icon={({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />}
                    onPress={() => router.push('/(app)/(tabs)/parties' as any)}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Products"
                    icon={({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />}
                    onPress={() => router.push('/(app)/(tabs)/products' as any)}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Product Sets(Gift Sets)"
                    icon={({ color, size }) => <Ionicons name="gift-outline" size={size} color={color} />}
                    onPress={() => router.push('/(app)/(tabs)/product-sets' as any)}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Attars"
                    icon={({ color, size }) => <Ionicons name="water-outline" size={size} color={color} />}
                    onPress={() => router.push('/(app)/(tabs)/attars' as any)}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Orders"
                    icon={({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} />}
                    onPress={() => router.push('/(app)/(tabs)/orders' as any)}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Inventory"
                    icon={({ color, size }) => <Ionicons name="layers-outline" size={size} color={color} />}
                    onPress={() => router.push('/(app)/(tabs)/inventory' as any)}
                    labelStyle={styles.label}
                />
                <DrawerItem
                    label="Settings"
                    icon={({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />}
                    onPress={() => router.push('/(app)/(tabs)/settings' as any)}
                    labelStyle={styles.label}
                />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={{ padding: 5 }}>
                    <Ionicons name="log-out-outline" size={20} color="#000" />
                </TouchableOpacity>
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 5,
        letterSpacing: 0.5,
    },
    platformText: {
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    itemsContainer: {
        flex: 1,
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff', // Ensure clean bg
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#374151',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userName: {
        color: '#111827',
        fontWeight: '600',
        fontSize: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
        marginLeft: -10, // Tweak alignment
    }
});
