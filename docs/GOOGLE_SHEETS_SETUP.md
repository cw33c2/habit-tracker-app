# 📊 Google 試算表 (Google Sheets) 免費雙向雲端同步教學

只需要 1 分鐘，建立一個專屬於你自己的免費雲端資料庫！

---

## 📋 第一步：建立 Google 試算表與貼上腳本

1. 打開你的 [Google 雲端硬碟 (Google Drive)](https://drive.google.com)
2. 點擊左上 **「新增」 ➔ 「Google 試算表」**，將標題改名為 `習慣清單雲端資料庫`
3. 點擊頂部選單 **「擴充功能」 ➔ 「Apps Script」**
4. 將裡面的預設程式碼全部刪除，**完整複製並貼上** 下方的這段程式碼：

```javascript
// ===== Google Apps Script 雲端同步腳本 =====

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'load') {
    return loadData();
  }
  return responseJSON({ success: false, message: 'Invalid action' });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === 'save') {
      return saveData(data.habits);
    }
  } catch (err) {
    return responseJSON({ success: false, error: err.toString() });
  }
  return responseJSON({ success: false, message: 'Invalid request' });
}

function saveData(habits) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear(); // 清除舊資料
  
  // 寫入表頭
  sheet.appendRow(['ID', '習慣標題', '類型', '重要緊急', '提醒時間', '目標天數', '建立時間', '完成打卡日期列表', 'JSONRaw']);
  
  // 寫入每一個習慣
  habits.forEach(function(h) {
    sheet.appendRow([
      h.id,
      h.title,
      h.type,
      h.isUrgent ? '是' : '否',
      h.time || '',
      h.targetDays || '',
      h.createdAt,
      (h.completedDates || []).join(', '),
      JSON.stringify(h)
    ]);
  });
  
  // 另存一份全量 JSON 方便 App 讀取
  var prop = PropertiesService.getScriptProperties();
  prop.setProperty('HABITS_DATA', JSON.stringify(habits));
  
  return responseJSON({ success: true, count: habits.length });
}

function loadData() {
  var prop = PropertiesService.getScriptProperties();
  var json = prop.getProperty('HABITS_DATA');
  var habits = json ? JSON.parse(json) : [];
  return responseJSON({ success: true, habits: habits });
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🚀 第二步：一鍵部署為 API 網址

1. 點擊頂部 **「儲存 💾」** 按鈕（或按 Ctrl+S）
2. 點擊右上角藍色按鈕 **「部署」 ➔ 「新增部署」**
3. 左側齒輪圖示選擇 **「Web 應用程式」**：
   - **說明**：填寫 `習慣清單 API`
   - **執行身份**：選擇 **「我 (Me)」**
   - **誰可以存取**：選擇 **「任何人 (Anyone)」** 👈 *非常重要！這樣手機才能連線*
4. 點擊 **「部署」** ➔ 系統會跳出授權請求 ➔ 點擊 **「核對存取權」** ➔ 選擇你的 Google 帳號 ➔ 點擊 **「進階」 ➔ 「前往 (不安全)」 ➔ 允許**。
5. 複製頁面上產生的 **Web 應用程式網址**（例如：`https://script.google.com/macros/s/AKfycb.../exec`）。

---

## 📱 第三步：貼回 App 即可完成同步！

回到我們的習慣清單 App：
1. 進入 **統計 📈** 頁面 ➔ 滾動到最下方點擊 **「設定同步 ☁️」**
2. 將剛才複製的網址貼入輸入框中 ➔ 點擊 **「儲存」**
3. 點擊 **「☁️ 上傳至雲端」** ➔ 打開你的 Google 試算表，你會看到所有習慣已自動變成表格列出！

🎉 **大功告成！從此你的習慣紀錄永遠保存在你自己的 Google 雲端！**
