import ExpoModulesCore
import WebKit
import FoundationModels
import Translation

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

    AsyncFunction("translateTextsAsync") { (texts: [String], sourceLang: String, targetLang: String) -> [String] in
      // TranslationSession.prepareTranslation() may present a download sheet — must run on main actor
      return try await Task { @MainActor in
        try await self.translateWithApple(texts: texts, sourceLang: sourceLang, targetLang: targetLang)
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
      return generateSmallTalkFallback(topic: topic)
    }
  }

  private func generateSmallTalkFallback(topic: String) -> String {
    return "[{\"speaker\":\"A\",\"dutch\":\"Hoi! Hoe gaat het met jou?\",\"english\":\"Hi! How are you?\"},{\"speaker\":\"B\",\"dutch\":\"Goed, dank je! En met jou?\",\"english\":\"Good, thanks! And you?\"},{\"speaker\":\"A\",\"dutch\":\"Ook goed. Wat vind jij van \(topic)?\",\"english\":\"Also good. What do you think about \(topic)?\"},{\"speaker\":\"B\",\"dutch\":\"Dat vind ik heel interessant!\",\"english\":\"I find that very interesting!\"}]"
  }

  // MARK: - Apple Translation Framework

  @MainActor
  private func translateWithApple(texts: [String], sourceLang: String, targetLang: String) async throws -> [String] {
    guard !texts.isEmpty else { return [] }

    let session = TranslationSession(
      installedSource: Locale.Language(identifier: sourceLang),
      target: Locale.Language(identifier: targetLang)
    )
    // prepareTranslation() may show a system sheet to download the language pack
    try await session.prepareTranslation()

    let requests = texts.enumerated().map { (i, text) in
      TranslationSession.Request(sourceText: text, clientIdentifier: String(i))
    }

    var results = texts
    for try await response in session.translate(batch: requests) {
      if let idxStr = response.clientIdentifier, let idx = Int(idxStr), idx < results.count {
        results[idx] = response.targetText
      }
    }
    return results
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
