import Constants from 'expo-constants';

function getApiUrl() {
    const API_URL = Constants.expoConfig.extra.API_URL;

    if (!API_URL) {
        throw new Error('API_URL is missing.');
    }

    return API_URL;
}

function getOpenaiApiKey() {
    const OPENAI_API_KEY = Constants.expoConfig.extra.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is missing.');
    }

    return OPENAI_API_KEY;
}

function getOpenaiApiUrl() {
    const OPENAI_API_URL = Constants.expoConfig.extra.OPENAI_API_URL;

    if (!OPENAI_API_URL) {
        throw new Error('OPENAI_API_URL is missing.');
    }

    return OPENAI_API_URL;
}

export const Env = {
    API_URL: getApiUrl(),
    OPENAI_API_KEY: getOpenaiApiKey(),
    OPENAI_API_URL: getOpenaiApiUrl()
};
