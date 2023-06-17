import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, SectionList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ScreenLayout from '../components/ScreenLayout';
import { Env } from "../constants/Env";

const PortfolioScreen = ({ navigation }) => {
    const [portfolios, setPortfolios] = useState([]);
    const [title, setTitle] = useState('');
    const [goals, setGoals] = useState('');
    const [industries, setIndustries] = useState('');
    const [risks, setRisks] = useState('');
    const [preferences, setPreferences] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        fetchToken();
    }, []);

    useEffect(() => {
        if (token) {
            fetchPortfolios();
        }
    }, [token]);

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync('token');
            navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'There was an error logging out.');
        }
    };

    const fetchToken = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                setToken(token);
            } else {
                Alert.alert('Error', 'Token not found.');
            }
        } catch (error) {
            console.error('Error fetching token', error);
            Alert.alert('Error', 'There was an error fetching the token.');
        }
    };

    const fetchPortfolios = async () => {
        try {
            const response = await axios.get(`${Env.API_URL}/portfolios`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPortfolios(response.data.portfolios);
        } catch (error) {
            console.error('Error fetching portfolios', error);
            if (error.response && error.response.status === 401) {
                await handleLogout();
            }
        }
    };

    const clearForm = () => {
        setTitle('');
        setGoals('');
        setIndustries('');
        setRisks('');
        setPreferences('');
    };

    const savePortfolio = async () => {
        if (
            title.trim() === '' ||
            goals.trim() === '' ||
            industries.trim() === '' ||
            risks.trim() === ''
        ) {
            Alert.alert('Warning', 'Please fill in all required fields.');
            return;
        }

        try {
            const response = await axios.post(
                `${Env.API_URL}/portfolio`,
                {
                    title,
                    goals,
                    industries,
                    risks,
                    preferences,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log(response.data.message);
            Alert.alert('Success', 'Portfolio saved successfully.');
            await fetchPortfolios();
            clearForm();
        } catch (error) {
            console.error('Error saving portfolio', error);
            Alert.alert('Error', 'There was an error saving the portfolio.');
            if (error.response && error.response.status === 401) {
                await handleLogout();
            }
        }
    };

    const deletePortfolio = async (id) => {
        try {
            const response = await axios.delete(`${Env.API_URL}/portfolio/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data.message);
            Alert.alert('Success', 'Portfolio deleted successfully.');
            await fetchPortfolios();
        } catch (error) {
            console.error('Error deleting portfolio', error);
            Alert.alert('Error', 'There was an error deleting the portfolio.');
            if (error.response && error.response.status === 401) {
                await handleLogout();
            }
        }
    };

    const navigateToPortfolioItemScreen = (portfolioId) => {
        navigation.navigate('PortfolioItemScreen', { portfolioId });
    };

    const renderListItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigateToPortfolioItemScreen(item._id)}>
            <View style={styles.listItem}>
                <Text>{item.title}</Text>
                <Button title="Delete" onPress={() => deletePortfolio(item._id)} />
            </View>
        </TouchableOpacity>
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    );

    const sections =
        portfolios.length > 0 ? [{ title: 'Existing Portfolios', data: portfolios }] : [];

    return (
        <ScreenLayout navigation={navigation} title="Investment Portfolios">
            <View style={styles.createContainer}>
                <Text style={styles.sectionTitle}>Create New Portfolio:</Text>

                <Text style={styles.inputTitle}>Title*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter the portfolio title"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.inputTitle}>Goals*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your goals"
                    value={goals}
                    onChangeText={setGoals}
                />

                <Text style={styles.inputTitle}>Industries*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter preferred industries"
                    value={industries}
                    onChangeText={setIndustries}
                />

                <Text style={styles.inputTitle}>Risks*</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your risk tolerance"
                    value={risks}
                    onChangeText={setRisks}
                />

                <Text style={styles.inputTitle}>Preferences</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your preferences"
                    value={preferences}
                    onChangeText={setPreferences}
                />

                <TouchableOpacity style={styles.addButton} onPress={savePortfolio}>
                    <Text style={styles.addButtonText}>Add Portfolio</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
                <SectionList
                    style={styles.list}
                    sections={sections}
                    keyExtractor={(item, index) => item._id + index}
                    renderItem={renderListItem}
                    renderSectionHeader={renderSectionHeader}
                />
            </View>
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    createContainer: {
        width: '100%',
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    addButton: {
        marginTop: 5,
        marginBottom: 12,
        backgroundColor: '#2196F3',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    input: {
        marginBottom: 12,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
    },
    listContainer: {
        flex: 1,
        width: '100%',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
});

export default PortfolioScreen;
