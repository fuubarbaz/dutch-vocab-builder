import { useEffect } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import VersionCheck from 'react-native-version-check';

export const useVersionCheck = () => {
    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Ensure check only happens in production, or test by forcing a check.
                // For now, let's just run it standardly.
                const updateNeeded = await VersionCheck.needUpdate();

                if (updateNeeded && updateNeeded.isNeeded) {
                    Alert.alert(
                        'Update Available',
                        'A new version of Dutch Vocab Builder is available! Update now to get the latest features.',
                        [
                            {
                                text: 'Update Now',
                                onPress: () => {
                                    if (updateNeeded.storeUrl) {
                                        Linking.openURL(updateNeeded.storeUrl);
                                    }
                                }
                            },
                            {
                                text: 'Later',
                                style: 'cancel'
                            }
                        ],
                        { cancelable: true }
                    );
                }
            } catch (error) {
                // Fail silently in the background if network is down or API fails
                console.warn('Silent failure checking for app update:', error);
            }
        };

        checkVersion();
    }, []);
};
