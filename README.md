# FormScribe 📝

> Transform multi-page Google Forms (30+ pages) into structured, professional Microsoft Word (`.docx`) and PowerPoint (`.pptx`) documents in seconds — 100% on-device.

[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native 0.86](https://img.shields.io/badge/React%20Native-0.86-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20Mode-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

When working with large, complex Google Forms (such as institutional surveys, accreditation audits, or government censuses spanning 30+ pages with conditional branching), respondents often need to review or print all questions before filling them in.

**FormScribe** eliminates the friction of clicking through 30+ pages. Paste any public Google Forms link (`forms.gle/...` or full URL), and FormScribe extracts every section, question, choice option, linear scale, and matrix grid, outputting an editable Microsoft Word document or a PowerPoint presentation deck.

---

## 📱 Screenshots

```
┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐
│       FormScribe        │   │      Form Preview       │   │     Export Options      │
│                         │   │                         │   │                         │
│  [ Paste Form URL ]     │   │  ATWIMA MPONUA DISTRICT │   │  1. Output Format       │
│  📋 Paste from Clip     │   │  35 Pages • 146 Qs      │   │  [ Word ] [ PPTX ] [Both]│
│  ⚡ Test 35-Page Form   │   │                         │   │                         │
│                         │   │  🔍 Search questions... │   │  2. Document Style      │
│  [ Read & Extract Form] │   │                         │   │  (•) Full Detail        │
│                         │   │  ▶ Page 1: Section 1    │   │  ( ) Simple List        │
│  Recent Forms           │   │  ▼ Page 2: Details      │   │                         │
│  • District Data 2026   │   │    1. EMIS Code * [Req] │   │  3. Formatting Toggles  │
│    35 Pages • 146 Qs    │   │    2. Status: Public /..│   │  [x] Answer Lines       │
│                         │   │                         │   │  [x] Cover Page         │
│                         │   │  [ 🚀 Export Form ]     │   │  [ 🚀 Generate & Share] │
└─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘
```

---

## ✨ Features

- **Multi-Page Section Extraction**: Extracts all pages without needing to fill them in sequentially. Tested and verified on massive 35-page forms.
- **Support for All Question Types**:
  - Short answer & Paragraph long text
  - Multiple choice (with "Other" and jump logic notes)
  - Checkboxes & Dropdown menus
  - Linear rating scales (with min/max custom labels)
  - Choice grids & Checkbox matrix tables
  - Date & Time pickers
  - File upload placeholders
- **Dual Export Engines**:
  - **Microsoft Word (`.docx`)**: Custom cover page, Table of Contents outline, clean section headers, numbered questions, styled choice boxes, and handwriting answer lines for printable paper worksheets.
  - **PowerPoint (`.pptx`)**: Widescreen 16:9 layout, title slide, section divider slides, and auto-paginated question cards that never overflow slide boundaries.
- **Interactive Preview & Filtering**:
  - Real-time search across question titles, descriptions, and option text across all sections.
  - "Required only" filter toggle.
  - Expandable/collapsible page sections.
- **100% On-Device & Private**:
  - No backend server.
  - No telemetry or data storage outside your phone.
  - Direct HTTP fetch to Google Forms with client-side JSON parsing.
- **Local Offline History**:
  - Recent forms stored locally via AsyncStorage for instant access.
- **Adaptive Appearance**:
  - Full support for Light, Dark, and System theme modes.
  - Built with responsive typography and haptic feedback.

---

## 🛠️ How the Parser Works

1. **URL Normalization & Redirect Following**:
   Google Forms short links (`forms.gle/XXXX`) are fetched with `redirect: 'follow'` to resolve to the canonical `docs.google.com/forms/d/e/.../viewform` endpoint.
2. **Payload Extraction**:
   The full form structure is embedded inside the server-rendered HTML within a script variable named `FB_PUBLIC_LOAD_DATA_`. FormScribe extracts this array defensively using regular expressions and parses the raw JSON.
3. **Defensive Schema Decoding**:
   - `data[1][8]` / `data[3]` / `data[1][0]`: Form title and main instructions.
   - `data[1][1]`: Array of form items.
   - Type code `8`: Section / Page breaks that partition questions into pages.
   - `item[4]`: Answer details, containing options, required flags (`item[4][0][2] === 1`), scale definitions, and choice matrices.
4. **Safe Error Handling**:
   Classifies errors into actionable messages:
   - `SIGN_IN_REQUIRED`: Form requires Google account authentication (restricted / internal forms).
   - `FORM_CLOSED`: Form is no longer accepting submissions.
   - `FORM_NOT_FOUND`: HTTP 404 or deleted form.
   - `NETWORK_ERROR`: Connectivity failure.
   - `PARSE_ERROR`: Offers a **"Copy Debug Info"** button to copy raw structure for diagnostics.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or bun

### Installation

```bash
# 1. Clone repository
git clone https://github.com/username/formscribe.git
cd formscribe

# 2. Install dependencies (Expo SDK 57 compatible)
npm install

# 3. Verify health and environment
npx expo-doctor
npm run typecheck
```

### Running the App

```bash
# Start Metro bundler
npx expo start

# Run on Android emulator / device
npx expo start --android

# Run on iOS simulator / device
npx expo start --ios
```

---

## 🧪 Testing

FormScribe includes a complete Jest test suite covering pure parser functions, error states, and DOCX/PPTX export generation.

```bash
# Run all unit and integration tests
npm test
```

### Verified Test Target
FormScribe has been tested against the following live 35-page form:
`https://forms.gle/cyEzZ6PBuYSPd1cz8`
- **Detected Sections**: 35 Pages
- **Extracted Questions**: 146 Questions
- **DOCX / PPTX Export**: Verified OpenXML packages with valid XML schemas.

---

## 🏗️ Building with EAS (Expo Application Services)

To build standalone production APKs/AABs for Android and IPAs for iOS:

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Log in to Expo account
eas login

# 3. Configure EAS build
eas build:configure

# 4. Build for Android (APK or App Bundle)
eas build --platform android --profile preview

# 5. Build for iOS
eas build --platform ios --profile preview
```

---

## ⚠️ Known Limitations & Out-of-Scope

1. **Public Forms Only**:
   Google Forms that require organizational sign-in (Google Workspace login or "Sign in to continue") cannot be retrieved without authentication cookies.
2. **Web Platform Fetch (CORS)**:
   Web browsers block direct `fetch()` to `docs.google.com` due to browser CORS policies. FormScribe is designed for **iOS and Android native runtimes**, where native HTTP requests bypass CORS restrictions.
3. **Dynamic Upload Submission**:
   FormScribe is designed to read, preview, and export form structures into Word/PowerPoint for review and paper worksheets. It does not submit responses back to Google Forms.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
