import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useAuth } from '../../../src/context/AuthContext';
import { TouchableOpacity } from 'react-native';

export default function AppLayout() {
    const { logout } = useAuth();

    return (
        <Tabs screenOptions={({ navigation }) => ({
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{ marginLeft: 15 }}>
                    <Ionicons name="menu-outline" size={28} color="#000" />
                </TouchableOpacity>
            ),
            headerRight: () => (
                <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
                    <Ionicons name="log-out-outline" size={24} color="#000" />
                </TouchableOpacity>
            ),
        })}>
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="products/index"
                options={{
                    title: 'Products',
                    href: null, // Hide from tab bar
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cube-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="attars/index"
                options={{
                    title: 'Attars',
                    href: null, // Hide from tab bar
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="flower-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="parties/index"
                options={{
                    title: 'Parties',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* Hide Form Routes from Tab Bar */}
            <Tabs.Screen name="products/form" options={{ href: null }} />
            <Tabs.Screen name="attars/form" options={{ href: null }} />
            <Tabs.Screen name="parties/form" options={{ href: null }} />

            {/* Other routes to keep Tab Bar visible */}
            <Tabs.Screen name="inventory" options={{ href: null }} />
            <Tabs.Screen name="settings" options={{ href: null }} />
            <Tabs.Screen name="product-sets" options={{ href: null, headerShown: false }} />
        </Tabs>
    );
}
