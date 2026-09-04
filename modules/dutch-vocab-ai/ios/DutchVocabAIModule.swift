import ExpoModulesCore
import UIKit
// LiteRT-LM Swift sources (Engine, Conversation, Message, etc.) are compiled
// directly into this pod via s.source_files — no import needed.

private let MODEL_FILENAME = "gemma-4-E2B-it.litertlm"
private let MODEL_URL = "https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it.litertlm"

// Minimum acceptable size for a complete model file.  The real file is ~2.6 GB;
// anything materially smaller is treated as a corrupt or interrupted download
// and is removed so the user is re-prompted to download cleanly.  This is the
// single most common cause of the "AI model cannot be loaded" error.
private let MODEL_MIN_BYTES: Int64 = 2_000_000_000  // 2.0 GB safety floor

public class DutchVocabAIModule: Module {
  private let runner = GemmaRunner.shared

  public func definition() -> ModuleDefinition {
    Name("DutchVocabAI")

    Events("onDownloadProgress", "onSmallTalkChunk", "onRoleplayChunk")

    AsyncFunction("generateTextAsync") { (prompt: String) -> String in
      return try await self.runner.generate(prompt: prompt, system: Self.tutorSystemPrompt)
    }

    AsyncFunction("generateSmallTalkAsync") { (topic: String, turnCount: Int) -> String in
      let turns = max(4, min(turnCount, 10))
      let userPrompt = "Generate a \(turns)-turn Dutch conversation about: \(topic)"
      return try await self.runner.generate(prompt: userPrompt, system: Self.smallTalkSystemPrompt)
    }

    AsyncFunction("generateSmallTalkStreamAsync") { (topic: String, turnCount: Int) -> Void in
      let turns = max(4, min(turnCount, 10))
      let userPrompt = "Generate a \(turns)-turn Dutch conversation about: \(topic)"
      var accumulated = ""
      try await self.runner.generateStream(prompt: userPrompt, system: Self.smallTalkSystemPrompt) { chunk in
        accumulated += chunk
        self.sendEvent("onSmallTalkChunk", ["text": accumulated, "done": false])
      }
      self.sendEvent("onSmallTalkChunk", ["text": accumulated, "done": true])
    }

    // ── Roleplay ────────────────────────────────────────────────────────────
    //
    // Unlike every other function here, roleplay is *stateful*: the LiteRT-LM
    // conversation is kept alive between calls so the model sees the whole scene
    // without us re-sending the transcript each turn. The engine supports one
    // live session at a time, so starting a roleplay evicts any previous
    // conversation and any other generation evicts the roleplay — the session id
    // lets JS detect that and offer to restart rather than silently losing the
    // thread.

    AsyncFunction("startRoleplaySessionAsync") { (scenario: String, character: String, level: String) -> String in
      let system = Self.roleplaySystemPrompt(scenario: scenario, character: character, level: level)
      return try await self.runner.startRoleplay(system: system)
    }

    AsyncFunction("sendRoleplayTurnAsync") { (sessionId: String, text: String) -> String in
      return try await self.runner.roleplayTurn(sessionId: sessionId, prompt: Self.roleplayPrompt(text))
    }

    AsyncFunction("sendRoleplayTurnStreamAsync") { (sessionId: String, text: String) -> Void in
      var accumulated = ""
      try await self.runner.roleplayTurnStream(sessionId: sessionId, prompt: Self.roleplayPrompt(text)) { chunk in
        accumulated += chunk
        self.sendEvent("onRoleplayChunk", ["text": accumulated, "done": false])
      }
      self.sendEvent("onRoleplayChunk", ["text": accumulated, "done": true])
    }

    AsyncFunction("endRoleplaySessionAsync") { (sessionId: String) -> Bool in
      return self.runner.endRoleplay(sessionId: sessionId)
    }

    /// Reviews the learner's lines from a finished scene, all in one call.
    ///
    /// This runs in a *fresh* conversation, which evicts any live roleplay session —
    /// that is intentional and why review happens at the end of a scene rather than
    /// per turn: the engine holds one conversation, so correcting mid-scene would
    /// destroy the scene being corrected.
    AsyncFunction("isVisionAvailableAsync") { () -> Bool in
      return self.runner.visionAvailable
    }

    /// Builds an exam-style picture question from a photo the learner supplied.
    AsyncFunction("generatePictureTaskAsync") { (imagePath: String, level: String) -> String in
      let prompt = "Maak een examenvraag bij deze foto voor niveau \(level)."
      return try await self.runner.generateWithImage(
        prompt: prompt,
        system: Self.pictureTaskSystemPrompt,
        imagePath: imagePath)
    }

    /// Marks a spoken answer against the photo itself, not against a caption.
    AsyncFunction("reviewPictureAnswerAsync") {
      (imagePath: String, question: String, checkpoints: [String], answer: String) -> String in
      let checks = checkpoints.enumerated()
        .map { "\($0.offset + 1). \($0.element)" }
        .joined(separator: "\n")
      let prompt = "De vraag was: \(question)\n\n"
        + "Waar de examinator op let:\n\(checks)\n\n"
        + "De kandidaat zei (uitgeschreven spraak):\n\(answer)"
      return try await self.runner.generateWithImage(
        prompt: prompt,
        system: Self.pictureReviewSystemPrompt,
        imagePath: imagePath)
    }

    /// Describes a photo in Dutch and English, for learning rather than for the exam.
    AsyncFunction("describeImageAsync") { (imagePath: String, level: String) -> String in
      let prompt = "Beschrijf deze foto voor iemand die Nederlands leert op niveau \(level)."
      return try await self.runner.generateWithImage(
        prompt: prompt,
        system: Self.imageDescribeSystemPrompt,
        imagePath: imagePath)
    }

    AsyncFunction("reviewRoleplayAsync") { (lines: [String]) -> String in
      let numbered = lines.enumerated()
        .map { "\($0.offset + 1). \($0.element)" }
        .joined(separator: "\n")
      let prompt = "Check these \(lines.count) Dutch sentences:\n\n\(numbered)"
      return try await self.runner.generate(prompt: prompt, system: Self.roleplayReviewSystemPrompt)
    }

    AsyncFunction("translateTextsAsync") { (texts: [String], sourceLang: String, targetLang: String) -> [String] in
      var results: [String] = []
      results.reserveCapacity(texts.count)
      for text in texts {
        let prompt = "Translate the following \(sourceLang) text to \(targetLang). Output the translation only, no commentary, no quotes:\n\n\(text)"
        let translated = try await self.runner.generate(prompt: prompt, system: Self.translatorSystemPrompt)
        results.append(translated.trimmingCharacters(in: .whitespacesAndNewlines))
      }
      return results
    }

    AsyncFunction("getAIAvailabilityAsync") { () -> String in
      return self.runner.availability().rawValue
    }

    AsyncFunction("getLoadErrorAsync") { () -> String? in
      return self.runner.loadErrorDetail()
    }

    AsyncFunction("resetModelAsync") { (deleteFile: Bool) -> Bool in
      self.runner.resetModel(deleteFile: deleteFile)
      return true
    }

    AsyncFunction("downloadModelAsync") { () -> Bool in
      return try await withCheckedThrowingContinuation { continuation in
        self.runner.downloadModel(
          progressHandler: { [weak self] received, total in
            self?.sendEvent("onDownloadProgress", [
              "bytesReceived": received,
              "totalBytes": total,
              "fraction": total > 0 ? Double(received) / Double(total) : 0.0,
            ])
          },
          completion: { result in
            switch result {
            case .success:
              continuation.resume(returning: true)
            case .failure(let error):
              continuation.resume(throwing: error)
            }
          }
        )
      }
    }

    AsyncFunction("cancelDownloadAsync") { () -> Bool in
      return self.runner.cancelDownload()
    }
  }

