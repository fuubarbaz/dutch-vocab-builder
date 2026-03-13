# Changelog

All notable changes to this project will be documented in this file.
 
## [1.6.0] - 2026-03-11

### Added
- **AI Sentence Builder**: A new interactive learning tool integrated with a custom iOS 26 Apple Intelligence Swift Local Module to evaluate user grammar constructs natively on-device.
- **Local Admin UI**: A developer tool (`npm run admin-ui`) built with Express and `ts-morph` to easily add words to `vocabulary.ts` and `traffic_categories.ts` through a local web interface.

### Improved
- **iOS 26 SDK Support**: Bumped deployment target to iOS 26.0 to leverage modern Liquid Glass interface capabilities and Apple Intelligence integrations.
- **Speech UI Consistency**: Synchronized the interaction model across all screens (Tap-to-Toggle instead of Hold-to-Speak). 
- **Transcription Feedback**: Implemented an immediate loading spinner upon stopping speech to indicate processing.
- **Hardware Cleanup**: Added robust `Voice.destroy()` calls during screen transitions to ensure microphone hardware is released immediately.
- **Number Normalization**: Integrated a custom Dutch number-to-words utility (`numberToDutchWords`) to ensure spoken digits (e.g., "80") correctly match target Dutch text ("tachtig").

### Fixed
- **Quiz Option Coverage**: Resolved a bug where some quiz questions displayed fewer than 4 options by dynamically pulling distractors from the full domain pool and filtering out duplicate labels.
- **Mic Permissions**: Fixed a silent failure in the "Translate & Add" screen by adding missing microphone permission requests.
- **React Hook Order Error**: Remedied a "rendered more hooks" error in the Sentence and Pronunciation practice screens by moving animated style hooks to the top level.


## [1.5.0] - 2026-03-06

### Added
- **Sentence Practice Component**: A dedicated interactive space to practice 1,000+ random Dutch sentences (powered by on-device Speech Recognition).
- **100% Offline Dictation and Translation Engine**: Migrated the translation engine completely offline using Google's local ML Kit, seamlessly translating bidirectional English and Dutch locally on the device instantly.

### Fixed
- **Translating Engine Bug**: Eliminated a spam-translation side-effect by introducing smart transcription debouncing when pausing speech during translation.
- **Microphone Crashing/Hooks Locking**: Corrected lifecycle management of the `react-native-voice` modules to prevent "Speech Recognition Already Started" errors that previously crashed the visualizer natively.

## [1.4.0] - 2026-03-01

### Added
- **Offline Text-to-Speech**: Full integration with Sherpa-ONNX and the Piper VITS model for high-quality, 100% offline Dutch pronunciation.
- **Improved Caching**: Safe unzipping and caching of TTS models via internal app storage on first startup.

## [1.3.0] - 2026-02-17

### Added
- **Global Search**: A powerful search bar on the home screen to filter both built-in and imported words instantly.
- **Settings Tab**: New tab to manage application preferences.
- **Audio Speed Control**: Users can now adjust the pronunciation speed (0.5x, 0.75x, 0.9x, 1.0x, 1.25x) via Settings.
- **List View Mode**: Toggle between the classic "Flashcard" view and a new scrolling "List View" to see all words at once with details.
- **Visual Feedback**: Speaker icon on flashcards and list items now plays audio at the user's preferred speed.

### Enhanced
- **Search Interaction**: Tapping the speaker icon in search results plays audio immediately.
- **UI/UX**: Improved hit targets on search and action buttons.

## [1.2.0] - 2026-02-07

### Added
- **CSV Import**: Import vocabulary from CSV files.
- **Text-to-Speech**: Audio pronunciation for Dutch words.
- **Delete Imported**: Ability to delete individual imported/custom words.
- **Clear All**: Function to clear all imported words at once.

### Fixed
- **Card Skipping**: Fixed a bug where cards would skip double or get stuck.
- **Dashboard Counts**: Fixed total word count to include imported words.
