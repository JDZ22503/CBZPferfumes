import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '../../src/components/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function AppLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: false,
                    drawerActiveBackgroundColor: Colors.light.primary + '10', // 10% opacity primary
                    drawerActiveTintColor: Colors.light.primary,
                    drawerInactiveTintColor: '#000',
                    drawerLabelStyle: { marginLeft: -20, fontSize: 15, fontWeight: '500' },
                }}
            >
                <Drawer.Screen
                    name="(tabs)"
                    options={{
                        drawerLabel: 'Dashboard',
                        drawerItemStyle: { display: 'none' }, // Hiding default entry, we manage in CustomDrawerContent
                    }}
                />
                <Drawer.Screen
                    name="product-sets" // Points to product-sets/_layout.tsx
                    options={{
                        drawerLabel: 'Product Sets',
                        headerShown: false, // Stack handles header
                        drawerItemStyle: { display: 'none' }
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