  // MARK: - System Prompts

  private static let tutorSystemPrompt = """
    You are an expert Dutch language tutor helping learners master Dutch grammar and vocabulary.
    - When checking grammar: respond with CORRECT or INCORRECT on the first line, then a clear 2-3 sentence explanation.
    - When generating quiz questions or evaluation feedback: respond with valid JSON only, no extra text or markdown.
    - When evaluating sentences for keyword practice: give brief, encouraging feedback.
    Always be educational, constructive, and accurate.
    """

  private static let smallTalkSystemPrompt = """
    You generate natural Dutch small talk conversations for A1-B1 language learners.
    Conversations alternate between Person A and Person B.
    Each turn must be 1-2 short, natural sentences using everyday vocabulary.
    Include a mix of statements and questions to keep the conversation flowing.
    Respond with a JSON array only — no extra text, no markdown fences.
    Format: [{"speaker":"A","dutch":"...","english":"..."},{"speaker":"B","dutch":"...","english":"..."}]
    """

  private static let translatorSystemPrompt = """
    You are a precise translator. Output only the translation — no preface, no quotes, no commentary.
    Preserve tone, punctuation, and proper nouns.
    """

  /// System prompt for a live roleplay scene.
  ///
  /// Built per session because the character and CEFR level change with the scenario.
  /// The "never write the learner's line" rule matters: a 2B model will happily
  /// continue both sides of a dialogue, and the JS layer trims what slips through.
  private static func roleplaySystemPrompt(scenario: String, character: String, level: String) -> String {
    return """
      You are roleplaying with someone learning Dutch at CEFR level \(level).
      Your character: \(character).
      The scene: \(scenario).

      Rules:
      - Always stay in character. Never mention that you are an AI or a language model.
      - Write only your own character's line. Never write, guess, or continue the learner's side.
      - Reply in Dutch only, 1-2 short sentences, using vocabulary and grammar suited to \(level).
      - Keep the scene moving: usually end your line with a question or a prompt to respond to.
      - If the learner writes in English or asks for help, answer briefly in English, then return to Dutch.
      - No stage directions, no narration, no asterisks, no speaker labels — only the spoken line.
      """
  }

