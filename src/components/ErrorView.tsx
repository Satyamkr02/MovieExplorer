import React from 'react';
import { Text, View } from 'react-native';

interface Props {
    message: string;
}

const ErrorView = ({ message }: Props) => {
    return (
        <View style={{ padding: 20 }}>
            <Text>{message}</Text>
        </View>
    );
};

export default ErrorView;