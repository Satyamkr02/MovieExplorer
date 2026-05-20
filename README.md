# MovieExplorer 🎬

MovieExplorer is a modern and scalable React Native application that allows users to explore trending, popular, and searchable movies using the TMDB API.

The app is built using **React Native CLI** and follows real-world mobile app development practices such as Redux state management, API integration, pagination, local caching, reusable components, and smooth user experience.

This project was created to demonstrate production-level React Native development skills including clean architecture, performance optimization, API handling, and professional UI implementation.

---

# ✨ Features

## 🎥 Browse Movies
Users can browse trending and popular movies fetched from the TMDB API.

### Includes:
- Trending movies
- Popular movies
- Dynamic movie posters
- Ratings and release dates

---

## 🔍 Search Functionality
The app supports real-time movie searching.

### Features:
- Instant search results
- API-based search
- Smooth typing experience
- Empty state handling

---

## ♾️ Infinite Scrolling / Pagination
Movies load continuously while scrolling.

### Benefits:
- Better performance
- Reduced API load
- Smooth user experience
- Real-world production behavior

---

## 🧠 Redux Toolkit State Management
Redux Toolkit is used for scalable and centralized state management.

### Used For:
- Movie data management
- Search state
- Loading states
- Error handling

---

## 💾 Local Storage Persistence
AsyncStorage is used to store data locally.

### Purpose:
- Restore data after app restart
- Improve performance
- Better offline experience

---

## ⚡ Smooth UI & UX
The app focuses heavily on professional user experience.

### UI Features:
- Skeleton loading
- Smooth animations
- Responsive layouts
- Clean movie cards
- Optimized spacing

---

## 📱 Cross Platform Support
Supports both:
- Android
- iOS

Built using React Native CLI for native-level performance.

---

# 🚀 Tech Stack

## Frontend Technologies

| Technology | Purpose |
|------------|----------|
| React Native CLI | Mobile App Development |
| React Navigation | Navigation between screens |
| Redux Toolkit | State management |
| React Redux | Connect Redux with React Native |
| Axios | API requests |
| AsyncStorage | Local storage |
| Reanimated | Smooth animations |
| Gesture Handler | Gesture support |
| Safe Area Context | Safe UI rendering |

---

# 🌐 API Used

## TMDB API (The Movie Database)

The application uses TMDB API to fetch:
- Trending movies
- Popular movies
- Search results
- Movie details

Official Website:
https://www.themoviedb.org/

API Base URL:
```env
https://api.themoviedb.org/3
```

Image Base URL:
```env
https://image.tmdb.org/t/p/w500
```

---

# 📂 Project Folder Structure

```bash
src/
│
├── api/                # API configuration and requests
├── assets/             # Images, icons, fonts
├── components/         # Reusable UI components
├── navigation/         # Stack and tab navigation
├── redux/              # Redux store and slices
├── screens/            # Application screens
├── services/           # Business logic and helpers
├── utils/              # Utility/helper functions
└── constants/          # Static constants
```

---

# ⚙️ Installation Guide

## 1️⃣ Clone Repository

Clone the project from GitHub:

```bash
git clone https://github.com/Satyamkr02/MovieExplorer.git
```

Move into project folder:

```bash
cd MovieExplorer
```

---

## 2️⃣ Install Dependencies

Install all required npm packages:

```bash
npm install
```

---

## 3️⃣ Setup Environment Variables

Create a `.env` file in the root directory.

Add the following:

```env
TMDB_API_KEY=YOUR_TMDB_API_KEY
BASE_URL=https://api.themoviedb.org/3
IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

---

# 🔑 Getting TMDB API Key

1. Visit:
   https://www.themoviedb.org/

2. Create/Login to account

3. Go to:
   Settings → API

4. Generate API key

5. Paste API key inside `.env`

Example:

```env
TMDB_API_KEY=abcd1234example
```

---

# ▶️ Running the Application

## Android

Start Metro Server:

```bash
npx react-native start
```

Run Android App:

```bash
npx react-native run-android
```

---

## iOS

Install Pods:

```bash
cd ios
pod install
```

Return back:

```bash
cd ..
```

Run iOS App:

```bash
npx react-native run-ios
```

---

# 📦 Building Release APK

Generate Android Release APK:

```bash
cd android
./gradlew assembleRelease
```

Generated APK Location:

```bash
android/app/build/outputs/apk/release/
```

---

# 🛠️ Main Dependencies

```json
{
  "@react-navigation/native": "^7.x",
  "@reduxjs/toolkit": "^2.x",
  "react-redux": "^9.x",
  "axios": "^1.x",
  "@react-native-async-storage/async-storage": "^2.x",
  "react-native-reanimated": "^3.x",
  "react-native-gesture-handler": "^2.x"
}
```

---

# 📸 Screenshots

Add your application screenshots inside a `screenshots` folder.

Example:

```md
![Home Screen](screenshots/home.png)

![Movie Details](screenshots/details.png)

![Search Screen](screenshots/search.png)
```

---

# 🔥 Future Improvements

The following features can be added in future updates:

- 🎬 Movie trailers
- ❤️ Favorite/Wishlist system
- 🌐 Multi-language support
- 🎭 Genre filters
- ⭐ Ratings and reviews
- 📺 TV Shows support
- 🔔 Push notifications
- 👤 User authentication
- 📥 Offline downloads

---

# 👨‍💻 Author

## Satyam Kumar

Android & React Native Developer passionate about building scalable and professional mobile applications.

### Skills:
- React Native
- Android Development
- Kotlin
- Firebase
- Redux
- API Integration
- UI/UX Design

GitHub:
https://github.com/Satyamkr02

---

# 📄 License

This project is licensed under the MIT License.

You are free to use, modify, and distribute this project.

---

# ⭐ Support

If you found this project helpful:

- Give this repository a ⭐ on GitHub
- Share it with others
- Fork and contribute

---

# 📬 Contact

For collaboration or project discussion:

GitHub:
https://github.com/Satyamkr02

---

# 🙌 Acknowledgements

Special thanks to:

- React Native Community
- TMDB API
- Open-source contributors

for providing amazing tools and resources.

---
