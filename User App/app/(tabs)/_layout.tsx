import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Home, Search, Ticket, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#0B0B15',
                borderTopColor: '#1F1F2E',
                borderTopWidth: 1,
                height: 60 + insets.bottom,
                paddingBottom: insets.bottom,
                paddingTop: 10,
                elevation: 0,
            },
            tabBarActiveTintColor: '#8A2BE2',
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarShowLabel: true,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginBottom: 5 },
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => <Home color={color} size={24} />
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color, size }) => <Search color={color} size={24} />
                }}
            />
            <Tabs.Screen
                name="tickets"
                options={{
                    title: "Tickets",
                    tabBarIcon: ({ color, size }) => <Ticket color={color} size={24} />
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => <User color={color} size={24} />
                }}
            />
        </Tabs>
    );
}
