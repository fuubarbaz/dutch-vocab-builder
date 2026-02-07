# Dutch Vocab Builder

A modern, interactive React Native application designed to help users learn Dutch vocabulary efficiently. Built with Expo and Expo Router, this app features a clean UI, organized vocabulary categories, flashcards, quizzes (planned), and progress tracking.

## 📱 Features

-   **Categorized Vocabulary**: Words are organized into intuitive categories like Home, Travel, Food, Work, and more.
-   **Interactive Flashcards**: Learn words with their English translations and example sentences in both Dutch and English.
-   **Audio Pronunciation**: Hear how words are pronounced using native text-to-speech.
-   **Favorites**: Save difficult or interesting words to your personal favorites list for quick review.
-   **Progress Dashboard**: Track your learning journey with visual charts and statistics.
-   **Dark Mode Support**: Fully optimized for both light and dark system themes.
-   **Search Functionality**: Quickly find specific words or phrases.
-   **CSV Import**: Import custom word lists from CSV files.

## 🛠 Tech Stack

-   **Framework**: [React Native](https://reactnative.dev/)
-   **Platform**: [Expo](https://expo.dev/)
-   **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Icons**: [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
-   **Charts**: [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
-   **Storage**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
-   Access to an iOS Simulator (Mac only), Android Emulator, or the Expo Go app on a physical device.

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project directory:
    ```bash
    cd dutch-vocab-builder
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running the App

Start the development server:

```bash
npx expo start
```

-   **Run on iOS Simulator**: Press `i` in the terminal.
-   **Run on Android Emulator**: Press `a` in the terminal.
-   **Run on Web**: Press `w` in the terminal.
-   **Run on Physical Device**: Scan the QR code with the Expo Go app (Android) or Camera app (iOS).

## 🚀 Deployment

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for building and submitting to the app stores.

### Prerequisite: Install EAS CLI

```bash
npm install -g eas-cli
```

### 1. Configure the Project

Login to your Expo account:

```bash
eas login
```

Configure the project (if not already done):

```bash
eas build:configure
```

### 2. Build for Android (Google Play Store)

To build an Android App Bundle (AAB) for production:

```bash
eas build --platform android --profile production
```

### 3. Build for iOS (App Store)

To build an archive (IPA) for production:

```bash
eas build --platform ios --profile production
```

> **Note**: For iOS builds, you will need a paid Apple Developer account. EAS CLI will handle the generation of required certificates and provisioning profiles.

### 4. Submit to Stores

Once the build is complete, you can submit it directly using EAS Submit.

**Submit to Android:**
```bash
eas submit --platform android
```

**Submit to iOS:**
```bash
eas submit --platform ios
```

## 📂 Project Structure

```
dutch-vocab-builder/
├── src/
│   ├── app/                # Expo Router screens and layout
│   ├── assets/             # Images and fonts
│   ├── components/         # Reusable UI components
│   ├── constants/          # App constants (Colors, Theme)
│   ├── data/               # Vocabulary data (JSON/TS)
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript interfaces
├── app.json                # Expo configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 🤝 Contributing

Contributions are welcome! If you have suggestions for new categories, words, or features, please open an issue or submit a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
