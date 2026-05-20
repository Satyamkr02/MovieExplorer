import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import DetailsScreen from '../screens/DetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { Movie } from '../types/movie';

export type RootStackParamList = {
    Home: undefined;
    Search: undefined;
    Details: {
        movie: Movie;
    };
    Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },

                headerTitleStyle: {
                    fontWeight: '700',
                    color: '#111827',
                },

                headerTintColor: '#111827',

                contentStyle: {
                    backgroundColor: '#F5F5F5',
                },
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Details"
                component={DetailsScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;