  /// System prompt for the end-of-scene correction pass.
  ///
  /// Compact keys and one object per input sentence: a 2B model stays far more reliable
  /// emitting short fixed-shape records than prose, and the index lets the JS side pair
  /// each result back to the original line without the model echoing it.
  private static let roleplayReviewSystemPrompt = """
    You check Dutch sentences written by a learner during a casual roleplay chat.
    Return one JSON object for EVERY numbered sentence, in the same order:
    {"i": <sentence number>, "ok": <true or false>, "fix": "<corrected Dutch sentence>", "why": "<short English explanation>"}

    Be generous. This is chat, not an exam. Mark a sentence "ok" unless a Dutch speaker
    would actually notice something wrong.

    Only flag these:
    - wrong verb form or conjugation
    - wrong word order
    - a misspelled word
    - a wrong or missing word that changes the meaning
    - the wrong de/het article

    Never flag any of these — treat them as correct:
    - missing or extra punctuation, including commas and full stops
    - lower case at the start of a sentence, or any other capitalisation
    - a missing "alstublieft", "graag" or other politeness word
    - anything that is merely shorter, plainer or less formal than you would write
    - a short answer or single word that replies to a question, such as "Warm" or
      "Roomboter". People answer in fragments when they talk. Never expand one into a
      full sentence and never call it incomplete.

    - If the sentence is fine, set "ok" to true, repeat it unchanged in "fix", and use an empty "why".
    - "why" must describe ONLY the change you actually made in "fix". Never mention a problem you did not fix.
    - If you are not sure a sentence is wrong, mark it "ok".
    - Keep "why" in English and under 15 words.
    Respond with a JSON array only — no extra text, no markdown fences.
    """

  /// Describes a photo for a Dutch learner.
  ///
  /// The English is a translation of the Dutch, not a second description written from
  /// the photo — otherwise the two drift apart and stop being usable as a pair.
  /// Nouns carry their article because de/het is the part learners cannot infer.
  private static let imageDescribeSystemPrompt = """
    You describe a photo for someone learning Dutch.

    Describe only what is actually visible. Never invent objects, people, places or
    brand names that are not there. If something is unclear, leave it out rather than
    guessing.

    - "dutch": 2 to 4 short sentences describing the photo, at the given CEFR level.
      Use simple everyday words. Start with something like "Op de foto zie ik...".
    - "english": a translation of exactly those Dutch sentences. Not a new description.
    - "words": 4 to 8 useful words for the things visible in the photo. Every noun must
      include its article ("de tafel", "het raam"). Verbs in the infinitive.

    Respond ONLY with JSON, no other text and no markdown fences:
    {
      "dutch": "...",
      "english": "...",
      "words": [{"dutch": "de tafel", "english": "table"}]
    }
    """

