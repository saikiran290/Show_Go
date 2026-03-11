# 🎬 ShowGo — Frontend (User App)

> The **ShowGo** user-facing mobile app built with **React Native** & **Expo SDK 54**.
> Users can browse movies, book tickets, view offers, manage bookings, and receive notifications.

---

## 📖 What is Expo?

**Expo** is a platform built on top of React Native that makes mobile app development much easier. Think of it like this:

- **React Native** = The engine that lets you write mobile apps using JavaScript/TypeScript.
- **Expo** = A toolkit that wraps React Native and handles the hard stuff for you (building, signing, icons, splash screens, etc.) so you don't have to touch Android Studio or Xcode directly.

### Key Expo Concepts

| Concept | What it means |
|---|---|
| **Expo Go** | A free app on your phone. You scan a QR code and instantly see your app running — no build needed. Great for quick development. |
| **EAS Build** | Expo's cloud service that compiles your app into an installable `.apk` (Android) or `.ipa` (iOS) file. You run ONE command and it does everything in the cloud. |
| **`app.json`** | The single config file that controls your app's name, icon, splash screen, package ID, and plugins. More details below. |
| **`eas.json`** | Config file that controls HOW the app is built (debug vs release, APK vs AAB, etc.). |
| **`.env`** | A file where you store environment variables like the backend API URL. |
| **`expo-router`** | A file-based routing system. Each `.tsx` file inside the `app/` folder becomes a screen automatically. |

---

## 🚀 Getting Started (Step-by-Step for Beginners)

### Step 1: Install Prerequisites

You need these installed on your computer **before** anything else:

