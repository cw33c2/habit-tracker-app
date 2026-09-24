<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 使用者偏好規則 (User Rules)

## 英文輸入自動轉中文並生圖

- 當使用者丟入「英文文字/Prompt」時：
  1. 先將英文翻譯成繁體中文向使用者說明畫面內容。
  2. 使用 grill-me 互動方式（呼叫 `ask_question` 彈出選擇題）詢問使用者偏好的圖片比例：
     - `1:1`（正方形頭像/社群）
     - `16:9`（橫幅寬螢幕/電腦桌布）
     - `9:16`（直式滿版/手機桌布/限動）
  3. 使用者選擇比例後，以該比例調用生圖工具生成對應圖片。
  4. 自動將產出的圖片檔案存入 `C:\Users\ASUS\OneDrive\AI資料庫\AI生圖\`。
  5. 提供成果圖片預覽與儲存連結。

## YouTube 影片輸入自動學習與重點整理

- 當使用者丟入「YouTube 影片網址」時：
  1. 自動調用 `c:/Users/ASUS/OneDrive/AI資料庫/YouTube影片筆記/process_single_video.py` 下載繁體中文字幕並去重清理，存入 `逐字稿/`。
  2. 自動將內容消化並依「小白全餐版」（30秒比喻、流程圖解、條列精華、實踐清單）格式產出重點筆記，存入 `c:/Users/ASUS/OneDrive/AI資料庫/YouTube影片筆記/重點筆記/`。
  3. 向使用者提供成果精華與檔案連結。

## 語音生成偏好 (Voice Generation)

- 當使用者要求生成語音、朗讀或說話時：
  - **Asa**（女聲，預設）：台灣女聲 `zh-TW-HsiaoChenNeural`，清新溫柔。
  - **Wer**（男聲）：3號台灣男聲 `zh-TW-YunJheNeural`，陽光穩重。（念名字時發音為 **Wéi'ěr / 維爾**，不逐字念英文字母 W-E-R）。
  - 預設語速：**+20%**（俐落流暢風格）。
  - 若未特別指名角色，預設由 **Asa** 呈現；指名 **Wer** 時由 Wer 呈現。
  - 若使用者要求「兩人對話 / 雙人語音」，一律由 **Asa** 與 **Wer** 搭配演出，風格比照 **Google NotebookLM 雙人 Podcast 深度對聊風格**（一搭一唱、有感嘆、有追問、節奏緊湊流暢）。
  - **語氣禁忌**：文案請保持自然流暢，**嚴禁使用「耶！」、「囉！」或任何生硬造作的語助詞**，句尾力求乾淨自然，避免語音腔調做作或難聽。
  - 自動輸出語音檔至 `output/` 並提供播放與下載連結。