  /// Turns a photo into a Spreken-style picture question.
  ///
  /// Mirrors onderdeel 2 of the real exam, which pairs "describe what you see" with a
  /// question about the candidate themselves — that second half is what makes the task
  /// speakable for a whole minute instead of three words.
  private static let pictureTaskSystemPrompt = """
    You look at a photo and write ONE speaking-exam question about it, in Dutch, for the
    Inburgering A2 exam.

    Base everything on what is actually visible in the photo. Never invent objects,
    people or places that are not there. If the photo is unclear, ask about what can
    still be made out.

    Follow the shape of the real exam:
    - "context" is one short sentence setting the scene, in Dutch.
    - "question" asks the candidate to describe something in the photo AND to say
      something about themselves. For example: "Vertel wat u op de foto ziet. Vertel ook
      of u dit zelf weleens doet."
    - "checkpoints" are three short Dutch phrases describing what an examiner listens for.

    Keep all Dutch at A2 level: simple words, short sentences.
    Respond ONLY with JSON, no other text and no markdown fences:
    {"context": "...", "question": "...", "checkpoints": ["...", "...", "..."]}
    """

  /// Marks a spoken answer against the photo itself.
  private static let pictureReviewSystemPrompt = """
    You are marking a spoken answer to a Dutch Inburgering A2 picture question. The photo
    is attached — judge whether the candidate actually described what is in it.

    Be encouraging. This is A2: short, simple, correct sentences are enough to pass.
    Judge content and language only, never punctuation or capitalisation, because this is
    transcribed speech. Do not lower the mark for a short answer that does what was asked.
    If the candidate described something that is not in the photo, say so plainly but kindly.

    Respond ONLY with JSON, no other text and no markdown fences:
    {
      "summary": "One encouraging sentence in English about the answer.",
      "checkpoints": [
        { "criterion": "the checkpoint text", "met": true or false, "explanation": "Short English note." }
      ],
      "languageNotes": "Grammar or word-choice mistakes worth fixing, in English. If none, say 'No real mistakes.'",
      "improvedAnswer": "The candidate's own answer rewritten in correct, natural A2 Dutch. Keep their ideas and keep it short."
    }
    """

  /// Wraps a learner turn. An empty string opens the scene, so the model speaks first
  /// and the learner is never staring at a blank transcript.
  private static func roleplayPrompt(_ text: String) -> String {
    let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.isEmpty {
      return "Begin the scene with your first line, in character."
    }
    return trimmed
  }
}

// MARK: - Availability State

enum AIAvailabilityState: String {
  case available
  case notDownloaded = "not_downloaded"
  case downloading
  case loadError = "load_error"
}

// MARK: - Generation Gate

/// Serialises generation requests. LiteRT-LM supports a single active session per
/// engine; two overlapping requests make `litert_lm_conversation_create` return nil,
/// which surfaces as an opaque "Failed to create conversation" error. Queuing the
/// second request instead of failing it keeps the UI honest.
private actor GenerationGate {
  private var busy = false
  private var waiters: [CheckedContinuation<Void, Never>] = []

  func acquire() async {
    if !busy {
      busy = true
      return
    }
    await withCheckedContinuation { waiters.append($0) }
  }

  func release() {
    if waiters.isEmpty {
      busy = false
    } else {
      waiters.removeFirst().resume()
    }
  }
}

// MARK: - Gemma Runner (LiteRT-LM)

final class GemmaRunner: NSObject {
  static let shared = GemmaRunner()

  private let queue = DispatchQueue(label: "com.dutchvocabbuilder.gemma", qos: .userInitiated)
  private let loadLock = NSLock()

  private var engine: Engine?
  private var loadError: Error?

  private let gate = GenerationGate()

  /// Holds the most recent conversation alive until the next request begins.
  ///
  /// LiteRT-LM's streaming callback drops its own reference to the conversation from
  /// *inside* the native callback, so without this the handle is deleted on the
  /// library's worker thread while it is still executing that session — after which
  /// the next `createConversation` fails. Keeping the reference here defers the
  /// delete to the start of the next request, on our own thread.
  private var activeConversation: Conversation?

  /// Non-nil while `activeConversation` is a live roleplay scene rather than a
  /// one-shot request. Any other generation clears it, which is how a roleplay
  /// turn learns its scene was evicted instead of replying with no context.
  private var activeSessionId: String?

  /// True when the engine initialised with its vision encoder. False means the
  /// model loaded text-only and anything image-based must be hidden.
  private(set) var visionAvailable = false

  private var downloadTask: URLSessionDownloadTask?
  private var downloadSession: URLSession?
  private var progressHandler: ((Int64, Int64) -> Void)?
  private var downloadCompletion: ((Result<Void, Error>) -> Void)?
  private var isDownloading = false

