# 極簡習慣清單 ✅

> 極簡高效的習慣追蹤 PWA，每天打卡培養好習慣。支援離線使用、可安裝到手機桌面。

![Tech Stack](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)
![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8?logo=pwa)

---

## ✨ 功能總覽

| 功能 | 說明 |
|------|------|
| 📋 **每日習慣打卡** | 支援永久習慣、倒數習慣、每週習慣、一次性任務 |
| ↩️ **打卡還原** | 誤打勾可一鍵取消打卡 |
| 🍅 **番茄計時器** | 25 分鐘專注 + 5 分鐘休息，完成自動發聲提醒 |
| 😴 **睡眠追蹤** | 記錄每天的入睡與起床時間 |
| 📊 **習慣統計** | 視覺化圖表顯示完成率與連勝天數 |
| 🏅 **成就徽章** | 17 種成就，連勝、全勤、番茄專注等 |
| 💡 **習慣範本** | 5 大分類 18 個熱門習慣一鍵套用 |
| 🎨 **深色玻璃風** | Glassmorphism 設計，4 種主題切換 |
| 📱 **PWA 安裝** | 可安裝到 iPhone / Android 桌面，支援離線使用 |
| 🔔 **推播通知** | 自訂時間提醒打卡 |
| 📤 **Google Sheets 同步** | 透過 Webhook 自動備份習慣資料 |

---

## 🚀 快速啟動

### 環境需求
- Node.js 18+
- npm 或 pnpm

### 安裝步驟

```bash
# 1. 複製專案
git clone https://github.com/cw33c2/habit-tracker-app.git
cd habit-tracker-app

# 2. 安裝套件
npm install

# 3. 啟動開發伺服器
npm run dev
```

打開瀏覽器前往 [http://localhost:3000](http://localhost:3000)

### 手機測試（同一個 Wi-Fi）

```bash
# 讓手機也能連
npx next dev --port 3001 --hostname 0.0.0.0
```

然後用手機瀏覽器打開 `http://<電腦IP>:3001`

---

## 📱 安裝到手機桌面

### iPhone（Safari）
1. 用 Safari 打開網址
2. 點底部「分享 □↑」
3. 選「加入主畫面」
4. 完成！桌面多一個 App 圖示

### Android（Chrome）
1. 用 Chrome 打開網址
2. 等 2 秒，底部自動出現安裝提示
3. 點「✅ 一鍵安裝到手機桌面」
4. 完成！

---

## 🗂 專案結構

```
habit-tracker-app/
├── public/
│   ├── manifest.json       # PWA 設定檔
│   ├── sw.js               # Service Worker（離線快取）
│   ├── icon-192.png        # App 圖示 192×192
│   └── icon-512.png        # App 圖示 512×512
├── src/
│   ├── app/
│   │   ├── page.tsx         # 🏠 今日習慣首頁
│   │   ├── pomodoro/        # 🍅 番茄計時器
│   │   ├── stats/           # 📊 統計頁
│   │   ├── badges/          # 🏅 成就徽章
│   │   └── settings/        # ⚙️ 設定頁
│   ├── components/
│   │   ├── TaskItem.tsx      # 習慣卡片元件
│   │   ├── AddHabitForm.tsx  # 新增習慣表單（含範本）
│   │   └── PWAInstaller.tsx  # PWA 安裝提示 Banner
│   ├── store/
│   │   └── useHabitStore.ts  # Zustand 全域狀態（含 persist）
│   ├── lib/
│   │   ├── badges.ts         # 成就徽章邏輯
│   │   ├── presets.ts        # 習慣範本資料
│   │   └── sound.ts          # 音效（Web Audio API）
│   └── hooks/
│       ├── useAutoSync.ts            # Google Sheets 自動同步
│       └── useNotificationScheduler.ts # 推播通知排程
```

---

## 🛠 技術棧

| 技術 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 16 (App Router) | 前端框架 |
| **React** | 19 | UI 元件 |
| **TypeScript** | 5 | 型別安全 |
| **Tailwind CSS** | v4 | 樣式 |
| **Zustand** | v5 | 全域狀態管理 |
| **Zod** | v4 | 資料驗證 |
| **Web Audio API** | — | 音效（零依賴） |

---

## 📄 License

MIT © 2026
