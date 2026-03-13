import ExpoModulesCore

public class AppleIntelligenceModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AppleIntelligence')` in JavaScript.
    Name("AppleIntelligence")

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("generateTextAsync") { (prompt: String) -> String in
      // NOTE: In a real iOS 26 Apple Intelligence implementation, this would call 
      // the new Foundation Language Models API. For this baseline structure, 
      // we mock the Foundation Model response with a simulated delay and logic 
      // since the specific iOS 26 Intelligence APIs are not publicly finalized in SDKs yet.
      
      // Simulate on-device reasoning/inference delay
      Thread.sleep(forTimeInterval: 1.5)
      
      let lowerPrompt = prompt.lowercased()
      
      // Extract user sentence (between quotes)
      var userSentence = ""
      let components = lowerPrompt.components(separatedBy: "\"")
      if components.count > 1 {
          userSentence = components[1].trimmingCharacters(in: .whitespacesAndNewlines)
      }
      userSentence = userSentence.replacingOccurrences(of: ".", with: "").replacingOccurrences(of: "!", with: "").replacingOccurrences(of: "?", with: "")

      // Extract expected keywords (between brackets)
      var keywordsStr = ""
      if let rangeStart = lowerPrompt.range(of: "["), let rangeEnd = lowerPrompt.range(of: "]") {
          keywordsStr = String(lowerPrompt[rangeStart.upperBound..<rangeEnd.lowerBound])
      }
      
      let keywords = keywordsStr.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
      
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
      
      return "I'm your Apple Intelligence Dutch tutor! Give me a sentence or ask for a rule to practice."
    }
  }
}
