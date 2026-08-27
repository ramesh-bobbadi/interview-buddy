# 🎯 OfflineIQ — Offline Interview Preparation Platform

**OfflineIQ** is a front-end web application designed to help job seekers practice technical, HR, and behavioral interview questions entirely offline after the initial page load. Powered by React.js and browser-native APIs, it features automated speech recognition, instant keyword-based answer scoring, and flexible navigation to recreate realistic interview scenarios without requiring constant internet connectivity.

---

## ✨ Features

* **Offline-First Functionality:** Complete full interview rounds offline using local asset loading and browser storage once the application is loaded.
* **Question Management & Persistence:**
  * Select between **Sequential** or **Randomized** question modes.
  * Persist interview progress, custom questions, and session data using browser **Local Storage**.
* **Speech-to-Text & Automated Answer Evaluation:**
  * Record spoken answers using voice input converted to text via web speech recognition.
  * Compare transcribed text against expected answers using smart keyword matching.
  * View immediate performance feedback with visual score indicators.
* **Timed Sessions & Flexible Navigation:**
  * Set optional time limits per question with automatic progression upon expiration.
  * Revisit, skip, or review prior questions using manual **Next** / **Previous** controls.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Library** | React.js |
| **State Management** | React Context API |
| **Data Persistence** | Browser Local Storage API |
| **Voice Recognition** | Web Speech API (`SpeechRecognition` / `SpeechSynthesis`) |
| **Styling** | CSS3 / Modern Flexbox & Grid |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
* **Node.js**: `v14.0` or higher
* **Package Manager**: `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ramesh-bobbadi/interview-buddy.git](https://github.com/ramesh-bobbadi/interview-buddy.git)
   cd interview-buddy
