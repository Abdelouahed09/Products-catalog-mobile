# Products Catalog Mobile App

A modern React Native app built with Expo Router for browsing a product catalog: search, filter by category, sort by price, like items, and enjoy offline-friendly caching.

## 📦 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (or pnpm/yarn)
- Expo Go app on your device, or Android Studio / Xcode for emulators

### Quick start

From the project root:

```bash
npm install && npm start
# or
npm install && npx expo start
```

Then in the Expo CLI terminal:

- Press `a` to launch Android
- Press `i` to launch iOS (macOS + Xcode required)
- Press `w` to open on web
- Or scan the QR code with the Expo Go app

### Useful scripts

- `npm start` — Start the Expo dev server
- `npm run android` — Start on Android
- `npm run ios` — Start on iOS
- `npm run web` — Start on web
- `npm run lint` — Run ESLint
- `npm run reset-project` — Clean and re-init project metadata

## 📁 Project Structure

```
app/
  _layout.tsx              # Root: QueryClientProvider + StatusBar + Stack
  (tabs)/
    _layout.tsx            # Tabs with header and theming
    index.tsx              # Products list: search, filter, sort, infinite scroll
    liked.tsx              # Liked products (persisted)

components/
  ui/
    Toolbar.tsx            # Search + filter + sort actions
    CategoryModal.tsx      # Category picker modal
    ProductCard.tsx        # Product item UI

types/
  product.ts               # Shared Product type

assets/images/             # Icons, splash assets
```

## ✨ Features

- Search by title, filter by category, sort by price
- Infinite scrolling with responsive 1–3 column grid
- Like/favorite products; favorites are persisted locally
- Offline-friendly: products/categories cached to AsyncStorage and used as fallback
- Error and loading states with retry

## 🌐 API

The app reads public data from [Fake Store API](https://fakestoreapi.com):

- `https://fakestoreapi.com/products`
- `https://fakestoreapi.com/products/categories`

## 🧠 Design Decisions

### Data fetching with React Query

- Components use `useQuery` for declarative data fetching and caching.
- Central provider configured in `app/_layout.tsx` with a single `QueryClient`.
- Conservative defaults: `retry: 1`, explicit `staleTime`/`gcTime` to balance freshness and memory.

### Offline-first via AsyncStorage

- Successful fetches cache products/categories in `AsyncStorage`.
- If a network request fails, cached data is used as a transparent fallback.
- Favorites are stored as a Set of product IDs in `AsyncStorage` and synchronized on focus.

### Styling with explicit hex colors

- All colors are defined with hex codes (e.g., `#0B1220`) to avoid platform inconsistencies on Android.
- Consistent dark theme across screens; components use `StyleSheet` with hex values.

### Navigation and layout

- File-based routing with Expo Router; tabs defined in `app/(tabs)/_layout.tsx`.
- Status bar theme and header styles use hex colors for consistency.
- Expo config enables new architecture and typed routes experiments for future-proofing.

### Performance considerations

- `FlatList` tuned with `initialNumToRender`, `windowSize`, `removeClippedSubviews`.
- Derivations memoized (`useMemo`), handlers stabilized (`useCallback`).
- Responsive columns computed from `useWindowDimensions()`; list `key` resets on column count changes to prevent layout glitches.
- Images rendered with `expo-image` for better performance and content fit.

## 🔧 Troubleshooting

- Clear Metro cache: `npx expo start -c`
- Android emulator not connecting: ensure `adb` is running, or try restarting: `adb kill-server && adb start-server`
- iOS build issues (on macOS): ensure Xcode and command line tools are installed and updated
- Reanimated warnings: run a clean start (`expo start -c`); Expo manages necessary config

Created by :

## Abdelouahed Amalas