  // MARK: Public API

  func availability() -> AIAvailabilityState {
    if engine != nil { return .available }
    if isDownloading { return .downloading }
    // If the file is gone (deleted by iOS under storage pressure, or never downloaded),
    // reset any stale loadError so the download prompt appears cleanly.
    guard modelFileExists else {
      loadError = nil
      return .notDownloaded
    }
    // Sanity-check the file size. A partial/truncated download leaves a file on
    // disk that LiteRT-LM cannot parse, which surfaces as "AI model cannot be
    // loaded" with no recovery path. Delete the bad file here so the user is
    // re-prompted to download a fresh copy.
    if modelFileSize < MODEL_MIN_BYTES {
      NSLog("[DutchVocabAI] Model file too small (\(modelFileSize) bytes) — deleting and re-prompting download")
      try? FileManager.default.removeItem(at: modelFileURL)
      loadError = nil
      return .notDownloaded
    }
    // File exists but engine failed to load previously — report the error so the
    // UI can offer a retry or re-download instead of silently appearing "available".
    if loadError != nil { return .loadError }
    return .available
  }

  func loadErrorDetail() -> String? {
    return loadError?.localizedDescription
  }

  func resetModel(deleteFile: Bool) {
    loadLock.lock()
    // Release the conversation before the engine — the session handle belongs to it.
    activeConversation = nil
    activeSessionId = nil
    engine = nil
    visionAvailable = false
    loadError = nil
    loadLock.unlock()
    if deleteFile {
      try? FileManager.default.removeItem(at: modelFileURL)
    }
    // Always wipe the LiteRT-LM kernel/shader cache on an explicit reset so
    // the next ensureLoaded() gets a clean cache directory. This fixes stale
    // compiled GPU kernels that can cause litert_lm_engine_create to return nil
    // after an OS upgrade or LiteRT-LM framework update.
    let cachePath = cacheDirectory
    try? FileManager.default.removeItem(atPath: cachePath)
    try? FileManager.default.createDirectory(atPath: cachePath, withIntermediateDirectories: true)
  }

  func generate(prompt: String, system: String) async throws -> String {
    let gate = self.gate
    await gate.acquire()
    defer { Task { await gate.release() } }

    do {
      let conversation = try await startConversation(system: system)
      let response = try await conversation.sendMessage(Message(prompt))
      return response.toString
    } catch {
      throw Self.wrapGenerationError(error)
    }
  }

  /// Streams a response, invoking `onChunk` for every partial message.
  ///
  /// The conversation is owned by the runner (not by the returned stream) so it stays
  /// alive for the whole request and is torn down on our thread, not inside LiteRT-LM's
  /// stream callback.
  func generateStream(
    prompt: String,
    system: String,
    onChunk: (String) -> Void
  ) async throws {
    let gate = self.gate
    await gate.acquire()
    defer { Task { await gate.release() } }

    do {
      let conversation = try await startConversation(system: system)
      for try await chunk in conversation.sendMessageStream(Message(prompt)) {
        onChunk(chunk.toString)
      }
    } catch {
      throw Self.wrapGenerationError(error)
    }
  }

  /// Generates from a prompt with an image attached.
  ///
  /// `imagePath` must be an absolute file path, not a file:// URL — LiteRT-LM opens
  /// it directly. Callers are expected to have downscaled the photo first; a full
  /// camera frame is far larger than the encoder's input.
  func generateWithImage(prompt: String, system: String, imagePath: String) async throws -> String {
    let gate = self.gate
    await gate.acquire()
    defer { Task { await gate.release() } }

    guard FileManager.default.fileExists(atPath: imagePath) else {
      throw NSError(domain: "DutchVocabAI", code: 40,
                    userInfo: [NSLocalizedDescriptionKey: "image_missing: no file at \(imagePath)"])
    }
    do {
      // The engine has to be up before visionAvailable means anything — it is set
      // during the load. Checking it first always fails on the very first call.
      _ = try await ensureLoaded()
      guard visionAvailable else {
        throw NSError(domain: "DutchVocabAI", code: 41,
                      userInfo: [NSLocalizedDescriptionKey:
                        "vision_unavailable: the model loaded without its vision encoder."])
      }

      let conversation = try await startConversation(system: system)
      let message = Message(of: .imageFile(imagePath), .text(prompt))
      let response = try await conversation.sendMessage(message)
      return response.toString
    } catch {
      throw Self.wrapGenerationError(error)
    }
  }

