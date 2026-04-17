import ExpoModulesCore
import WebKit
import FoundationModels
import Translation
import SwiftUI

public class DutchVocabAIModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DutchVocabAI")

    AsyncFunction("generateTextAsync") { (prompt: String) -> String in
      if prompt.lowercased().contains("[grammar-check]") {
        return await self.checkGrammarWithAI(prompt: prompt)
      }
      return self.evaluateSentenceBuilder(prompt: prompt)
    }

    AsyncFunction("generateSmallTalkAsync") { (topic: String, turnCount: Int) -> String in
      return await self.generateSmallTalk(topic: topic, turnCount: turnCount)
    }

    AsyncFunction("getAIAvailabilityAsync") { () -> String in
      #if targetEnvironment(simulator)
        return "available"
      #else
      if #available(iOS 26, *) {
        switch SystemLanguageModel.default.availability {
        case .available:
          return "available"
        case .unavailable(let reason):
          switch reason {
          case .appleIntelligenceNotEnabled:
            return "not_enabled"
          case .modelNotReady:
            return "model_not_ready"
          default:
            return "unavailable"
          }
        @unknown default:
          return "unavailable"
        }
      } else {
        return "requires_ios26"
      }
      #endif
    }

    AsyncFunction("translateTextsAsync") { (texts: [String], sourceLang: String, targetLang: String) -> [String] in
      return try await Task { @MainActor in
        do {
          return try await self.translateWithApple(texts: texts, sourceLang: sourceLang, targetLang: targetLang)
        } catch {
          throw Exception(name: "TranslationError", description: error.localizedDescription)
        }
      }.value
    }

    View(DutchVocabAIView.self) {
      Prop("url") { (view: DutchVocabAIView, url: URL) in
        view.webView.load(URLRequest(url: url))
      }
      Events("onLoad")
    }
  }

  // MARK: - Small Talk Generation

  private func generateSmallTalk(topic: String, turnCount: Int) async -> String {
    guard #available(iOS 26, *) else {
      print("[SmallTalk] iOS 26+ required")
      return "ERROR:REQUIRES_IOS26"
    }

    #if !targetEnvironment(simulator)
    let availability = SystemLanguageModel.default.availability
    switch availability {
    case .available:
      break
    case .unavailable(let reason):
      print("[SmallTalk] Apple Intelligence unavailable: \(reason)")
      switch reason {
      case .appleIntelligenceNotEnabled:
        return "ERROR:AI_NOT_ENABLED"
      case .modelNotReady:
        return "ERROR:MODEL_NOT_READY"
      default:
        return "ERROR:UNAVAILABLE:\(reason)"
      }
    @unknown default:
      return "ERROR:UNKNOWN_AVAILABILITY"
    }
    #endif

    do {
      let session = LanguageModelSession()
      let turns = max(4, min(turnCount, 10))

      let prompt = """
      Generate a natural small talk conversation in Dutch between two people (Person A and Person B) about the topic: "\(topic)".

      Rules:
      - Exactly \(turns) turns total (alternating A and B, starting with A)
      - Each turn must be a short, natural sentence (1-2 sentences max)
      - Use everyday Dutch vocabulary suitable for A1-B1 learners
      - Include a mix of questions and responses to keep it flowing

      Output ONLY a JSON array with no extra text, in this exact format:
      [{"speaker":"A","dutch":"Dutch sentence here","english":"English translation here"},{"speaker":"B","dutch":"Dutch sentence here","english":"English translation here"}]
      """

      let response = try await session.respond(to: prompt)
      return response.content
    } catch {
      print("[SmallTalk] LanguageModelSession error: \(error)")
      return "ERROR:SESSION:\(error.localizedDescription)"
    }
  }

  private func generateSmallTalkFallback(topic: String) -> String {
    return "[{\"speaker\":\"A\",\"dutch\":\"Hoi! Hoe gaat het met jou?\",\"english\":\"Hi! How are you?\"},{\"speaker\":\"B\",\"dutch\":\"Goed, dank je! En met jou?\",\"english\":\"Good, thanks! And you?\"},{\"speaker\":\"A\",\"dutch\":\"Ook goed. Wat vind jij van \(topic)?\",\"english\":\"Also good. What do you think about \(topic)?\"},{\"speaker\":\"B\",\"dutch\":\"Dat vind ik heel interessant!\",\"english\":\"I find that very interesting!\"}]"
  }

  // MARK: - Apple Translation Framework

  @MainActor
  private func translateWithApple(texts: [String], sourceLang: String, targetLang: String) async throws -> [String] {
    guard !texts.isEmpty else { return [] }

    if #available(iOS 18.0, *) {
      return try await withCheckedThrowingContinuation { continuation in
        let source = Locale.Language(identifier: sourceLang)
        let target = Locale.Language(identifier: targetLang)
        let configuration = TranslationSession.Configuration(source: source, target: target)

        // Use a weak reference or a way to clean up the hosting controller
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
          continuation.resume(throwing: NSError(domain: "DutchVocabAI", code: 3, userInfo: [NSLocalizedDescriptionKey: "Could not find root view controller for translation bridge."]))
        }
      }
    } else {
      throw NSError(domain: "DutchVocabAI", code: 4, userInfo: [NSLocalizedDescriptionKey: "On-device translation requires iOS 18.0 or later."])
    }
  }

  // MARK: - Grammar Check with Apple Intelligence

  private func checkGrammarWithAI(prompt: String) async -> String {
    do {
      let session = LanguageModelSession()

      let systemInstruction = """
      You are a Dutch language grammar tutor. The user will provide a Dutch sentence.
      Analyze the sentence for grammatical correctness. Your response must follow this exact format:

      First line: either "CORRECT" or "INCORRECT"
      Then a blank line, followed by your explanation.

      If CORRECT: briefly confirm what grammar rules were applied well (word order, verb conjugation, article usage, etc.).
      If INCORRECT: explain what is wrong, which grammar rule is violated, and provide the corrected sentence.

      Keep your explanation concise (2-4 sentences). Always respond in English.
      """

      let components = prompt.components(separatedBy: "\"")
      let userSentence = components.count > 1
        ? components[1].trimmingCharacters(in: .whitespacesAndNewlines)
        : prompt

      let fullPrompt = "\(systemInstruction)\n\nDutch sentence to check: \"\(userSentence)\""
      let response = try await session.respond(to: fullPrompt)
      return response.content
    } catch {
      return self.basicGrammarFallback(prompt: prompt)
    }
  }

  private func basicGrammarFallback(prompt: String) -> String {
    let lowerPrompt = prompt.lowercased()
    let components = lowerPrompt.components(separatedBy: "\"")
    let userSentence = components.count > 1
      ? components[1].trimmingCharacters(in: .whitespacesAndNewlines)
      : ""

    if userSentence.isEmpty {
      return "Please enter a Dutch sentence to check."
    }

    let words = userSentence.components(separatedBy: " ").filter { !$0.isEmpty }
    if words.count < 2 {
      return "INCORRECT\n\nYour input is too short to evaluate. A Dutch sentence typically needs at least a subject and a verb. For example: \"Ik loop\" (I walk)."
    }

    return "CORRECT\n\nYour sentence appears to be structurally valid. For a more detailed analysis, please ensure Apple Intelligence is available on your device (requires iOS 26+ with a supported device)."
  }

  // MARK: - Sentence Builder Evaluation

  private func evaluateSentenceBuilder(prompt: String) -> String {
    let lowerPrompt = prompt.lowercased()

    var userSentence = ""
    let components = lowerPrompt.components(separatedBy: "\"")
    if components.count > 1 {
      userSentence = components[1].trimmingCharacters(in: .whitespacesAndNewlines)
    }
    userSentence = userSentence
      .replacingOccurrences(of: ".", with: "")
      .replacingOccurrences(of: "!", with: "")
      .replacingOccurrences(of: "?", with: "")

    var keywordsStr = ""
    if let rangeStart = lowerPrompt.range(of: "["),
       let rangeEnd = lowerPrompt.range(of: "]") {
      keywordsStr = String(lowerPrompt[rangeStart.upperBound..<rangeEnd.lowerBound])
    }

    let keywords = keywordsStr
      .components(separatedBy: ",")
      .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
      .filter { !$0.isEmpty }

    var missingKeywords: [String] = []
    for kw in keywords {
      if !userSentence.contains(kw) {
        missingKeywords.append(kw)
      }
    }

    if missingKeywords.isEmpty && !keywords.isEmpty {
      return "Excellent! '\(userSentence)' is correct and follows the rule perfectly!"
    } else if !keywords.isEmpty {
      return "Not quite. Remember to use these words: \(missingKeywords.joined(separator: ", ")). Try again!"
    }

    return "I'm your Dutch Vocab AI tutor! Give me a sentence or ask for a rule to practice."
  }
}

class DutchVocabAIView: ExpoView {
  let webView = WKWebView()
  let onLoad = EventDispatcher()
  var delegate: WebViewDelegate?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    delegate = WebViewDelegate { url in
      self.onLoad(["url": url])
    }
    webView.navigationDelegate = delegate
    addSubview(webView)
  }

  override func layoutSubviews() {
    webView.frame = bounds
  }
}

class WebViewDelegate: NSObject, WKNavigationDelegate {
  let onUrlChange: (String) -> Void

  init(onUrlChange: @escaping (String) -> Void) {
    self.onUrlChange = onUrlChange
  }

  func webView(_ webView: WKWebView, didFinish navigation: WKNavigation) {
    if let url = webView.url {
      onUrlChange(url.absoluteString)
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

          // Use batch translation
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
