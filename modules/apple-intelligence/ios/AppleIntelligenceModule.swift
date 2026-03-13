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
      
      if lowerPrompt.contains("subject") && lowerPrompt.contains("verb") && !lowerPrompt.contains("object") {
          return "Good start! 'Ik eet' (I eat) is a complete Subject + Verb sentence. Now try adding an object, like 'een appel' (an apple)."
      } else if lowerPrompt.contains("object") && !lowerPrompt.contains("time") {
          return "Excellent! 'Ik eet een appel' follows the Subject + Verb + Object structure. Now, let's add a time expression. In Dutch, time usually comes immediately after the verb. Try adding 'vandaag' (today)."
      } else if lowerPrompt.contains("time") && !lowerPrompt.contains("location") {
          return "Perfect! 'Ik eet vandaag een appel' applies the rule (Subject + Verb + Time + Object). Time before Object is a key Dutch rule! Next, let's add a location, like 'thuis' (at home)."
      } else if lowerPrompt.contains("location") {
          return "Fantastic! 'Ik eet vandaag een appel thuis' uses the Time-Manner-Place (TMP) rule correctly. You've mastered basic Dutch sentence structure!"
      } else if lowerPrompt.contains("question") {
          return "To form a question, invert the subject and verb: 'Eet ik een appel?'"
      }
      
      return "I'm your Apple Intelligence Dutch tutor! Give me a sentence or ask for a rule to practice (e.g., 'rule: subject+verb')."
    }
  }
}