  // MARK: Roleplay sessions

  /// Opens a roleplay scene and returns its session id.
  ///
  /// The conversation stays in `activeConversation` between turns, so LiteRT-LM keeps
  /// the kv-cache for the scene so far and each turn only prefills the new message.
  func startRoleplay(system: String) async throws -> String {
    let gate = self.gate
    await gate.acquire()
    defer { Task { await gate.release() } }

    do {
      // startConversation clears activeSessionId as it evicts the old session;
      // tag the new one afterwards.
      let conversation = try await startConversation(system: system)
      let sessionId = UUID().uuidString
      setActiveSessionId(sessionId)
      _ = conversation
      return sessionId
    } catch {
      throw Self.wrapGenerationError(error)
    }
  }

  func roleplayTurn(sessionId: String, prompt: String) async throws -> String {
    let gate = self.gate
    await gate.acquire()
    defer { Task { await gate.release() } }

    do {
      let conversation = try conversationForSession(sessionId)
      let response = try await conversation.sendMessage(Message(prompt))
      return response.toString
    } catch {
      throw Self.wrapGenerationError(error)
    }
  }

  func roleplayTurnStream(
    sessionId: String,
    prompt: String,
    onChunk: (String) -> Void
  ) async throws {
    let gate = self.gate
    await gate.acquire()
    defer { Task { await gate.release() } }

    do {
      let conversation = try conversationForSession(sessionId)
      for try await chunk in conversation.sendMessageStream(Message(prompt)) {
        onChunk(chunk.toString)
      }
    } catch {
      throw Self.wrapGenerationError(error)
    }
  }

  /// Ends the scene. Returns false when the session was already gone, so JS can tell
  /// "I closed it" apart from "it had been evicted already".
  @discardableResult
  func endRoleplay(sessionId: String) -> Bool {
    loadLock.lock()
    guard activeSessionId == sessionId else {
      loadLock.unlock()
      return false
    }
    let previous = activeConversation
    activeConversation = nil
    activeSessionId = nil
    loadLock.unlock()
    _ = previous
    return true
  }

  /// Resolves a session id to its live conversation.
  ///
  /// Throws `session_expired` when the scene has been evicted — by another AI feature
  /// taking the engine's single session slot, by `resetModel`, or by a background
  /// unload. The JS layer turns this into an offer to restart the scene.
  private func conversationForSession(_ sessionId: String) throws -> Conversation {
    loadLock.lock()
    let currentId = activeSessionId
    let conversation = activeConversation
    loadLock.unlock()

    guard let conversation, currentId == sessionId, conversation.isAlive else {
      throw NSError(
        domain: "DutchVocabAI", code: 30,
        userInfo: [NSLocalizedDescriptionKey:
          "session_expired: this roleplay scene is no longer active. Start a new one."])
    }
    return conversation
  }

  /// Releases the previous conversation and creates a fresh one for this request.
  private func startConversation(system: String) async throws -> Conversation {
    let eng = try await ensureLoaded()

    // Free the previous session before allocating a new one, so the two never
    // coexist and the native delete runs here — on the calling thread — rather
    // than re-entrantly inside LiteRT-LM's own stream callback.
    releasePreviousConversation()

    let config = ConversationConfig(systemMessage: Message(system, role: .system))
    let conversation = try await eng.createConversation(with: config)

    setActiveConversation(conversation)

    return conversation
  }

  /// Drops the runner's reference to the last conversation. The handle is deleted when
  /// `previous` goes out of scope as this function returns.
  private func releasePreviousConversation() {
    loadLock.lock()
    let previous = activeConversation
    activeConversation = nil
    activeSessionId = nil
    loadLock.unlock()
    _ = previous
  }

  private func setActiveSessionId(_ sessionId: String) {
    loadLock.lock()
    activeSessionId = sessionId
    loadLock.unlock()
  }

  private func setActiveConversation(_ conversation: Conversation) {
    loadLock.lock()
    activeConversation = conversation
    loadLock.unlock()
  }

  /// Tags generation failures so the JS layer can tell "the model is missing" apart
  /// from "this particular request failed" instead of showing one catch-all message.
  /// Errors we raise ourselves already carry a marker and pass through untouched.
  private static func wrapGenerationError(_ error: Error) -> Error {
    let ns = error as NSError
    if ns.domain == "DutchVocabAI" { return error }
    return NSError(
      domain: "DutchVocabAI", code: 20,
      userInfo: [
        NSLocalizedDescriptionKey: "generation_failed: \(error.localizedDescription)",
        NSUnderlyingErrorKey: error,
      ])
  }

