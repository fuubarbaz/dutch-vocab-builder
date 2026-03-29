const { withAppDelegate, withInfoPlist, withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Custom plugin to handle iOS 26.0 compatibility:
 * 1. Restores AppDelegate lifecycle (fixes black screen)
 * 2. Adds @available guards to satisfy iOS 26.0 compiler
 * 3. syncs project deployment targets
 */
function withIosLifecycleFix(config) {
  // 1. Ensure SceneDelegate.swift is REMOVED if it exists (Cleanup)
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const projectName = config.modRequest.projectName;
      const iosFolder = path.join(projectRoot, 'ios', projectName);
      
        // 1. SceneDelegate Cleanup
        const sceneDelegatePath = path.join(iosFolder, 'SceneDelegate.swift');
        if (fs.existsSync(sceneDelegatePath)) {
          fs.unlinkSync(sceneDelegatePath);
        }

        // 2. Podfile Patch
        const podfilePath = path.join(projectRoot, 'ios', 'Podfile');
        if (fs.existsSync(podfilePath)) {
          let podfileContent = fs.readFileSync(podfilePath, 'utf8');
          
          // Define the clean post_install patch
          // CLEAN: No architecture exclusions (Fixes visibility / Error 70)
          const thoroughPatch = `post_install do |installer|
    projects = [installer.pods_project, installer.aggregate_targets[0].user_project]
    projects.each do |project|
      project.targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = ''
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'
        end
      end
      project.save
    end
    
    if defined?(react_native_post_install)
      react_native_post_install(
        installer,
        config[:reactNativePath],
        :mac_catalyst_enabled => false,
      )
    end
  end`;

          // Replace existing post_install or add if missing
          if (podfileContent.includes("post_install do |installer|")) {
            const injection = `
    projects = [installer.pods_project, installer.aggregate_targets[0].user_project]
    projects.each do |project|
      project.targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = ''
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'
        end
      end
      project.save
    end`;
            if (!podfileContent.includes("CLEAN: No architecture exclusions") && !podfileContent.includes("config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = ''")) {
              podfileContent = podfileContent.replace("post_install do |installer|", "post_install do |installer|\n    # CLEAN: No architecture exclusions" + injection);
            }
          } else {
            podfileContent += `\n\n\${thoroughPatch}\n`;
          }
          fs.writeFileSync(podfilePath, podfileContent);
        }

      return config;
    },
  ]);

  // 2. Modify AppDelegate.swift
  config = withAppDelegate(config, (config) => {
    let content = config.modResults.contents;

    // Restore standard window creation but ensure super.application is called FIRST for module registration
    const appDelegateBodyPattern = /public override func application\([\s\S]*?didFinishLaunchingWithOptions[\s\S]*?-> Bool \{([\s\S]*?)\}/;
    const match = content.match(appDelegateBodyPattern);
    if (match && !content.includes('// Restored manual window initialization after super.application')) {
      const body = match[1];
      const newBody = `
    let result = super.application(application, didFinishLaunchingWithOptions: launchOptions)

    let delegate = ReactNativeDelegate()
    let factory = ExpoReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory
    bindReactNativeFactory(factory)

    // Restored manual window initialization after super.application (Fixes module race condition)
    #if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
    #endif

    return result`;
      content = content.replace(body, newBody);
    }

    // Add @available guard to application(_:open:options:) if not present
    const openUrlPattern = /public override func application\(\s+_ app: UIApplication,\s+open url: URL,\s+options: \[UIApplication\.OpenURLOptionsKey: Any\] = \[:\]\s+\) -> Bool \{/;
    if (content.match(openUrlPattern) && !content.includes('@available(iOS, deprecated: 26.0')) {
      content = content.replace(
        openUrlPattern,
        `  @available(iOS, deprecated: 26.0, message: "Use UIScene lifecycle instead")\n  public override func application(\n    _ app: UIApplication,\n    open url: URL,\n    options: [UIApplication.OpenURLOptionsKey: Any] = [:]\n  ) -> Bool {`
      );
    }

    config.modResults.contents = content;
    return config;
  });

  // 3. Update Info.plist (Remove SceneManifest)
  config = withInfoPlist(config, (config) => {
    delete config.modResults.UIApplicationSceneManifest;
    return config;
  });

  // 4. Sync IPHONEOS_DEPLOYMENT_TARGET in project settings
  config = withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const buildConfigs = xcodeProject.pbxXCBuildConfigurationSection();
    
    for (const key in buildConfigs) {
      if (buildConfigs[key].buildSettings) {
        if (buildConfigs[key].buildSettings.IPHONEOS_DEPLOYMENT_TARGET) {
          buildConfigs[key].buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '26.0';
        }
        delete buildConfigs[key].buildSettings.SDKROOT;
        delete buildConfigs[key].buildSettings.VALID_ARCHS;
        buildConfigs[key].buildSettings['"EXCLUDED_ARCHS[sdk=iphonesimulator*]"'] = '""';
        buildConfigs[key].buildSettings.SUPPORTED_PLATFORMS = '"iphoneos iphonesimulator"';
      }
    }

    // 5. Update project attributes
    const projectArray = xcodeProject.getFirstProject()?.firstProject;
    if (projectArray && projectArray.attributes) {
      projectArray.attributes.LastUpgradeCheck = '1630';
    }
    
    return config;
  });

  return config;
}

module.exports = withIosLifecycleFix;
