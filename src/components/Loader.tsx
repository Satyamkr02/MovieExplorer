import React from 'react';
import { ActivityIndicator, View } from 'react-native';

const Loader = () => {
    return (
        <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
        </View>
    );
};

export default Loader;