  func downloadModel(
    progressHandler: @escaping (Int64, Int64) -> Void,
    completion: @escaping (Result<Void, Error>) -> Void
  ) {
    queue.async { [weak self] in
      guard let self else { return }

      if self.modelFileExists {
        completion(.success(()))
        return
      }
      if self.isDownloading {
        completion(.failure(NSError(domain: "DutchVocabAI", code: 10, userInfo: [NSLocalizedDescriptionKey: "Download already in progress."])))
        return
      }
      guard let url = URL(string: MODEL_URL) else {
        completion(.failure(NSError(domain: "DutchVocabAI", code: 11, userInfo: [NSLocalizedDescriptionKey: "Invalid model URL."])))
        return
      }

      self.progressHandler = progressHandler
      self.downloadCompletion = completion
      self.isDownloading = true

      // Prevent the screen from auto-locking while a ~2.6 GB download is in progress.
      DispatchQueue.main.async {
        UIApplication.shared.isIdleTimerDisabled = true
      }

      let config = URLSessionConfiguration.default
      config.timeoutIntervalForResource = 60 * 60
      let session = URLSession(configuration: config, delegate: self, delegateQueue: nil)
      self.downloadSession = session

      let task = session.downloadTask(with: url)
      self.downloadTask = task
      task.resume()
    }
  }

  func cancelDownload() -> Bool {
    var didCancel = false
    queue.sync {
      if let task = downloadTask {
        task.cancel()
        didCancel = true
      }
      cleanupDownload()
    }
    return didCancel
  }

  // MARK: Private

  private var modelDirectory: URL {
    let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first!
    if !FileManager.default.fileExists(atPath: dir.path) {
      try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    }
    return dir
  }

  private var modelFileURL: URL {
    modelDirectory.appendingPathComponent(MODEL_FILENAME)
  }

  private var modelFileExists: Bool {
    FileManager.default.fileExists(atPath: modelFileURL.path)
  }

  /// Size of the downloaded model file in bytes, or 0 if the file is missing.
  private var modelFileSize: Int64 {
    let attrs = try? FileManager.default.attributesOfItem(atPath: modelFileURL.path)
    return (attrs?[.size] as? NSNumber)?.int64Value ?? 0
  }

  private var cacheDirectory: String {
    let dir = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first!
      .appendingPathComponent("litertlm", isDirectory: true)
    if !FileManager.default.fileExists(atPath: dir.path) {
      try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    }
    return dir.path
  }

