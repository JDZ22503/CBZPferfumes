import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useAuth } from '../../../../src/context/AuthContext';

export default function OrdersLayout() {
    const { logout } = useAuth();
    const router = useRouter();

    return (
        <Stack screenOptions={{ headerShown: false }}>

            <Stack.Screen
                name="index"
                options={({ navigation }) => ({
                    title: ' Orders',
                    headerShown: true,
                    headerLeftContainerStyle: { paddingLeft: 15 },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                            <Ionicons name="menu-outline" size={28} color="#000" />
                        </TouchableOpacity>
                    ),

                })}
            />
            <Stack.Screen name="create" options={{ title: 'New Order', headerShown: true }} />
            <Stack.Screen name="[id]" options={{ title: 'Order Details', headerShown: true }} />
        </Stack>
    );
}
