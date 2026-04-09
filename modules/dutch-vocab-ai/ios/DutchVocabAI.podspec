Pod::Spec.new do |s|
  s.name           = 'DutchVocabAI'
  s.version        = '1.0.0'
  s.summary        = 'A sample project summary'
  s.description    = 'A sample project description'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '17.4',
    :tvos => '17.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  # Translation and other system frameworks are auto-linked via Swift `import`
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'OTHER_SWIFT_FLAGS' => '$(inherited)',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
