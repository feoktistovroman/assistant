import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Button, Alert } from 'react-native';
import axios from 'axios';
import ScreenLayout from '../components/ScreenLayout';
import { MaterialIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Constants from "expo-constants";

const PortfolioAssistantScreen = ({ route, navigation }) => {
    const [investmentData, setInvestmentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { portfolioId } = route.params;
    const [token, setToken] = useState('');
    const [portfolio, setPortfolio] = useState(null);

    useEffect(() => {
        fetchTokenAndPortfolio();
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
            Alert.alert('Error', 'There was an error logging out.');
        }
    };

    const fetchTokenAndPortfolio = async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                setToken(token);
                const response = await axios.get(`${Constants.expoConfig.extra.API_URL}/portfolio/${portfolioId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPortfolio(response.data.portfolio);
            } else {
                Alert.alert('Error', 'Token not found.');
            }
        } catch (error) {
            console.error('Error fetching token', error);
            if (error.response && error.response.status === 401) {
                handleLogout();
            } else {
                Alert.alert('Error', 'There was an error fetching the token.');
            }
        }
    };

    const importToPortfolio = async () => {
        try {
            // Use the current stocks from the state
            const currentStocks = portfolio.stocks || [];

            // Append new stocks to the existing ones
            const stocksToUpdate = currentStocks.concat(
                investmentData.portfolio.map(stock => ({
                    ticker: stock.ticker,
                    percentage: stock.percentage,
                }))
            );

            // Send the updated stocks array via PATCH request
            const updateResponse = await axios.patch(`${Constants.expoConfig.extra.API_URL}/portfolio/${portfolioId}`, {
                stocks: stocksToUpdate,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (updateResponse.status === 200) {
                navigation.navigate('PortfolioItemScreen', { portfolioId });
            } else {
                Alert.alert('Error', 'There was an error importing the portfolio.');
            }
        } catch (error) {
            console.error('Error importing the portfolio:', error);
            Alert.alert('Error', 'There was an error importing the portfolio.');
        }
    };

    const fetchData = async () => {
        try {
            const request = [
                {
                    role: 'system',
                    content: 'You are the stock-based system. You make recommendations to investors based on their high-level preferences. You always return responses as JSON code snippet. The JSON format is as follows: { "portfolio": [{ "ticker": "placeholder", "company": "placeholder", "industry": "placeholder", "percentage": "placeholder" }], "strategy": "strategy text" }. Provide percentage value as a digit without % sign.'
                },
                {
                    role: 'user',
                    content: 'I want to start investing in US stocks. Ask me questions and determine which investment portfolio is best for me.'
                },
                {
                    role: 'assistant',
                    content: 'Sure! I will ask you several questions to better understand your preferences:\n\n1. With what amount are you most comfortable starting to build a portfolio?\n\n2. How much of your monthly budget do you plan to invest in stocks?\n\n3. How do you rate your risk tolerance? Are you willing to take on high risk for potentially high returns, or do you prefer a more conservative approach?\n\n4. What investment term are you considering? Short-term investments (1-3 years), medium-term (4-6 years), or long-term (7 years or more)?\n\n5. What is your investment goal? (e.g., retirement, real estate, education, wealth accumulation)\n\n6. Do you have a preference for specific industries or companies in which you would like to invest? (e.g., technology, oil, healthcare)\n\n7. Do you prefer active investing (frequent trades, active portfolio management) or passive investing (long-term investments in index funds or ETFs)?\n\n8. Do you have some preferences?\n\n9. Provide me with your current portfolio stocks in JSON format.'
                },
                {
                    role: 'user',
                    content: `1. ${portfolio.moneyToInvest}. 2. ${portfolio.monthlyInvestment}. 3. ${portfolio.riskLevel}. 4. ${portfolio.investmentYears}. 5. ${portfolio.goals}. 6. ${portfolio.industries}. 7. ${portfolio.risks}. 8. ${portfolio.preferences}. 9. ${portfolio.stocks ? portfolio.stocks.toString() : 'Currently my portfolio is empty'}. Based on your recommendation, return concrete stocks as JSON. The JSON format is as follows: { "portfolio": [{ "ticker": "placeholder", "company": "placeholder", "industry": "placeholder", "percentage": "placeholder" }], "strategy": "strategy text" }`
                },
            ];

            const response = await axios.post(
                Constants.expoConfig.extra.OPENAI_API_URL,
                {
                    messages: request,
                    model: 'gpt-3.5-turbo',
                    max_tokens: 3000,
                    n: 1
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${Constants.expoConfig.extra.OPENAI_API_KEY}`,
                    },
                }
            );

            // Extract the generated response from the API
            const generatedResponse = response.data.choices[0].message.content;

            console.log(generatedResponse);
            // Process the generated response and extract investment recommendations
            const recommendations = processGeneratedResponse(generatedResponse);

            // Set the investment data and stop loading
            setInvestmentData(recommendations);
            setIsLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (portfolio) {
            fetchData();
        }
    }, [portfolio]);

    const onReloadPress = () => {
        setIsLoading(true);
        fetchData();
    };

    const processGeneratedResponse = (generatedResponse) => {
        try {
            const startIndex = generatedResponse.indexOf('{');
            const endIndex = generatedResponse.lastIndexOf('}');
            const jsonString = generatedResponse.substring(startIndex, endIndex + 1);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return {};
        }
    };

    const renderHeader = () => (
        <View style={styles.headerRow}>
            <Text style={styles.headerText}>Ticker</Text>
            <Text style={styles.headerText}>Stock</Text>
            <Text style={styles.headerText}>Industry</Text>
            <Text style={styles.headerText}>Share</Text>
        </View>
    );

    const renderItem = ({ item, index }) => (
        <View style={[styles.row, { backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#e9e9e9' }]}>
            <Text style={styles.cellText} numberOfLines={1} ellipsizeMode='tail'>{item.ticker}</Text>
            <Text style={styles.cellText} numberOfLines={1} ellipsizeMode='tail'>{item.company}</Text>
            <Text style={styles.cellText} numberOfLines={1} ellipsizeMode='tail'>{item.industry}</Text>
            <Text style={styles.cellText} numberOfLines={1} ellipsizeMode='tail'>{item.percentage}%</Text>
        </View>
    );

    return (
        <ScreenLayout navigation={navigation} title="Portfolio Assistant">
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    {isLoading ? (
                        <Text style={styles.loadingText}>Generating investment recommendations...</Text>
                    ) : (
                        <>
                            {investmentData && investmentData.portfolio && investmentData.strategy ? (
                                <>
                                    <View style={styles.header}>
                                        <Text style={styles.tableHeader}>Portfolio:</Text>
                                        <TouchableOpacity onPress={onReloadPress}>
                                            <MaterialIcons name="refresh" size={24} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.table}>
                                        {renderHeader()}
                                        <FlatList
                                            data={investmentData.portfolio}
                                            renderItem={renderItem}
                                            keyExtractor={(item) => item.ticker}
                                            style={styles.tableContent}
                                            contentContainerStyle={styles.flatListContent}
                                        />
                                    </View>
                                    <Button title="Import to Portfolio" onPress={importToPortfolio} />
                                    <Text style={styles.tableHeader}>Strategy:</Text>
                                    <Text style={styles.strategyText}>{investmentData.strategy}</Text>
                                </>
                            ) : (
                                <Text style={styles.errorText}>No investment recommendations found.</Text>
                            )}
                        </>
                    )}
                </View>
            </SafeAreaView>
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        color: 'red',
    },
    tableHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    table: {
        borderColor: '#ccc',
        borderWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f4f4f4',
        padding: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    headerText: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
        width: '22%',
        marginRight: '3%',
    },
    cellText: {
        fontSize: 16,
        width: '22%',
        marginRight: '3%',
        textAlign: 'center',
    },
    strategyText: {
        fontSize: 16,
    },
});

export default PortfolioAssistantScreen;
