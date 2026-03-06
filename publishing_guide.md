# Google Play Store Publishing Guide

This guide walks you through publishing **Dutch Vocab Builder** to the Google Play Store.

## 1. Prerequisites
- **Google Play Developer Account**: You need an account ($25 one-time fee). [Sign up here](https://play.google.com/console/signup).
- **EAS CLI**: Ensure you have the Expo EAS CLI installed (`npm install -g eas-cli`).

## 2. Build the Android App Bundle (AAB)
We will use EAS Build to create the production binary.

1.  **Run the build command:**
    ```bash
    eas build --platform android --profile production
    ```
2.  **Wait for completion**: This may take 10-20 minutes.
3.  **Download**: Once finished, EAS will provide a link to download the `.aab` file. **Download this file**, you will need to upload it to Google.

## 3. Create App in Google Play Console
1.  Go to [Google Play Console](https://play.google.com/console).
2.  Click **Create app**.
3.  **App Details**:
    - **App Name**: Dutch Vocab Builder
    - **Default Language**: English (or Dutch)
    - **App or Game**: App
    - **Free or Paid**: Free
4.  Accept the declarations and click **Create app**.

## 4. Set Up Store Listing
You will see a "Dashboard" with steps to get your app ready.

### A. Main Store Listing
- **App Name**: Dutch Vocab Builder
- **Short Description**: Learn Dutch vocabulary with flashcards and audio.
- **Full Description**: (Describe your features: Search, Audio Speed, Import CSV, etc.)
- **Graphics**:
    - **App Icon**: 512x512 px (PNG/JPEG)
    - **Feature Graphic**: 1024x500 px (PNG/JPEG)
    - **Phone Screenshots**: Upload at least 2 screenshots.

### B. App Content (Policy)
Complete the questionnaires in the **App Content** section (at the bottom of the left menu).
- **Privacy Policy**: Link to your privacy policy (GitHub Pages or website).
- **Ads**: "No, my app does not contain ads".
- **App Access**: "All functionality is available without special access".
- **Content Ratings**: Fill out the questionnaire (likely "Reference" or "Educational").
- **Target Audience and Content**: Likely "13+" or "18+".
- **News Apps**: "No".
- **COVID-19**: "My app is not a publicly available COVID-19 contact tracing or status app".
- **Data Safety**: (Import if you collect data, otherwise mark that you don't share data with third parties).

## 5. Release to Production (or Testing)
1.  In the left menu, go to **Testing > Internal testing** (for a small group) or **Production** (for the public).
2.  Click **Create new release**.
3.  **App Bundles**: Drag and drop the `.aab` file you downloaded from EAS Build.
4.  **Release Name**: `1.3.0` (it might auto-fill).
5.  **Release Notes**: Paste your `CHANGELOG.md` content here.
6.  Click **Next**, fix any warnings, and then **Start Rollout**.

## 6. Review Process
- Google will review your app. This can take anywhere from **1 to 7 days**.
- Check your email or the Console Dashboard for updates.
