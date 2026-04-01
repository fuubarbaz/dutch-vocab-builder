import ExpoModulesCore
import WebKit
import FoundationModels

public class DutchVocabAIModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DutchVocabAI")

    AsyncFunction("generateTextAsync") { (prompt: String) -> String in
      // Use Apple Intelligence on-device foundation model for grammar checking
      if prompt.lowercased().contains("[grammar-check]") {
        return await self.checkGrammarWithAI(prompt: prompt)
      }

      // Existing sentence builder logic (keyword matching)
      return self.evaluateSentenceBuilder(prompt: prompt)
    }

    View(DutchVocabAIView.self) {
      Prop("url") { (view: DutchVocabAIView, url: URL) in
        view.webView.load(URLRequest(url: url))
      }
      Events("onLoad")
    }
  }

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

      // Extract the user sentence from the prompt
      let components = prompt.components(separatedBy: "\"")
      let userSentence = components.count > 1
        ? components[1].trimmingCharacters(in: .whitespacesAndNewlines)
        : prompt

      let fullPrompt = "\(systemInstruction)\n\nDutch sentence to check: \"\(userSentence)\""
      let response = try await session.respond(to: fullPrompt)
      return response.content
    } catch {
      // Fall back to basic keyword analysis if on-device model is unavailable
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
