import TTSManager from 'react-native-sherpa-onnx-offline-tts';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { unzip } from 'react-native-zip-archive';

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const initTTS = async () => {
    if (isInitialized) return;
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
        try {
            console.log('Initializing Sherpa-ONNX TTS...');

            // The model zip is bundled in the app assets
            const modelZipAsset = Asset.fromModule(require('../assets/tts_model.zip'));

            // @ts-ignore
            const documentDir = FileSystem.documentDirectory as string;
            const ttsDir = `${documentDir}tts_model/`;

            const dirInfo = await FileSystem.getInfoAsync(ttsDir);
            if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(ttsDir);
            }

            await modelZipAsset.downloadAsync();
            const destZipPath = `${ttsDir}tts_model.zip`;

            const zipInfo = await FileSystem.getInfoAsync(destZipPath);
            if (!zipInfo.exists) {
                if (modelZipAsset.localUri) {
                    await FileSystem.copyAsync({ from: modelZipAsset.localUri, to: destZipPath });
                }
            }

            const modelExtractedPath = `${ttsDir}nl_NL-ronnie-medium.onnx`;
            const tokensExtractedPath = `${ttsDir}tokens.txt`;
            const dataDirPath = `${ttsDir}espeak-ng-data`;

            const tokensInfo = await FileSystem.getInfoAsync(tokensExtractedPath);
            if (!tokensInfo.exists) {
                console.log('Extracting TTS model...');
                await unzip(destZipPath, ttsDir);
            }

            const cfg = {
                modelPath: modelExtractedPath.replace('file://', ''),
                tokensPath: tokensExtractedPath.replace('file://', ''),
                dataDirPath: dataDirPath.replace('file://', ''),
            };

            await TTSManager.initialize(JSON.stringify(cfg));
            isInitialized = true;
            console.log('Sherpa-ONNX TTS Initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize Sherpa-ONNX TTS:', error);
            throw error;
        } finally {
            initializationPromise = null;
        }
    })();

    return initializationPromise;
};

export const speak = async (text: string, rate: number = 1.0) => {
    try {
        if (!isInitialized) {
            await initTTS();
        }

        // speakerId = 0 for single speaker models
        await TTSManager.generateAndPlay(text, 0, rate);
    } catch (error) {
        console.error('TTS Error:', error);
    }
};

export const stopTTS = () => {
};

export const cleanupTTS = () => {
    if (isInitialized) {
        TTSManager.deinitialize();
        isInitialized = false;
    }
};
