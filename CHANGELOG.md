# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-05-01

### Added
- **Writing Exam (A2)** — new practice section for the Inburgering A2 writing exam, featuring sample prompts and AI-driven feedback on responses.
- **Learn Phrases** — new section with 778 Dutch phrases across 9 topic categories (General, Questions, Weekend Activities, Work & Life, Traffic & Transportation, Greetings & Introductions, Courtesy & Etiquette, Dining & Shopping, Getting Information).
- **Audiobook playback** — "Play All" button on both the category list and individual category screens reads each phrase aloud in Dutch followed by the English translation, with auto-scroll to the active phrase.
- **Audio controls bar** — persistent player bar while playing: progress track, current phrase display, skip-phrase (‹ ›) and skip-category (⏮ ⏭) buttons, and a stop button.
- **Configurable Phrase Delay** — added "Delay" chips (0s, 1s, 2s, 3s) to the phrase player header, allowing users to customize the pause duration between Dutch and English audio during playback.
- **Category-level playback** — each category card has a dedicated play button to start or jump playback from that category.
- **Global playback generation** — a module-level generation counter in `tts.ts` ensures any new play request (from any screen) immediately cancels a running playback loop elsewhere.

### Changed
- **Home screen redesign** — simplified into three clearly labeled sections: TODAY, LEARN, and EXPLORE.
  - *TODAY*: single card combining the streak indicator (only shown when > 0), Word of the Day with speaker button, and one primary practice CTA.
  - *LEARN*: category list always visible (Flashcard accordion removed); Vocab / Traffic tab switcher inline with the section header.
  - *EXPLORE*: Pronunciation Guide, Grammar Topics, Sentence Builder, and Learn Phrases arranged in a compact 2×2 grid.
- **Search moved to nav header** — search bar hidden by default; toggled via a Search icon in the navigation header, freeing up persistent screen space.
- **Word of the Day merged into TODAY card** — no longer a separate card.
- **Weekly accuracy stat removed** from the daily summary to reduce noise.

### Fixed
- **Grammar check output** — improved the formatting and accuracy of the AI grammar checker.
- **Writing exam navigation** — fixed missing back button on writing exam screens.
- Navigating back from Learn Phrases or a phrase category now immediately stops audio playback (unmount cleanup via `useEffect`).
- Tapping any play button stops the previously playing audio before starting the new one (`speakInLanguage` calls `Speech.stop()` first).
- Mid-playback control: audio playback settings (like delay) now update in real-time without needing to restart the track.


---

## [1.7.0] - 2026-04-12

### Removed
- **Translate Word screen** — removed the standalone "Translate & Add" screen and its `Languages` icon entry point from the home header.

### Added
- **Pronunciation Guide** — new screen with Dutch pronunciation rules and examples.
- **KNM Exam Preparation** — full KNM (Kennis van de Nederlandse Maatschappij) section with lessons and AI-powered quizzes using Apple Intelligence.
- **Splash screen** — updated splash icon and Xcode project configuration.

### Changed
- **UI overhaul** — major redesign of the home (Learn) screen and practice screen; improved card layout, button alignment, and overall visual consistency.
- **UI navigation** — improved navigation flow; updated import screen UX.
- **Home screen** — better SRS context, push notifications support, and quiz flow improvements.
- **Translation engine** — corrected `TranslationSession` initializer for iOS 26 compatibility; fixed button alignment in the translation flow.

### Fixed
- Graceful fallback for AI-generated KNM questions when Apple Intelligence is unavailable.
- Replaced emoji characters with `Ionicons` in KNM screens to prevent question-mark rendering on some devices.
- Moved `useCallback` hooks before early returns to comply with React rules-of-hooks.
- Resolved TypeScript errors across KNM-related files.
- Removed invalid `EXCLUDED_ARCHS` syntax from Xcode `pbxproj` to unblock EAS prebuild.

### Chore
- Added `CODE_SIGN_ENTITLEMENTS` to Xcode build configurations.

---

## [1.6.0] - 2026-03-22

### Added
- **AI Sentence Builder**: A new interactive learning tool integrated with a custom iOS Dutch AI Swift Local Module to evaluate user grammar constructs natively on-device.
- **Local Admin UI**: A developer tool (`npm run admin-ui`) built with Express and `ts-morph` to easily add words to `vocabulary.ts` and `traffic_categories.ts` through a local web interface.
- **iOS 26 Compatibility Plugin**: Added `withIosLifecycleFix` Expo config plugin to restore AppDelegate lifecycle (fixes black screen), add `@available` guards for iOS 26.0 SDK, and sync project deployment targets.

### Improved
- **Module Rename**: Renamed the native AI module from `apple-intelligence` to `dutch-vocab-ai` for clearer branding and improved package structure.
- **iOS 18 SDK Support**: Bumped deployment target to iOS 18.0 to leverage modern capabilities and Dutch Vocab AI integrations.
- **Speech UI Consistency**: Synchronized the interaction model across all screens (Tap-to-Toggle instead of Hold-to-Speak).
- **Transcription Feedback**: Implemented an immediate loading spinner upon stopping speech to indicate processing.
- **Hardware Cleanup**: Added robust `Voice.destroy()` calls during screen transitions to ensure microphone hardware is released immediately.
- **Number Normalization**: Integrated a custom Dutch number-to-words utility (`numberToDutchWords`) to ensure spoken digits (e.g., "80") correctly match target Dutch text ("tachtig").
- **Voice Input (Translate Screen)**: Migrated translate screen voice input to `expo-speech-recognition` with real-time volume visualisation, silence detection, and graceful error handling.

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
