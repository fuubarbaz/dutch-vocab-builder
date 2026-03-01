# Changelog

All notable changes to this project will be documented in this file.

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
