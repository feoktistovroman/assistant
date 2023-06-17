import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Alert, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import { theme } from '../core/theme';
import { emailValidator } from '../helpers/emailValidator';
import { passwordValidator } from '../helpers/passwordValidator';
import axios from 'axios';
import { Env } from "Env";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState({ value: '', error: '' });
    const [password, setPassword] = useState({ value: '', error: '' });

    useEffect(() => {
        authenticateUserWithBiometrics();
    }, []);

    const authenticateUserWithBiometrics = async () => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            const isBiometricsSupported = await LocalAuthentication.hasHardwareAsync();
            if (isBiometricsSupported) {
                const authResult = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Authenticate to proceed',
                    cancelLabel: 'Cancel',
                });
                if (authResult.success) {
                    navigateToDashboard();
                }
            } else {
                // If biometrics is not supported, navigate to Dashboard
                navigateToDashboard();
            }
        }
    };

    const onLoginPressed = async () => {
        const emailError = emailValidator(email.value);
        const passwordError = passwordValidator(password.value);
        if (emailError || passwordError) {
            setEmail({ ...email, error: emailError });
            setPassword({ ...password, error: passwordError });
            return;
        }

        try {
            const response = await axios.post(`${Env.API_URL}/login`, {
                email: email.value,
                password: password.value,
            });

            const token = response.data.token;
            if (token) {
                const isBiometricsSupported = await LocalAuthentication.hasHardwareAsync();

                if (isBiometricsSupported) {
                    Alert.alert(
                        'Use Biometrics',
                        'Do you want to use FaceID/TouchID for faster logins?',
                        [
                            {
                                text: 'Yes',
                                onPress: async () => {
                                    // Store the token in SecureStore with biometric authentication
                                    await SecureStore.setItemAsync('token', token, {
                                        keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
                                    });
                                    navigateToDashboard();
                                },
                            },
                            {
                                text: 'No',
                                onPress: async () => {
                                    // Store the token in SecureStore without biometric authentication
                                    await SecureStore.setItemAsync('token', token);
                                    navigateToDashboard();
                                },
                            },
                        ],
                    );
                } else {
                    // Store the token in SecureStore without biometric authentication
                    await SecureStore.setItemAsync('token', token);
                    navigateToDashboard();
                }
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.data && error.response.data.message) {
                Alert.alert('Error', error.response.data.message);
            } else {
                Alert.alert('Error', 'Login failed. Please try again.');
            }
        }
    };

    const navigateToDashboard = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Dashboard' }],
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <Logo />
                <Header>Welcome to Investlio!</Header>
                <TextInput
                    label="Email"
                    returnKeyType="next"
                    value={email.value}
                    onChangeText={(text) => setEmail({ value: text, error: '' })}
                    error={!!email.error}
                    errorText={email.error}
                    autoCapitalize="none"
                    autoCompleteType="email"
                    textContentType="emailAddress"
                    keyboardType="email-address"
                />
                <TextInput
                    label="Password"
                    returnKeyType="done"
                    value={password.value}
                    onChangeText={(text) => setPassword({ value: text, error: '' })}
                    error={!!password.error}
                    errorText={password.error}
                    secureTextEntry
                />
                <Button mode="contained" onPress={onLoginPressed}>
                    Login
                </Button>
                <View style={styles.row}>
                    <Text>Don’t have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.replace('RegisterScreen')}>
                        <Text style={styles.link}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    forgotPassword: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        marginTop: 4,
    },
    forgot: {
        fontSize: 13,
        color: theme.colors.secondary,
    },
    link: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    container: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
    },
});
