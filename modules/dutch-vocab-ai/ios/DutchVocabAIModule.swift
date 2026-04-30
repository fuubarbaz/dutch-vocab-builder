import ExpoModulesCore
#if canImport(FoundationModels)
import FoundationModels
#endif
import Translation
import SwiftUI

public class DutchVocabAIModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DutchVocabAI")

    AsyncFunction("generateTextAsync") { (prompt: String) -> String in
      return try await self.generateText(prompt: prompt)
    }

    AsyncFunction("generateSmallTalkAsync") { (topic: String, turnCount: Int) -> String in
      return try await self.generateSmallTalk(topic: topic, turnCount: turnCount)
    }

    AsyncFunction("getAIAvailabilityAsync") { () -> String in
      return self.checkAvailability()
    }

    AsyncFunction("translateTextsAsync") { (texts: [String], sourceLang: String, targetLang: String) -> [String] in
      return try await Task { @MainActor in
        return try await self.translateWithApple(texts: texts, sourceLang: sourceLang, targetLang: targetLang)
      }.value
    }
  }

  // MARK: - Availability

  private func checkAvailability() -> String {
    let osVersion = ProcessInfo.processInfo.operatingSystemVersionString

    guard #available(iOS 26, *) else {
      return "diag:os_too_old:\(osVersion)"
    }

    #if canImport(FoundationModels)
    switch SystemLanguageModel.default.availability {
    case .available:
      return "available"
    case .unavailable(let reason):
      switch reason {
      case .appleIntelligenceNotEnabled:
        return "not_enabled"
      case .modelNotReady:
        return "model_not_ready"
      @unknown default:
        return "diag:unknown_reason:\(reason):\(osVersion)"
      }
    @unknown default:
      return "device_not_eligible"
    }
    #else
    // FoundationModels framework was not available at compile time.
    // Check that the Xcode SDK supports iOS 26 and the podspec weak-links FoundationModels.
    return "diag:foundation_models_not_imported:\(osVersion)"
    #endif
  }

  // MARK: - Text Generation

  private func generateText(prompt: String) async throws -> String {
    guard #available(iOS 26, *) else {
      throw Exception(name: "UnsupportedOS", description: "requires_ios26")
    }
    #if canImport(FoundationModels)
    try assertAvailable()

    let session = LanguageModelSession(instructions: """
      You are an expert Dutch language tutor helping learners master Dutch grammar and vocabulary.
      - When checking grammar: respond with CORRECT or INCORRECT on the first line, then a clear 2-3 sentence explanation.
      - When generating quiz questions or evaluation feedback: respond with valid JSON only, no extra text or markdown.
      - When evaluating sentences for keyword practice: give brief, encouraging feedback.
      Always be educational, constructive, and accurate.
      """)
    let response = try await session.respond(to: prompt)
    return response.content
    #else
    throw Exception(name: "UnsupportedOS", description: "requires_ios26")
    #endif
  }

  // MARK: - Small Talk Generation

  private func generateSmallTalk(topic: String, turnCount: Int) async throws -> String {
    guard #available(iOS 26, *) else {
      throw Exception(name: "UnsupportedOS", description: "requires_ios26")
    }
    #if canImport(FoundationModels)
    try assertAvailable()

    let turns = max(4, min(turnCount, 10))

    let session = LanguageModelSession(instructions: """
      You generate natural Dutch small talk conversations for A1-B1 language learners.
      Conversations alternate between Person A and Person B.
      Each turn must be 1-2 short, natural sentences using everyday vocabulary.
      Include a mix of statements and questions to keep the conversation flowing.
      Respond with a JSON array only — no extra text, no markdown fences.
      Format: [{"speaker":"A","dutch":"...","english":"..."},{"speaker":"B","dutch":"...","english":"..."}]
      """)
    let response = try await session.respond(
      to: "Generate a \(turns)-turn Dutch conversation about: \(topic)"
    )
    return response.content
    #else
    let osVersion = ProcessInfo.processInfo.operatingSystemVersionString
    throw Exception(name: "UnsupportedOS", description: "diag:foundation_models_not_imported:\(osVersion)")
    #endif
  }

  // MARK: - Availability Guard

  @available(iOS 26, *)
  private func assertAvailable() throws {
    #if canImport(FoundationModels)
    switch SystemLanguageModel.default.availability {
    case .available:
      return
    case .unavailable(let reason):
      switch reason {
      case .appleIntelligenceNotEnabled:
        throw Exception(name: "AIUnavailable", description: "not_enabled")
      case .modelNotReady:
        throw Exception(name: "AIUnavailable", description: "model_not_ready")
      @unknown default:
        let osVersion = ProcessInfo.processInfo.operatingSystemVersionString
        throw Exception(name: "AIUnavailable", description: "diag:unknown_reason:\(reason):\(osVersion)")
      }
    @unknown default:
      throw Exception(name: "AIUnavailable", description: "device_not_eligible")
    }
    #endif
  }

  // MARK: - Apple Translation Framework

  @MainActor
  private func translateWithApple(texts: [String], sourceLang: String, targetLang: String) async throws -> [String] {
    guard !texts.isEmpty else { return [] }

    guard #available(iOS 18.0, *) else {
      throw Exception(name: "UnsupportedOS", description: "Translation requires iOS 18.0 or later.")
    }

    return try await withCheckedThrowingContinuation { continuation in
      let source = Locale.Language(identifier: sourceLang)
      let target = Locale.Language(identifier: targetLang)
      let configuration = TranslationSession.Configuration(source: source, target: target)

      var hostingController: UIHostingController<HeadlessTranslationBridge>?

      let cleanup: @MainActor () -> Void = {
        hostingController?.view.removeFromSuperview()
        hostingController?.removeFromParent()
        hostingController = nil
      }

      let bridge = HeadlessTranslationBridge(
        texts: texts,
        configuration: configuration
      ) { results in
        cleanup()
        continuation.resume(returning: results)
      } onError: { error in
        cleanup()
        continuation.resume(throwing: error)
      }

      hostingController = UIHostingController(rootView: bridge)
      hostingController?.view.backgroundColor = .clear
      hostingController?.view.frame = CGRect(x: 0, y: 0, width: 1, height: 1)
      hostingController?.view.alpha = 0.01

      if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
         let rootVC = windowScene.windows.first?.rootViewController,
         let hc = hostingController {
        rootVC.addChild(hc)
        rootVC.view.addSubview(hc.view)
        hc.didMove(toParent: rootVC)
      } else {
        cleanup()
        continuation.resume(throwing: NSError(
          domain: "DutchVocabAI",
          code: 3,
          userInfo: [NSLocalizedDescriptionKey: "Could not find root view controller for translation."]
        ))
      }
    }
  }
}

// MARK: - SwiftUI Translation Bridge

@available(iOS 18.0, *)
struct HeadlessTranslationBridge: View {
  let texts: [String]
  let configuration: TranslationSession.Configuration?
  let onComplete: @MainActor ([String]) -> Void
  let onError: @MainActor (Error) -> Void

  var body: some View {
    Color.clear
      .translationTask(configuration) { session in
        do {
          var results = texts
          let requests = texts.enumerated().map { (i, text) in
            TranslationSession.Request(sourceText: text, clientIdentifier: String(i))
          }
          for try await response in session.translate(batch: requests) {
            if let idxStr = response.clientIdentifier,
               let idx = Int(idxStr),
               idx < results.count {
              results[idx] = response.targetText
            }
          }
          await onComplete(results)
        } catch {
          await onError(error)
        }
      }
  }
}
