require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name           = 'LinkrunnerSDK'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.authors        = { "Linkrunner" => "support@linkrunner.io" }
  s.platforms      = { :ios => "15.0" }
  s.swift_version  = '5.0'
  s.source         = { :git => package['repository']['url'].gsub('git+', ''), :tag => "#{s.version}" }

  s.source_files = "ios/*.{h,c,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  s.dependency 'LinkrunnerKit', '3.0.0'
end