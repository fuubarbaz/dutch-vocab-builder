import * as Speech from 'expo-speech';

let isSpeaking = false;
let preferredVoiceIdentifier: string | undefined = undefined;

export const initTTS = async () => {
    try {
        const voices = await Speech.getAvailableVoicesAsync();
        // Look for Dutch voices
        const dutchVoices = voices.filter(v =>
            v.language === 'nl-NL' || v.language === 'nl-BE' || v.language === 'nl'
        );

        // Try to find a Siri, Premium, or Enhanced voice to avoid the robotic default
        const bestVoice = dutchVoices.find(v =>
            v.name.toLowerCase().includes('siri') ||
            v.identifier.toLowerCase().includes('siri') ||
            v.identifier.toLowerCase().includes('premium') ||
            v.identifier.toLowerCase().includes('enhanced') ||
            v.quality === 'Enhanced'
        );

        if (bestVoice) {
            preferredVoiceIdentifier = bestVoice.identifier;
            console.log('Selected premium Dutch TTS voice:', bestVoice.name);
        } else if (dutchVoices.length > 0) {
            preferredVoiceIdentifier = dutchVoices[0].identifier;
            console.log('Selected fallback Dutch TTS voice:', dutchVoices[0].name);
        }
    } catch (e) {
        console.warn('Failed to fetch TTS voices, falling back to system default:', e);
    }

    console.log('Native Speech TTS Ready.');
};

export const speak = async (text: string, rate: number = 1.0) => {
    if (isSpeaking) {
        Speech.stop();
    }

    try {
        isSpeaking = true;

        if (!preferredVoiceIdentifier) {
            await initTTS();
        }

        Speech.speak(text, {
            language: 'nl-NL',
            voice: preferredVoiceIdentifier,
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
