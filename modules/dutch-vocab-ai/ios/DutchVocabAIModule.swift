import ExpoModulesCore
import WebKit
import FoundationModels
import Vision
import UIKit

public class DutchVocabAIModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DutchVocabAI")

    AsyncFunction("generateTextAsync") { (prompt: String) -> String in
      if prompt.lowercased().contains("[grammar-check]") {
        return await self.checkGrammarWithAI(prompt: prompt)
      }
      return self.evaluateSentenceBuilder(prompt: prompt)
    }

    AsyncFunction("describeImageAsync") { (base64Image: String) -> String in
      return await self.describeImageWithAI(base64Image: base64Image)
    }

    AsyncFunction("classifyImageAsync") { (base64Image: String) -> [String] in
      guard let imageData = Data(base64Encoded: base64Image),
            let uiImage = UIImage(data: imageData),
            let cgImage = uiImage.cgImage else {
        return []
      }
      return await self.classifyImageWithVision(cgImage: cgImage)
    }

    View(DutchVocabAIView.self) {
      Prop("url") { (view: DutchVocabAIView, url: URL) in
        view.webView.load(URLRequest(url: url))
      }
      Events("onLoad")
    }
  }

  // MARK: - Image Description with Vision + Apple Intelligence

  private func describeImageWithAI(base64Image: String) async -> String {
    guard let imageData = Data(base64Encoded: base64Image),
          let uiImage = UIImage(data: imageData),
          let cgImage = uiImage.cgImage else {
      return "ERROR: Could not process the image. Please try taking another photo."
    }

    // Step 1: Use Vision framework to classify objects on-device
    let labels = await classifyImageWithVision(cgImage: cgImage)

    if labels.isEmpty {
      return describeImageFallback()
    }

    // Step 2: Use FoundationModels to generate Dutch vocabulary from Vision labels
    return await generateDutchVocabFromLabels(labels: labels)
  }

  private func classifyImageWithVision(cgImage: CGImage) async -> [String] {
    return await withCheckedContinuation { continuation in
      let request = VNClassifyImageRequest { request, error in
        guard error == nil,
              let observations = request.results as? [VNClassificationObservation] else {
          continuation.resume(returning: [])
          return
        }

        let labels = observations
          .filter { $0.confidence > 0.3 }
          .prefix(6)
          .map { $0.identifier.replacingOccurrences(of: "_", with: " ") }

        continuation.resume(returning: Array(labels))
      }

      let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
      try? handler.perform([request])
    }
  }

  private func generateDutchVocabFromLabels(labels: [String]) async -> String {
    do {
      let session = LanguageModelSession()
      let labelsList = labels.joined(separator: ", ")

      let prompt = """
      You are a Dutch language learning assistant. The following objects or concepts were detected in a photo: \(labelsList).

      For each item, provide the Dutch word with its article (de/het) and the English word.
      Then write one short Dutch sentence describing a scene with these objects and its English translation.

      Format your response exactly like this:
      OBJECTS:
      - de/het [Dutch word] ([English word])

      SENTENCE:
      [Dutch sentence]

      TRANSLATION:
      [English translation]
      """

      let response = try await session.respond(to: prompt)
      return response.content
    } catch {
      return generateFallbackFromLabels(labels: labels)
    }
  }

  private func generateFallbackFromLabels(labels: [String]) -> String {
    let objectLines = labels.map { "- \($0)" }.joined(separator: "\n")
    return "OBJECTS:\n\(objectLines)\n\nSENTENCE:\nIk zie deze dingen op de foto.\n\nTRANSLATION:\nI see these things in the photo.\n\nNote: Apple Intelligence is unavailable. Showing detected objects only (iOS 26+ with Apple Intelligence required for Dutch translations)."
  }


  private func describeImageFallback() -> String {
    return "OBJECTS:\n- het voorwerp (object)\n\nSENTENCE:\nIk zie een voorwerp op de foto.\n\nTRANSLATION:\nI see an object in the photo.\n\nNote: For detailed image descriptions, ensure Apple Intelligence is available on your device (iOS 26+ with a supported device)."
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
