# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2024-05-22

### Added
- **CSV Import**: Users can now import custom vocabulary from CSV files.
- **Audio Pronunciation**: Text-to-speech support for Dutch words using `expo-speech`.
- **Imported Words Category**: A dynamic category on the home screen for imported words.
- **Delete Functionality**:
    - Individual delete button (trash icon) for imported/custom words.
    - "Clear All Imported Words" button in the Import screen.
- **Manual Add Improvements**:
    - Option to add words directly to the "Imported Words" category.
    - Manually added words are now marked as custom and can be deleted.

### Fixed
- **Card Skipping**: Fixed a bug where learning a word would skip the subsequent card in the deck.
- **Infinite Loop**: Fixed a crash related to `useMemo` in category views.
- **Dashboard Counts**: Fixed stats to correctly include imported and custom words in total counts.
- **Navigation**: resolved navigation issues with dynamic categories.

## [1.1.0] - Previous Release
- Initial release handling.