1. **Node.js** (LTS version) — [Download here](https://nodejs.org/)
   - After installing, verify by opening Terminal and typing:
     ```bash
     node --version
     # Should print something like v20.x.x
     ```

2. **Git** — [Download here](https://git-scm.com/)
   - Verify:
     ```bash
     git --version
     ```

3. **Expo Go app** on your phone (for testing during development):
   - [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)

### Step 2: Clone & Install

```bash
# Clone the repository
git clone <YOUR_REPO_URL>

# Go into the frontend folder
cd Movie-app/frontend

# Install all dependencies (this may take a few minutes the first time)
npm install
```

### Step 3: Configure the Backend URL

The app needs to know WHERE your backend server is running.

1. Open the file called **`.env`** in the `frontend/` folder.
2. Change the URL to match your backend:

```env
# If your backend is running on an AWS EC2 server:
EXPO_PUBLIC_API_URL=http://YOUR_EC2_PUBLIC_IP:8000

# If your backend is running on your own computer (local development):
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8000
```

> [!IMPORTANT]
> **Do NOT use `localhost` or `127.0.0.1`!**
> When you test on a physical phone, `localhost` means the phone itself, not your computer. You must use your computer's actual IP address on the local network.
>
> **How to find your IP:**
> - **Mac**: Open Terminal → type `ipconfig getifaddr en0`
> - **Windows**: Open CMD → type `ipconfig` → look for "IPv4 Address" under your Wi-Fi adapter
> - **Linux**: Open Terminal → type `hostname -I`

### Step 4: Start the Development Server

```bash
npx expo start
```

After running this, you will see a **QR code** in the terminal.

- **On Android**: Open the **Expo Go** app → tap "Scan QR code" → scan the QR code.
- **On iPhone**: Open the **Camera** app → point it at the QR code → tap the notification that appears.

Your app should now load on your phone! 🎉

> [!TIP]
> Make sure your phone and computer are connected to the **same Wi-Fi network**, otherwise the phone won't be able to reach the development server.

---

## ⚙️ Understanding the Project Files

### Folder Structure

```
frontend/
├── app/                  # 📱 All your screens live here (file-based routing)
│   ├── (tabs)/           #   Tab navigation screens (Home, Search, Profile, etc.)
│   ├── movie/            #   Movie detail and related screens
│   ├── ticket/           #   Ticket/booking screens
│   ├── _layout.tsx       #   Root layout — sets up navigation structure
│   ├── auth.tsx          #   Login / OTP verification screen
│   ├── index.tsx         #   Entry point — redirect logic
│   ├── location.tsx      #   City/location selection screen
│   ├── my-bookings.tsx   #   User's booking history
│   ├── my-reviews.tsx    #   User's reviews
│   ├── notifications.tsx #   Push notification list
│   └── offers.tsx        #   Offers/promotions screen
├── assets/               # 🖼️ Images, icons, splash screen images
├── components/           # 🧩 Reusable UI components
├── config/               # ⚙️ API endpoint config & notification setup
│   ├── api.ts            #   All backend API endpoint URLs
│   └── notifications.ts  #   Push notification configuration
├── .env                  # 🔐 Environment variables (backend URL)
├── app.json              # 📋 App configuration (name, icon, package ID)
├── eas.json              # 🏗️ Build configuration (dev, preview, production)
├── package.json          # 📦 Dependencies and scripts
├── babel.config.js       # ⚙️ Babel/compiler configuration
└── tsconfig.json         # ⚙️ TypeScript configuration
```

### How File-Based Routing Works

With **expo-router**, the file structure inside `app/` directly maps to screen URLs:

| File | Screen |
|---|---|
| `app/index.tsx` | The first screen shown when app opens |
| `app/auth.tsx` | Login/Auth screen (`/auth`) |
| `app/location.tsx` | Location picker screen (`/location`) |
| `app/(tabs)/home.tsx` | Home tab screen |
| `app/movie/[id].tsx` | Movie detail screen (dynamic — `[id]` is the movie ID) |

If you create a new file `app/about.tsx`, it **automatically** becomes a new screen at `/about`. No extra config needed.

---

## 📋 Understanding `app.json` (App Configuration)

This is the most important config file. Here's what every field means:

```jsonc
{
  "expo": {
    "name": "ShowGo",              // 👈 App name shown on the phone's home screen
    "slug": "frontend",            // 👈 Internal ID used by Expo (don't change after first build)
    "version": "1.0.0",           // 👈 Your app version number
    "scheme": "showgo",           // 👈 Deep linking scheme (e.g., showgo://path)
    "orientation": "portrait",    // 👈 Lock the app to portrait mode
    "icon": "./assets/icon.png",  // 👈 App icon (1024x1024 PNG recommended)

    "splash": {
      "image": "./assets/splash-icon.png",  // 👈 Splash screen image
      "resizeMode": "contain",              // 👈 How the splash image scales
      "backgroundColor": "#000000"          // 👈 Splash screen background color
    },

    "ios": {
      "bundleIdentifier": "com.mahesh-bisai.frontend"  // 👈 Unique iOS App Store ID
    },

    "android": {
      "package": "com.maheshbisai.frontend",  // 👈 Unique Google Play Store ID
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",  // 👈 Android adaptive icon
        "backgroundColor": "#000000"
      }
    },

    "plugins": [
      "expo-router",            // File-based routing
      "expo-secure-store",      // Secure token storage
      ["expo-build-properties", {   // Build optimization
        "android": {
          "enableProguardInReleaseBuilds": true,        // 👈 Shrinks app size
          "enableShrinkResourcesInReleaseBuilds": true  // 👈 Removes unused resources
        }
      }]
    ],

    "extra": {
      "eas": {
        "projectId": "f189cc6e-..."  // 👈 Your Expo project ID (auto-generated)
      }
    }
  }
}
```

> [!WARNING]
> **Do NOT change `android.package` or `ios.bundleIdentifier` after your first EAS build!**
> These are tied to your app's signing keys. Changing them means you'd need a completely new keystore and your existing installs won't receive updates.

### Common `app.json` Edits

| What you want to do | What to change |
|---|---|
| Change app name on home screen | `"name": "Your New Name"` |
| Change app icon | Replace `assets/icon.png` with your new 1024×1024 PNG |
| Change splash screen | Replace `assets/splash-icon.png` with your image |
| Change splash background color | `"splash" → "backgroundColor": "#YOUR_COLOR"` |
| Change app version | `"version": "1.0.1"` |

---

## 📋 Understanding `eas.json` (Build Configuration)

This file controls how EAS Build creates your app:

```jsonc
{
  "build": {
    "development": {              // 🧪 For testing during development
      "developmentClient": true,  //    Includes dev tools (shake menu, logs)
      "distribution": "internal"  //    Only for internal testers (not public)
    },
    "preview": {                  // 👀 For sharing a test APK with others
      "distribution": "internal",
      "android": {
        "buildType": "apk"        //    Generates a direct-install .apk file
      }
    },
    "production": {               // 🚀 For final release / Play Store
      "autoIncrement": true,      //    Auto-increases version number each build
      "android": {
        "buildType": "apk"        //    Generates .apk (change to "app-bundle" for Play Store)
      }
    }
  }
}
```

---

## 🛠️ Development Commands

| Command | What it does |
|---|---|
| `npx expo start` | Start the dev server & show QR code |
| `npx expo start -c` | Start with cache cleared (use when things look stale/broken) |
| Press `a` in terminal | Open app in Android Emulator (requires Android Studio) |
| Press `i` in terminal | Open app in iOS Simulator (requires macOS + Xcode) |
| `npx expo install --fix` | Auto-fix dependency version mismatches |
| `npx expo-doctor` | Diagnose common project issues |

---

## 📦 Building an Installable APK (Step-by-Step)

When you want install the app on a phone **without** needing Expo Go, you need to create a build.

### Step 1: Install EAS CLI (one-time setup)

```bash
npm install -g eas-cli
```

### Step 2: Create an Expo Account (one-time setup)

1. Go to [expo.dev](https://expo.dev) and sign up for a **free** account.
2. Log in from your terminal:
   ```bash
   eas login
   ```
   It will ask for your Expo username and password.

### Step 3: Link Your Project (one-time setup)

```bash
eas project:init
```

This creates a `projectId` inside `app.json`. If you already see a `projectId` in your `app.json → extra → eas`, you can skip this step.

### Step 4: Run the Build

```bash
# For a test/preview APK:
eas build --profile preview --platform android

# For a production APK:
eas build --profile production --platform android
```

**What happens next:**

1. EAS will ask: *"Generate a new Android Keystore?"* → Press **Enter** (Yes). This is a signing key needed by Android — Expo stores it securely for you.
2. Your code will be uploaded to Expo's cloud servers.
3. The build takes **10–20 minutes** (it's building in the cloud).
4. Once done, you'll get a **download link** in the terminal. Download the `.apk` file and install it on your Android phone.

> [!TIP]
> You can also view all your builds at [expo.dev](https://expo.dev) → your project → Builds.

---

## ❌ Common Errors & Fixes

### "Network Request Failed"
- **Cause**: The app cannot reach the backend server.
- **Fix**:
  1. Check that the IP in `.env` is correct.
  2. Ensure your phone and computer are on the **same Wi-Fi network**.
  3. If using EC2, make sure port `8000` is open in the AWS Security Group.

### "Duplicate native module dependencies"
- **Cause**: Multiple versions of the same Expo package.
- **Fix**: Run `npx expo-doctor` then `npx expo install --fix`.

### "JavaScript heap out of memory"
- **Cause**: Node.js ran out of RAM.
- **Fix**: Run before building:
  ```bash
  export NODE_OPTIONS=--max-old-space-size=4096
  ```

### EAS Build failing with "Project ID" error
- **Cause**: Missing `projectId` in `app.json`.
- **Fix**: Run `eas project:init`.

### App shows a blank white screen
- **Cause**: Usually a JavaScript crash on startup.
- **Fix**: Run `npx expo start -c` to clear the cache. Check the terminal for red error messages.

### QR code won't scan / "Could not connect to development server"
- **Cause**: Phone and computer are on different networks, or a firewall is blocking the connection.
- **Fix**:
  1. Connect both devices to the **same Wi-Fi**.
  2. Disable any VPN on your phone.
  3. Try running `npx expo start --tunnel` (uses Expo's tunnel instead of your local network).

---

## 📝 How to Make Changes

### Adding a New Screen

1. Create a new file in `app/`, for example `app/about.tsx`.
2. Export a React component:
   ```tsx
   import { View, Text } from 'react-native';

   export default function AboutScreen() {
     return (
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <Text>About ShowGo</Text>
       </View>
     );
   }
   ```
3. The screen is automatically available at `/about`. Navigate to it using:
   ```tsx
   import { router } from 'expo-router';
   router.push('/about');
   ```

### Changing the Backend API URL

1. Edit the `.env` file → change `EXPO_PUBLIC_API_URL`.
2. **Restart** the dev server (`Ctrl+C` then `npx expo start -c`). Environment variables are NOT hot-reloaded.

### Changing App Icon

1. Create a **1024×1024 pixel PNG** image.
2. Replace `assets/icon.png` with your new image.
3. For Android adaptive icon, also replace `assets/adaptive-icon.png`.
4. Rebuild with EAS Build for the change to take effect in the installed app.

---

## 🎨 Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile framework |
| Expo SDK 54 | Development platform & build tools |
| expo-router | File-based navigation/routing |
| TypeScript | Type-safe JavaScript |
| expo-secure-store | Secure storage for auth tokens |
| lucide-react-native | Modern icon library |
| react-native-reanimated | Smooth animations |
| expo-notifications | Push notifications |

---

Happy coding! 🍿
