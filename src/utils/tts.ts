import * as Speech from 'expo-speech';

let isSpeaking = false;

export const initTTS = async () => {
    // Expo Speech doesn't require async manual initialization.
    console.log('Native Speech TTS Ready.');
    return Promise.resolve();
};

export const speak = async (text: string, rate: number = 1.0) => {
    if (isSpeaking) {
        Speech.stop();
    }

    try {
        isSpeaking = true;

        Speech.speak(text, {
            language: 'nl-NL',
            rate: rate,
            onDone: () => { isSpeaking = false; },
            onStopped: () => { isSpeaking = false; },
            onError: (error) => {
                console.error('TTS Error:', error);
                isSpeaking = false;
            }
        });
    } catch (error) {
        console.error('TTS Error:', error);
        isSpeaking = false;
    }
};

export const stopTTS = () => {
    Speech.stop();
    isSpeaking = false;
};

export const cleanupTTS = () => {
    Speech.stop();
    isSpeaking = false;
};
