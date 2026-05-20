import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import DetailsScreen from '../screens/DetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WatchlistScreen from '../screens/WatchlistScreen';

import { Movie } from '../types/movie';

export type RootStackParamList = {
    Home: undefined;
    Search: undefined;
    Details: { movie: Movie };
    Settings: undefined;
    Watchlist: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
    <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: 'transparent' },
        }}
    >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen
            name="Watchlist"
            component={WatchlistScreen}
            options={{ animation: 'slide_from_bottom' }}
        />
    </Stack.Navigator>
);

export default AppNavigator;