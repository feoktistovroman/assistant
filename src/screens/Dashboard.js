import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Env } from "Env";

export default function Dashboard({ navigation }) {
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');

                const response = await axios.get(`${Env.API_URL}/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessage(response.data.message);
            } catch (error) {
                console.error(error);
                if (error.response && error.response.status === 401) {
                    await handleLogout();
                }
            }
        };

        fetchDashboardData();
    }, []);

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('token');
            navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <Logo />
            <Header>Let’s start</Header>
            <View style={styles.messageContainer}>
                <Header>{message}</Header>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('PortfolioScreen')}
                >
                    My Portfolios
                </Button>
                <Button mode="outlined" onPress={handleLogout}>
                    Logout
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageContainer: {
        marginBottom: 16,
    },
    buttonContainer: {
        width: '80%',
    },
});
