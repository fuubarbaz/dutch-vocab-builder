Pod::Spec.new do |s|
  s.name           = 'DutchVocabAI'
  s.version        = '1.0.0'
  s.summary        = 'On-device Dutch language AI tutor backed by Gemma via LiteRT-LM.'
  s.description    = 'Expo native module bundling the LiteRT-LM Swift API and CLiteRTLM XCFramework to run gemma-4-E2B-it on device.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '17.0' }
  s.source         = { git: '' }

  # DO NOT set static_framework = true when you also declare vendored_frameworks.
  #
  # WHY: CocoaPods with static_framework=true wraps the pod's own Swift/ObjC
  # sources into a static .a archive, but vendored_frameworks (XCFrameworks)
  # must still be *embedded* as dynamic frameworks in the final app bundle.
  # Setting static_framework=true suppresses the automatic "Embed & Sign" step
  # that CocoaPods would otherwise add, so the CLiteRTLM binary is linked but
  # never copied into the .app — causing dyld to crash at launch in a
  # standalone build (works in dev-client because the Expo launcher already
  # has the framework in its own bundle search paths).
  #
  # Removing the flag lets CocoaPods correctly: link the XCFramework at build
  # time AND embed + code-sign it into the app bundle for distribution.

  s.dependency 'ExpoModulesCore'

  # Swift sources: our module + the vendored LiteRT-LM Swift wrapper
  s.source_files = [
    "*.{h,m,mm,swift,hpp,cpp}",
    "LiteRTLM/*.swift",
  ]

  # Prebuilt C XCFramework — CocoaPods will link it and embed it in the app bundle.
  s.vendored_frameworks = "CLiteRTLM.xcframework"

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'OTHER_SWIFT_FLAGS' => '$(inherited)',
    # Ensure the host linker can find the embedded framework at runtime.
    'LD_RUNPATH_SEARCH_PATHS' => '$(inherited) @executable_path/Frameworks',
  }
end
