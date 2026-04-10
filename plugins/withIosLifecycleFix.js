const { withAppDelegate, withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Custom plugin to handle iOS 26.0 compatibility:
 * 1. Syncs IPHONEOS_DEPLOYMENT_TARGET across all Pods and project targets
 * 2. Adds @available guard for deprecated open:url:options: method
 *
 * NOTE: We intentionally do NOT remove UIApplicationSceneManifest or modify
 * the didFinishLaunchingWithOptions body. iOS 26 uses the UIScene lifecycle
 * by default, and Expo's standard flow handles this correctly. Removing the
 * scene manifest breaks the expo-dev-launcher initialization order
 * (autoSetupPrepare must run before autoSetupStart).
 */
function withIosLifecycleFix(config) {
  // 1. Patch Podfile to sync deployment targets
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const podfilePath = path.join(projectRoot, 'ios', 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf8');

        const deploymentTargetInjection = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'
        # Exclude arm64 for simulator builds so MLKit device-only frameworks don't cause linker errors
        if config.build_settings['SDKROOT'] == 'iphonesimulator' || config.name.downcase.include?('simulator')
          config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = 'arm64'
        end
      end
    end`;

        if (podfileContent.includes("post_install do |installer|")) {
          if (!podfileContent.includes("config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '26.0'")) {
            podfileContent = podfileContent.replace(
              "post_install do |installer|",
              "post_install do |installer|" + deploymentTargetInjection
            );
          }
        }

        fs.writeFileSync(podfilePath, podfileContent);
      }

      return config;
    },
  ]);

  // 2. Add @available guard for deprecated open:url:options: on iOS 26
  config = withAppDelegate(config, (config) => {
    let content = config.modResults.contents;

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

  // 3. Sync IPHONEOS_DEPLOYMENT_TARGET in Xcode project settings
  config = withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const buildConfigs = xcodeProject.pbxXCBuildConfigurationSection();

    for (const key in buildConfigs) {
      if (buildConfigs[key].buildSettings) {
        if (buildConfigs[key].buildSettings.IPHONEOS_DEPLOYMENT_TARGET) {
          buildConfigs[key].buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '26.0';
        }
        // Note: EXCLUDED_ARCHS for simulator is handled via the Podfile post_install hook only.
        // Setting 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' here would inject bracket-conditional
        // syntax into project.pbxproj, which the xcode npm parser cannot re-parse, causing
        // subsequent config plugins (e.g. withIosEntitlementsBaseMod) to fail during prebuild.
      }
    }

    const projectArray = xcodeProject.getFirstProject()?.firstProject;
    if (projectArray && projectArray.attributes) {
      projectArray.attributes.LastUpgradeCheck = '1630';
    }

    return config;
  });

  return config;
}

module.exports = withIosLifecycleFix;
