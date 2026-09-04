# Changelog

All notable changes to this project will be documented in this file.

## [3.2.0] - 2026-09-02

### Added
- **Roleplay** — new `/roleplay` screen for practising a conversation turn by turn. Six scenes (café, bakery, doctor, apartment viewing, gemeente, meeting a neighbour) at A1, A2 or B1. The character opens in Dutch and stays in character; each reply streams in and can be played back with TTS.
- **Multi-turn memory for roleplay** — the LiteRT-LM conversation is held open across turns, so the model remembers the scene so far and each turn only prefills the new message instead of replaying the transcript.
- **Scene review** — "Finish & check my Dutch" checks every line you wrote in a single pass at the end of a scene, showing each correction with a short explanation. Review runs after the scene rather than per turn because the engine holds one conversation at a time; correcting mid-scene would end the scene being corrected.
- **Speaking Exam (A2)** — new section under A2 Exam Prep for the Inburgering *Spreken* exam, following DUO's official format: 16 questions across four parts (a spoken question, one picture, two pictures where you choose one, three pictures you must all use). You answer out loud, the answer is transcribed with Dutch speech recognition, and the on-device model marks it against what an examiner listens for, with a corrected version of your own answer.
- **Practise with your own photo** — take or pick a photo and the on-device model writes an exam-style picture question about what it actually sees, then marks your spoken answer against the photo itself rather than against a caption. This is the part the fixed practice questions cannot do: with a written caption the model has no way to tell whether you described the picture correctly. Uses the vision encoder already present in the model file, so there is no second download.
- **"Wat zie ik?"** — new tool under Explore › Language. Point the camera at anything and get a short description in Dutch at your level, the English translation of exactly those sentences, and the key words visible in the shot with their articles (`de waterval`, `het groen`) and TTS on each. Runs on the same on-device vision encoder, so it works offline.
- **Graceful degradation for vision** — the engine now loads with its vision encoder and, if that fails on a given device, retries text-only rather than taking grammar check, roleplay and the exams down with the camera feature. Photo screens report themselves unavailable instead.
- **Speaking cheat sheet** — a *Spiekbriefje* of phrases organised by what each exam part asks you to do: starting and buying time, answering a question, describing a picture, giving an opinion, choosing and justifying, telling a story in order, and what to say when you are stuck. Every phrase has a translation, a usage hint where it helps, and a TTS button.
- **Mistake Journal: sentence mistakes** — entries now support a `roleplay` source carrying the sentence you wrote, its correction, a short note, and the scene it came from. Repeating the same mistake increments its count instead of adding a duplicate card.
- **Mistake Journal from quiz and vocab sessions** — wrong answers in the quiz and vocab session screens are logged automatically, with an entry point on the Progress dashboard.
- **On-device AI model gate** — first launch shows a download screen for the ~2.6 GB model with live progress, cancel, and a "skip for now" option.
- **Settings: On-device AI** — download or re-download the model, watch progress, read the load-error detail, and reset a corrupt install.
- **Vowel Practice** — listen to a vowel, record yourself, and compare the two.
- **iOS entitlements plugin** — `plugins/withLLMEntitlements.js` adds `increased-memory-limit` and `extended-virtual-addressing`, both required before the GPU backend will allocate for a model this size.

### Changed
- **AI backend: Apple Foundation Models → Gemma 4 E2B on LiteRT-LM** — all language AI now runs on a bundled on-device model instead of Apple Intelligence. This drops the requirement for iOS 26 and eligible hardware; the deployment target is now iOS 17.0 and behaviour no longer varies by device or region. The trade-off is a one-time ~2.6 GB download on first launch.
- **AIContext** — a single state machine for engine state across every AI feature, with classified errors, recovery actions, non-blocking toasts, and a reusable error banner.
- **Small Talk** — conversations now stream in turn by turn as they generate, rather than appearing all at once when finished.
- **Grammar check** — reworked response handling to read plain `CORRECT`/`INCORRECT` output instead of JSON, which the on-device model produces far more reliably.
- **Engine loading** — tries the GPU backend first and falls back to CPU transparently, and the compiled Metal shader cache is now kept between launches for faster warm starts.
- **Roleplay composer** — autocorrect and spellcheck are off. An English keyboard mangles Dutch into lookalikes, and silently repairing a learner's spelling defeats the exercise.

### Fixed
- **Vocabulary data: wrong meanings** — `zoeken` and `zoet` had been swapped ("to look for" / "sweet"); `de belangstelling` was glossed "importance" instead of "interest"; the preposition `in` was glossed "common"; `ontzettend` and `weinig` were corrected.
- **Vocabulary data: scrape damage** — nine entries had absorbed the following word's headword into their English field (e.g. `de kennis` read "knowledge, acquaintance de ketel kettle"). Each has been split, and the five words destroyed in the process restored: `vertrekken`, `proberen`, `reserveren`, `de ketel`, `het recept`.
- **Vocabulary data: split compounds** — `houden van`, `gelijk hebben` and `trek hebben in` were stored as bare fragments that meant nothing on their own.
- **Vocabulary data: examples** — twelve entries had examples that did not demonstrate the word, including `zich herinneren` and `zich terugtrekken` (both showed `vergissen`'s sentence) and `waar` (where), which was illustrated with "Is dat waar?" — the other `waar`.
- **Vocabulary data: categories** — `de bal` moved out of Health & Body and `de kleur` out of Adjectives, both into Nouns. Word ids were preserved so existing SRS and mistake-journal history still matches.
- **Vocabulary data: typos and formatting** — OCR damage (`de ille`, `swaad`, `plattorm`, `acroplane`, `(on the) leit`), truncated glosses, missing articles, and reflexives missing `zich`. Two entries that were not Dutch words at all (`run`, `university`, both halves of split glosses) were removed.
- **Mistake Journal source label** — non-quiz mistakes were all labelled "Vocab practice" regardless of where they came from.

---

## [3.1.0] - 2026-05-24

### Added
- **Vocabulary List screen** — new in-app screen (`/vocab-list`) showing all words in a searchable, scrollable table. Filter by All / Custom / Learned / Saved. Each word displays its category, TTS play button, and heart toggle. Custom words have inline Edit and Delete actions.
- **Edit custom words** — tapping Edit on a custom word opens a bottom-sheet modal to modify the Dutch word, English translation, example sentences, and category, saving directly to AsyncStorage.
- **Vocab List nav entry** — list icon added to the home screen header (between Search and Add) for quick access to the vocabulary list.
- **Developer Admin UI: edit & delete** — `tools/admin-ui` now supports editing any word inline directly in the browser table (edits write back to `vocabulary.ts` via ts-morph AST manipulation) and deleting words with a confirmation prompt.
- **Developer Admin UI: global search** — search bar in the admin header filters across all words (Dutch, English, and example sentences) in real time without selecting a category first.
- **Developer Admin UI: category sidebar** — clickable sidebar lists all categories (including traffic sign subcategories); selecting one filters the table to that category.

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
