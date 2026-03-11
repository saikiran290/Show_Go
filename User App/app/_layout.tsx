import { useEffect, useCallback } from 'react';
import { Stack, useRouter, SplashScreen, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { registerForPushNotificationsAsync, savePushToken } from '../config/notifications';

// Keep splash screen visible while checking auth
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { isLoggedIn, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'auth' || segments[0] === 'index';

        if (!isLoggedIn && !inAuthGroup) {
            // Redirect to auth if not logged in and not in auth group
            router.replace('/auth');
        } else if (isLoggedIn && inAuthGroup) {
            // Redirect to home if logged in and in auth group
            router.replace('/(tabs)/home');
        }
    }, [isLoggedIn, segments, loading]);

    useEffect(() => {
        if (!loading && isLoggedIn) {
            async function setupNotifications() {
                try {
                    const token = await registerForPushNotificationsAsync();
                    if (token) {
                        await savePushToken(token);
                    }
                } catch (e) {
                    console.log('Notification setup error:', e);
                }
            }
            setupNotifications();
        }
    }, [loading, isLoggedIn]);

    const onLayoutRootView = useCallback(async () => {
        if (!loading) {
            await SplashScreen.hideAsync();
        }
    }, [loading]);

    useEffect(() => {
        onLayoutRootView();
    }, [onLayoutRootView]);

    if (loading) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="light" />
                <RootLayoutNav />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
