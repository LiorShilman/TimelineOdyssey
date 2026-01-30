# Testing Phase 2: Moment Management

## הכנה

### 1. ודא שהשרת רץ
```powershell
npm run dev:server
```

### 2. התחבר וקבל token
```powershell
$response = Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/auth/login" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","password":"Test1234"}'

$token = $response.data.accessToken
Write-Host "Token: $token"
```

---

## בדיקות Moment CRUD

### 1. יצירת Moment חדש (CREATE)

```powershell
$momentData = @{
    title = "טיול מדהים בצפון"
    description = "טיול משפחתי נהדר לגליל העליון"
    momentDate = "2024-01-15T10:00:00Z"
    emotion = "happy"
    importance = 5
    locationName = "רמת הגולן"
} | ConvertTo-Json

$newMoment = Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments" `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $momentData

$newMoment | ConvertTo-Json -Depth 10
```

תוצאה צפויה (201):
```json
{
  "message": "Moment created successfully",
  "data": {
    "id": "uuid...",
    "userId": "...",
    "title": "טיול מדהים בצפון",
    "description": "טיול משפחתי נהדר לגליל העליון",
    "momentDate": "2024-01-15T10:00:00.000Z",
    "emotion": "happy",
    "importance": 5,
    "locationName": "רמת הגולן",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**שמור את ה-moment ID:**
```powershell
$momentId = $newMoment.data.id
Write-Host "Moment ID: $momentId"
```

---

### 2. יצירת עוד כמה Moments

```powershell
# Moment עצוב
$sadMoment = @{
    title = "יום קשה בעבודה"
    description = "היה יום ממש מתיש"
    momentDate = "2024-02-10T18:00:00Z"
    emotion = "sad"
    importance = 2
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments" `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $sadMoment

# Moment מרגש
$excitingMoment = @{
    title = "קידום בעבודה!"
    description = "קיבלתי קידום!"
    momentDate = "2024-03-20T14:00:00Z"
    emotion = "exciting"
    importance = 5
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments" `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $excitingMoment

# Draft moment
$draftMoment = @{
    title = "טיוטה"
    momentDate = "2024-04-01T12:00:00Z"
    isDraft = $true
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments" `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $draftMoment
```

---

### 3. קבלת כל ה-Moments (READ ALL)

```powershell
$allMoments = Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments" `
  -Headers @{"Authorization"="Bearer $token"}

$allMoments | ConvertTo-Json -Depth 10
Write-Host "Total moments: $($allMoments.count)"
```

תוצאה צפויה (200):
```json
{
  "data": [
    { /* moment 1 */ },
    { /* moment 2 */ },
    { /* moment 3 */ }
  ],
  "count": 4
}
```

---

### 4. פילטור לפי Emotion

```powershell
# רק moments שמחים
$happyMoments = Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments?emotion=happy" `
  -Headers @{"Authorization"="Bearer $token"}

Write-Host "Happy moments: $($happyMoments.count)"

# רק moments עצובים
$sadMoments = Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments?emotion=sad" `
  -Headers @{"Authorization"="Bearer $token"}

Write-Host "Sad moments: $($sadMoments.count)"
```

---

### 5. פילטור לפי טווח תאריכים

```powershell
# Moments מינואר עד פברואר 2024
$filtered = Invoke-RestMethod -Method GET `
  -Uri "http://localhost:3001/api/moments?startDate=2024-01-01&endDate=2024-02-28" `
  -Headers @{"Authorization"="Bearer $token"}

Write-Host "Moments in Jan-Feb: $($filtered.count)"
```

---

### 6. קבלת Moment ספציפי (READ ONE)

```powershell
$moment = Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments/$momentId" `
  -Headers @{"Authorization"="Bearer $token"}

$moment.data | ConvertTo-Json -Depth 10
```

---

### 7. עדכון Moment (UPDATE)

```powershell
$updateData = @{
    title = "טיול מדהים בצפון - עודכן!"
    description = "עדכנתי את התיאור של הטיול הנהדר"
    importance = 4
    emotion = "nostalgic"
} | ConvertTo-Json

$updated = Invoke-RestMethod -Method PUT -Uri "http://localhost:3001/api/moments/$momentId" `
  -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
  -Body $updateData

$updated | ConvertTo-Json -Depth 10
```

תוצאה צפויה (200):
```json
{
  "message": "Moment updated successfully",
  "data": {
    "id": "...",
    "title": "טיול מדהים בצפון - עודכן!",
    "emotion": "nostalgic",
    "importance": 4,
    ...
  }
}
```

---

### 8. מחיקה רכה (SOFT DELETE)

```powershell
Invoke-RestMethod -Method DELETE -Uri "http://localhost:3001/api/moments/$momentId" `
  -Headers @{"Authorization"="Bearer $token"}
```

תוצאה צפויה (200):
```json
{
  "message": "Moment deleted successfully"
}
```

**בדוק שה-moment לא מופיע יותר:**
```powershell
$allMoments = Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments" `
  -Headers @{"Authorization"="Bearer $token"}

Write-Host "Moments after delete: $($allMoments.count)"
```

**בדוק עם includeDeleted:**
```powershell
$withDeleted = Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments?includeDeleted=true" `
  -Headers @{"Authorization"="Bearer $token"}

Write-Host "Moments with deleted: $($withDeleted.count)"
```

---

### 9. שחזור Moment שנמחק (RESTORE)

```powershell
$restored = Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments/$momentId/restore" `
  -Headers @{"Authorization"="Bearer $token"}

$restored | ConvertTo-Json -Depth 10
```

תוצאה צפויה (200):
```json
{
  "message": "Moment restored successfully",
  "data": {
    "id": "...",
    "title": "...",
    "deletedAt": null,
    ...
  }
}
```

---

### 10. סטטיסטיקות (STATS)

```powershell
$stats = Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments/stats" `
  -Headers @{"Authorization"="Bearer $token"}

$stats.data | ConvertTo-Json -Depth 10
```

תוצאה צפויה (200):
```json
{
  "data": {
    "total": 4,
    "byEmotion": [
      { "emotion": "happy", "_count": 1 },
      { "emotion": "sad", "_count": 1 },
      { "emotion": "exciting", "_count": 1 },
      { "emotion": "nostalgic", "_count": 1 }
    ],
    "byImportance": [
      { "importance": 2, "_count": 1 },
      { "importance": 4, "_count": 1 },
      { "importance": 5, "_count": 2 }
    ]
  }
}
```

---

## בדיקות שגיאות

### 1. יצירת Moment ללא title
```powershell
$invalidData = @{
    momentDate = "2024-01-01T12:00:00Z"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments" `
      -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
      -Body $invalidData
} catch {
    Write-Host "Error: $($_.ErrorDetails.Message)"
}
```

תוצאה צפויה (400):
```json
{
  "error": "Validation Error",
  "message": "Title and momentDate are required"
}
```

---

### 2. emotion לא תקין
```powershell
$invalidEmotion = @{
    title = "Test"
    momentDate = "2024-01-01T12:00:00Z"
    emotion = "invalid_emotion"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments" `
      -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
      -Body $invalidEmotion
} catch {
    Write-Host "Error: $($_.ErrorDetails.Message)"
}
```

תוצאה צפויה (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid emotion. Must be one of: happy, sad, exciting, nostalgic, neutral"
}
```

---

### 3. importance מחוץ לטווח
```powershell
$invalidImportance = @{
    title = "Test"
    momentDate = "2024-01-01T12:00:00Z"
    importance = 10
} | ConvertTo-Json

try {
    Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments" `
      -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
      -Body $invalidImportance
} catch {
    Write-Host "Error: $($_.ErrorDetails.Message)"
}
```

תוצאה צפויה (400):
```json
{
  "error": "Validation Error",
  "message": "Importance must be between 1 and 5"
}
```

---

### 4. גישה ל-moment של משתמש אחר
```powershell
# ניסיון לגשת ל-moment עם ID אקראי
try {
    Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments/00000000-0000-0000-0000-000000000000" `
      -Headers @{"Authorization"="Bearer $token"}
} catch {
    Write-Host "Error: $($_.ErrorDetails.Message)"
}
```

תוצאה צפויה (404):
```json
{
  "error": "Not Found",
  "message": "Moment not found"
}
```

---

### 5. ניסיון גישה ללא token
```powershell
try {
    Invoke-RestMethod -Method GET -Uri "http://localhost:3001/api/moments"
} catch {
    Write-Host "Error: $($_.ErrorDetails.Message)"
}
```

תוצאה צפויה (401):
```json
{
  "error": "Authentication Error",
  "message": "No authorization token provided"
}
```

---

## בדיקה עם Prisma Studio

```powershell
npm run prisma:studio
```

פתח: http://localhost:5555

צפוי לראות:
- טבלת **moments** עם כל ה-moments שיצרת
- השדות: title, description, momentDate, emotion, importance
- קשר ל-User דרך userId
- deletedAt = null (למעט moments שנמחקו)

---

## ✅ סיכום הבדיקות

אם כל הבדיקות עברו:

- ✅ יצירת moments עם כל השדות
- ✅ קבלת רשימת moments
- ✅ פילטור לפי emotion, importance, dates
- ✅ עדכון moments
- ✅ מחיקה רכה + שחזור
- ✅ סטטיסטיקות
- ✅ Validation עובד
- ✅ Authentication עובד
- ✅ טיפול בשגיאות תקין

**Phase 2 הושלם בהצלחה!** 🎉

---

## Tips

### שמירת token למשתמשים בודדים:
```powershell
# Create a helper function
function Get-AuthToken($email, $password) {
    $response = Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/auth/login" `
      -Headers @{"Content-Type"="application/json"} `
      -Body (@{email=$email; password=$password} | ConvertTo-Json)
    return $response.data.accessToken
}

$token = Get-AuthToken "test@example.com" "Test1234"
```

### יצירת moments מרובים בלולאה:
```powershell
1..10 | ForEach-Object {
    $data = @{
        title = "Moment $_"
        momentDate = (Get-Date).AddDays(-$_).ToString("o")
        emotion = @("happy", "sad", "exciting", "nostalgic", "neutral")[$_ % 5]
        importance = ($_ % 5) + 1
    } | ConvertTo-Json

    Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/moments" `
      -Headers @{"Authorization"="Bearer $token"; "Content-Type"="application/json"} `
      -Body $data
}
```