  private func ensureLoaded() async throws -> Engine {
    loadLock.lock()
    if let eng = engine {
      loadLock.unlock()
      return eng
    }
    loadLock.unlock()

    guard modelFileExists else {
      throw NSError(domain: "DutchVocabAI", code: 1,
                    userInfo: [NSLocalizedDescriptionKey: "not_downloaded"])
    }

    // Reject obviously-truncated files instead of letting LiteRT-LM emit an
    // opaque "failed to create engine" error. Removing the file here forces
    // the gate to show the download prompt on the next availability check.
    let size = modelFileSize
    if size < MODEL_MIN_BYTES {
      try? FileManager.default.removeItem(at: modelFileURL)
      throw NSError(domain: "DutchVocabAI", code: 12,
                    userInfo: [NSLocalizedDescriptionKey:
                      "not_downloaded: model file is incomplete (\(size) bytes). It has been removed — please re-download."])
    }

    loadError = nil

    // The kernel cache contains compiled Metal/GPU shaders generated by LiteRT-LM on
    // first load. Preserve it across launches for fast warm starts — only wipe it when
    // resetModel() is called (stale cache recovery) or when a load error occurs below.
    let cachePath = cacheDirectory
    try? FileManager.default.createDirectory(atPath: cachePath,
                                             withIntermediateDirectories: true)

    // ── Backend selection: GPU first, CPU fallback ──────────────────────────
    //
    // In a production standalone build, litert_lm_engine_create with .gpu returns nil
    // when the virtual-address entitlement is absent or the Metal driver reports
    // insufficient VA space. Rather than surfacing a cryptic "failed to create engine"
    // error, we transparently retry on CPU so the user still gets a working model.
    //
    // The entitlements fix (withLLMEntitlements plugin) is the correct long-term
    // solution; the CPU fallback is a safety net for devices or builds where the
    // privileged entitlement has not yet been approved by Apple.
    let backendsToTry: [Backend] = [.gpu, .cpu()]
    var lastError: Error = NSError(domain: "DutchVocabAI", code: 2,
                                   userInfo: [NSLocalizedDescriptionKey: "load_failed: no backend succeeded"])

    // Vision is attempted first, then dropped entirely.
    //
    // The model file carries a vision encoder, but initialising it costs extra
    // memory on every load and may simply fail on some devices. Falling back to a
    // text-only engine keeps grammar check, roleplay and the exams working there
    // instead of taking the whole feature set down with the camera feature.
    for wantVision in [true, false] {
      for backend in backendsToTry {
        do {
          let config = try EngineConfig(
            modelPath: modelFileURL.path,
            backend: backend,
            visionBackend: wantVision ? backend : nil,
            cacheDir: cachePath
          )
          let newEngine = Engine(engineConfig: config)
          try await newEngine.initialize()

          loadLock.lock()
          self.engine = newEngine
          self.visionAvailable = wantVision
          loadLock.unlock()
          if !wantVision {
            NSLog("[DutchVocabAI] Loaded without the vision encoder — photo features are unavailable")
          }
          return newEngine
        } catch {
          lastError = error
          // Wipe the shader cache after a GPU failure; a stale or incomplete cache
          // can prevent the CPU backend from initialising correctly on the next try.
          if backend == .gpu {
            try? FileManager.default.removeItem(atPath: cachePath)
            try? FileManager.default.createDirectory(atPath: cachePath,
                                                     withIntermediateDirectories: true)
          }
        }
      }
    }

    self.loadError = lastError
    throw NSError(
      domain: "DutchVocabAI", code: 2,
      userInfo: [
        NSLocalizedDescriptionKey: "load_failed: \(lastError.localizedDescription)",
        NSUnderlyingErrorKey: lastError,
      ])
  }

  private func cleanupDownload() {
    downloadTask = nil
    downloadSession?.invalidateAndCancel()
    downloadSession = nil
    progressHandler = nil
    downloadCompletion = nil
    isDownloading = false
    DispatchQueue.main.async {
      UIApplication.shared.isIdleTimerDisabled = false
    }
  }
}

// MARK: - URLSessionDownloadDelegate

extension GemmaRunner: URLSessionDownloadDelegate {
  func urlSession(
    _ session: URLSession,
    downloadTask: URLSessionDownloadTask,
    didWriteData bytesWritten: Int64,
    totalBytesWritten: Int64,
    totalBytesExpectedToWrite: Int64
  ) {
    progressHandler?(totalBytesWritten, totalBytesExpectedToWrite)
  }

  func urlSession(
    _ session: URLSession,
    downloadTask: URLSessionDownloadTask,
    didFinishDownloadingTo location: URL
  ) {
    let destination = modelFileURL
    do {
      if FileManager.default.fileExists(atPath: destination.path) {
        try FileManager.default.removeItem(at: destination)
      }
      try FileManager.default.moveItem(at: location, to: destination)

      // Exclude the 2.6 GB model file from iCloud and iTunes backups.
      // Without this flag iOS may: (a) upload the file to iCloud, consuming
      // the user's storage quota, or (b) delete it under App Thinning /
      // On-Demand Resources storage pressure, causing silent re-download cycles.
      var resourceValues = URLResourceValues()
      resourceValues.isExcludedFromBackup = true
      var mutableDestination = destination
      try? mutableDestination.setResourceValues(resourceValues)

      queue.async { [weak self] in
        guard let self else { return }
        let completion = self.downloadCompletion
        self.cleanupDownload()
        completion?(.success(()))
      }
    } catch {
      queue.async { [weak self] in
        guard let self else { return }
        let completion = self.downloadCompletion
        self.cleanupDownload()
        completion?(.failure(error))
      }
    }
  }

  func urlSession(
    _ session: URLSession,
    task: URLSessionTask,
    didCompleteWithError error: Error?
  ) {
    guard let error else { return }
    queue.async { [weak self] in
      guard let self else { return }
      let completion = self.downloadCompletion
      self.cleanupDownload()
      completion?(.failure(error))
    }
  }
}
