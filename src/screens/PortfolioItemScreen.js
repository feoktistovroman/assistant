import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import Paragraph from '../components/Paragraph';
import Slider from '@react-native-community/slider';
import ScreenLayout from '../components/ScreenLayout';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { Env } from "../constants/Env";

const PortfolioItemScreen = ({ route, navigation }) => {
  const [moneyToInvest, setMoneyToInvest] = useState(5000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(200);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [investmentYears, setInvestmentYears] = useState(5);
  const { portfolioId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState('');
  const [portfolio, setPortfolio] = useState(null);

  useEffect(() => {
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      fetchPortfolio();
    }
  }, [token]);

  useEffect(() => {
    if (portfolio) {
      updatePortfolio();
    }
  }, [moneyToInvest, monthlyInvestment, riskLevel, investmentYears]);

  useFocusEffect(
      React.useCallback(() => {
        if (portfolio && portfolio.calculator) {
          setMoneyToInvest(portfolio.calculator.moneyToInvest);
          setMonthlyInvestment(portfolio.calculator.monthlyInvestment);
          setRiskLevel(portfolio.calculator.riskLevel);
          setInvestmentYears(portfolio.calculator.investmentYears);
        }
      }, [])
  );

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

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`${Env.API_URL}/portfolio/${portfolioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPortfolio(response.data.portfolio);
    } catch (error) {
      console.error('Error fetching portfolio', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      } else {
        Alert.alert('Error', 'Failed to fetch portfolio.');
      }
    }
  };

  const updatePortfolio = async () => {
    try {
      await axios.patch(
          `${Env.API_URL}/portfolio/${portfolioId}`,
          {
            calculator: {
              moneyToInvest,
              monthlyInvestment,
              riskLevel,
              investmentYears,
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
      );
      // After successfully updating the portfolio, fetch the updated portfolio
      await fetchPortfolio();
    } catch (error) {
      console.error('Error updating portfolio', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      } else {
        Alert.alert('Error', 'Failed to update portfolio.');
      }
    }
  };

  const calculateInvestmentReturn = () => {
    const riskMultiplier = getRiskMultiplier(riskLevel);
    const multiplierCoefficient = getMultiplierCoefficient(riskLevel);
    let totalInvestment = moneyToInvest;
    let investmentReturn = totalInvestment;

    for (let i = 0; i < investmentYears; i++) {
      totalInvestment += monthlyInvestment * 12;
      investmentReturn += monthlyInvestment * 12;
      investmentReturn *= 1 + riskMultiplier * multiplierCoefficient;
    }

    // Calculate the difference in percentage
    const percentageDifference = (
        ((investmentReturn - totalInvestment) / totalInvestment) *
        100
    ).toFixed(2);

    return {
      investmentReturn: investmentReturn.toFixed(2),
      percentageDifference,
    };
  };

  const getRiskMultiplier = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 0.07; // 7%
      case 'medium':
        return 0.1; // 10%
      case 'high':
        return 0.12; // 12%
      default:
        return 0.1; // Default to medium risk level
    }
  };

  const getMultiplierCoefficient = (riskLevel) => {
    switch (riskLevel) {
      case 'low':
        return 0.5;
      case 'medium':
        return 1;
      case 'high':
        return 1.5;
      default:
        return 1;
    }
  };

  const totalInvestments =
      moneyToInvest + monthlyInvestment * investmentYears * 12;

  return (
      <ScreenLayout navigation={navigation} title={portfolio?.title || ''}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity
              style={styles.infoIcon}
              onPress={() => setModalVisible(true)}
          >
            <Icon name="info-circle" size={24} color="#000" />
          </TouchableOpacity>

          <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text>What's your investment goal?: {portfolio?.goals}</Text>
                <Text>
                  Do you have a preference for industries or companies?:
                  {portfolio?.industries}
                </Text>
                <Text>
                  Do you prefer active investing or passive?: {portfolio?.risks}
                </Text>
                <Text>
                  Notices and preferences included in recommendations:
                  {portfolio?.preferences}
                </Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.textStyle}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Text style={styles.title}>Investment Calculator</Text>
          <Paragraph style={styles.description}>
            Adjust the sliders and select the risk level to calculate your
            expected return on investment.
          </Paragraph>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              With what amount are you most comfortable starting to build a
              portfolio?
            </Text>
            <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={100000}
                step={100}
                value={moneyToInvest}
                onValueChange={(value) => setMoneyToInvest(value)}
            />
            <Text>${moneyToInvest}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              How much of your monthly budget do you plan to invest in stocks?
            </Text>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={30000}
                step={100}
                value={monthlyInvestment}
                onValueChange={(value) => setMonthlyInvestment(value)}
            />
            <Text>${monthlyInvestment}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              How do you rate your risk tolerance? Are you willing to take on high
              risk for potentially high returns, or do you prefer a more
              conservative approach?
            </Text>
            <View style={styles.radioButtonContainer}>
              <TouchableOpacity
                  style={[
                    styles.radioButton,
                    riskLevel === 'low' && styles.radioButtonSelected,
                  ]}
                  onPress={() => setRiskLevel('low')}
              >
                <Text style={styles.radioButtonText}>Low</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[
                    styles.radioButton,
                    riskLevel === 'medium' && styles.radioButtonSelected,
                  ]}
                  onPress={() => setRiskLevel('medium')}
              >
                <Text style={styles.radioButtonText}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={[
                    styles.radioButton,
                    riskLevel === 'high' && styles.radioButtonSelected,
                  ]}
                  onPress={() => setRiskLevel('high')}
              >
                <Text style={styles.radioButtonText}>High</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              What investment term are you considering? Short-term investments
              (1-3 years), medium-term (4-6 years) or long-term (7 years or
              more)?
            </Text>
            <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={30}
                step={1}
                value={investmentYears}
                onValueChange={(value) => setInvestmentYears(value)}
            />
            <Text>{investmentYears} years</Text>
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Total Investments:</Text>
            <Text style={styles.resultAmount}>${totalInvestments}</Text>
          </View>

          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Expected Return:</Text>
            <Text style={styles.resultAmount}>
              ${calculateInvestmentReturn().investmentReturn}
            </Text>
            <Text style={styles.resultAmount}>
              {calculateInvestmentReturn().percentageDifference}%
            </Text>
          </View>

          <TouchableOpacity
              style={styles.button}
              onPress={() =>
                  navigation.navigate('PortfolioAssistantScreen', { portfolioId })
              }
          >
            <Text style={styles.buttonText}>Portfolio AI Assistant</Text>
          </TouchableOpacity>
          <Paragraph style={styles.buttonDescription}>
            Use artificial intelligence to shape your portfolio based on the
            calculator inputs.
          </Paragraph>

          {/* List of portfolio.stocks */}
          {portfolio?.stocks && (
              <View style={styles.stocksContainer}>
                <Text style={styles.stocksTitle}>Stocks in Portfolio:</Text>
                <FlatList
                    data={portfolio.stocks}
                    keyExtractor={(item) => item.ticker}
                    renderItem={({ item }) => (
                        <View style={styles.stockItem}>
                          <Text style={styles.stockColumn}>{item.ticker}</Text>
                          <Text style={styles.stockColumn}>{item.percentage}%</Text>
                        </View>
                    )}
                />
              </View>
          )}
        </ScrollView>
      </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 32,
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 10, // Padding around the content
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    color: '#636e72',
  },
  inputContainer: {
    marginBottom: 16,
  },
  slider: {
    marginBottom: 16,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'gray',
    marginLeft: 5,
    borderRadius: 8,
  },
  radioButtonText: {
    marginLeft: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#DDDDDD',
  },
  resultContainer: {
    marginTop: 32,
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2d3436',
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6ab04c',
  },
  button: {
    backgroundColor: '#6ab04c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 32,
    width: '100%', // This ensures that the button takes the full width
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonDescription: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  infoIcon: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginTop: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 24,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stockName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockQuantity: {
    fontSize: 16,
    color: '#636e72',
  },
  // Styles for stocks table
  stocksContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  stocksTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2d3436',
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockColumn: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
});

export default PortfolioItemScreen;
