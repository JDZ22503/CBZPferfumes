import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useAuth } from '../../../../src/context/AuthContext';

export default function AttarsLayout() {
    const { logout } = useAuth();

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="index"
                options={({ navigation }) => ({
                    title: 'Attars',
                    headerShown: true,
                    headerLeftContainerStyle: { paddingLeft: 15 },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                            <Ionicons name="menu-outline" size={28} color="#000" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
                            <Ionicons name="log-out-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen name="form" options={{ title: 'Attar Details', headerShown: true }} />
        </Stack>
    );
}
