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

/** Speak with an onDone callback — uses the same preferred voice as speak(). */
export const speakWithCallback = async (
    text: string,
    rate: number = 1.0,
    callbacks: { onDone?: () => void; onStopped?: () => void; onError?: () => void } = {}
) => {
    if (!preferredVoiceIdentifier) {
        await initTTS();
    }
    Speech.speak(text, {
        language: 'nl-NL',
        voice: preferredVoiceIdentifier,
        rate,
        onDone: callbacks.onDone,
        onStopped: callbacks.onStopped,
        onError: callbacks.onError,
    });
};

export const cleanupTTS = () => {
    Speech.stop();
    isSpeaking = false;
};

// ─── Language-aware speak (for audiobook) ────────────────────────────────────

let enVoiceInitialized = false;
let preferredEnVoiceIdentifier: string | undefined = undefined;

const initEnTTS = async () => {
    if (enVoiceInitialized) return;
    enVoiceInitialized = true;
    try {
        const voices = await Speech.getAvailableVoicesAsync();

        const isHighQuality = (v: Speech.Voice) =>
            v.name.toLowerCase().includes('siri') ||
            v.identifier.toLowerCase().includes('siri') ||
            v.identifier.toLowerCase().includes('premium') ||
            v.identifier.toLowerCase().includes('enhanced') ||
            v.quality === 'Enhanced';

        // Prefer en-US, then en-GB, then any English
        const enUS = voices.filter(v => v.language === 'en-US');
        const enGB = voices.filter(v => v.language === 'en-GB');
        const enAny = voices.filter(v => v.language?.startsWith('en'));

        const bestVoice =
            enUS.find(isHighQuality) ??
            enGB.find(isHighQuality) ??
            enAny.find(isHighQuality) ??
            enUS[0] ??
            enGB[0] ??
            enAny[0];

        if (bestVoice) {
            preferredEnVoiceIdentifier = bestVoice.identifier;
            console.log('Selected English TTS voice:', bestVoice.name, bestVoice.language);
        }
    } catch (e) {
        enVoiceInitialized = false; // allow retry next time
        console.warn('Failed to fetch English TTS voices:', e);
    }
};

// ─── Global playback generation ──────────────────────────────────────────────
// Incremented each time a new playback session starts. Loops compare against
// their captured generation to detect when they've been superseded.
let _playbackGeneration = 0;
export const startNewPlayback = () => ++_playbackGeneration;
export const getPlaybackGeneration = () => _playbackGeneration;

/** Speak text in either English or Dutch with completion callbacks. */
export const speakInLanguage = async (
    text: string,
    lang: 'en' | 'nl',
    rate: number = 1.0,
    callbacks: { onDone?: () => void; onStopped?: () => void; onError?: () => void } = {}
) => {
    Speech.stop();
    if (lang === 'nl') {
        if (!preferredVoiceIdentifier) await initTTS();
        Speech.speak(text, {
            language: 'nl-NL',
            voice: preferredVoiceIdentifier,
            rate,
            onDone: callbacks.onDone,
            onStopped: callbacks.onStopped,
            onError: callbacks.onError,
        });
    } else {
        await initEnTTS();
        Speech.speak(text, {
            language: 'en-US',
            voice: preferredEnVoiceIdentifier,
            rate,
            onDone: callbacks.onDone,
            onStopped: callbacks.onStopped,
            onError: callbacks.onError,
        });
    }
};
