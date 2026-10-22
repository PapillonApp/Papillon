Pod::Spec.new do |s|
  s.name           = 'PapillonTips'
  s.version        = '1.0.0'
  s.summary        = 'TipKit tips, rendered through Expo UI SwiftUI hosts.'
  s.description    = 'Exposes Apple TipKit (iOS 17+) as an Expo UI SwiftUI view plus a small imperative API.'
  s.author         = 'Papillon'
  s.homepage       = 'https://getpapillon.xyz'
  s.license        = { :type => 'GPL-3.0' }
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.dependency 'ExpoUI'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
