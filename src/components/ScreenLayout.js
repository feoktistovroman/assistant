import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import BackButton from './BackButton';

const ScreenLayout = ({ navigation, title, children }) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <BackButton goBack={navigation.goBack} />
                <Text style={styles.title}>{title}</Text>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    }
});

export default ScreenLayout;
