import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import DetailsScreen from '../screens/DetailsScreen';

import { Movie } from '../types/movie';

export type RootStackParamList = {
    Home: undefined;
    Search: undefined;
    Details: {
        movie: Movie;
    };
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
                options={{
                    title: 'Movie Explorer',
                }}
            />

            <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{
                    title: 'Search Movies',
                }}
            />

            <Stack.Screen
                name="Details"
                component={DetailsScreen}
                options={{
                    title: 'Movie Details',
                }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;