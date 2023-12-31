import Bugsnag from '@bugsnag/expo';
Bugsnag.start();

import 'react-native-gesture-handler';
import React from 'react'
import { Provider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { theme } from './src/core/theme'
import {
    LoginScreen,
    RegisterScreen,
    ResetPasswordScreen,
    Dashboard,
    PortfolioScreen,
    PortfolioItemScreen,
    PortfolioAssistantScreen,
} from './src/screens'

const Stack = createStackNavigator()

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

const App = () => {
    return (
        <ErrorBoundary>
            <Provider theme={theme}>
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="LoginScreen"
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen name="LoginScreen" component={LoginScreen} />
                        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
                        <Stack.Screen name="Dashboard" component={Dashboard} />
                        <Stack.Screen name="PortfolioScreen" component={PortfolioScreen} />
                        <Stack.Screen
                            name="PortfolioItemScreen"
                            component={PortfolioItemScreen}
                        />
                        <Stack.Screen
                            name="PortfolioAssistantScreen"
                            component={PortfolioAssistantScreen}
                        />
                        <Stack.Screen
                            name="ResetPasswordScreen"
                            component={ResetPasswordScreen}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        </ErrorBoundary>
    )
}

export default () =>
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
