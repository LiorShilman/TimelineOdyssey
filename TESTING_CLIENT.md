# Testing Client - Full Stack Integration

## הכנה

### 1. ודא ש-Server רץ
```powershell
# בטרמינל נפרד
npm run dev:server
```

### 2. הפעל את ה-Client
```powershell
npm run dev:client
# או
cd client
npm run dev
```

אמור לפתוח אוטומטית: http://localhost:5173

---

## בדיקות Full Stack

### 1. הרשמה (Register)

1. פתח http://localhost:5173
2. תגיע אוטומטית ל-`/login`
3. לחץ על "הירשם כאן"
4. מלא טופס הרשמה:
   - שם פרטי: ישראל
   - שם משפחה: ישראלי
   - אימייל: client@example.com
   - סיסמה: Client1234

5. לחץ "הירשם"

**תוצאה צפויה:**
- Toast הודעה: "נרשמת בהצלחה!"
- מעבר אוטומטי ל-`/moments`
- רואה את דף "הרגעים שלי" (ריק)

---

### 2. יצירת Moment

1. לחץ על "+ רגע חדש"
2. מלא את הטופס:
   - כותרת: "הרגע הראשון מהקליינט!"
   - תיאור: "יצרתי את זה דרך ה-UI החדש"
   - תאריך: בחר תאריך כלשהו
   - רגש: 😊 שמח
   - חשיבות: 5

3. לחץ "שמור"

**תוצאה צפויה:**
- Toast: "הרגע נוצר בהצלחה!"
- הטופס נסגר
- הרגע מופיע ברשימה
- רואה את הכותרת, התאריך, הרגש, והכוכבים

---

### 3. יצירת עוד Moments

צור עוד כמה moments עם רגשות שונים:

**Moment 2:**
- כותרת: "יום קשה"
- רגש: 😢 עצוב
- חשיבות: 2

**Moment 3:**
- כותרת: "קידום!"
- רגש: 🎉 מרגש
- חשיבות: 5

**Moment 4:**
- כותרת: "זכרונות מהעבר"
- רגש: 🌅 נוסטלגי
- חשיבות: 4

**תוצאה צפויה:**
- כל ה-moments מופיעים ברשימה
- ממוינים לפי תאריך (החדשים בראש)
- צבעים שונים לכל רגש

---

### 4. מחיקת Moment

1. לחץ "מחק" על אחד ה-moments
2. אשר את המחיקה

**תוצאה צפויה:**
- Toast: "הרגע נמחק בהצלחה"
- ה-moment נעלם מהרשימה

---

### 5. התנתקות (Logout)

1. לחץ "התנתק" בראש הדף

**תוצאה צפויה:**
- Toast: "התנתקת בהצלחה"
- חזרה לדף התחברות

---

### 6. התחברות (Login)

1. התחבר עם המשתמש שיצרת:
   - אימייל: client@example.com
   - סיסמה: Client1234

2. לחץ "התחבר"

**תוצאה צפויה:**
- Toast: "התחברת בהצלחה!"
- מעבר ל-`/moments`
- רואה את כל ה-moments ששמרת קודם

---

### 7. בדיקת Protected Routes

1. התנתק
2. נסה לגשת ידנית ל-http://localhost:5173/moments

**תוצאה צפויה:**
- Redirect אוטומטי ל-`/login`

---

## בדיקת שגיאות

### 1. סיסמה שגויה בהתחברות
```
אימייל: client@example.com
סיסמה: WrongPassword
```
**תוצאה צפויה:** Toast אדום עם שגיאה

### 2. אימייל קיים בהרשמה
```
אימייל: client@example.com (שכבר קיים)
```
**תוצאה צפויה:** Toast שגיאה: "User with this email already exists"

### 3. סיסמה חלשה
```
סיסמה: 123
```
**תוצאה צפויה:** השרת יחזיר שגיאת validation

### 4. טופס moment ללא כותרת
נסה לשמור moment ללא כותרת

**תוצאה צפויה:** הדפדפן ימנע שליחה (required field)

---

## בדיקת Network (DevTools)

פתח DevTools (F12) → Network:

### בהתחברות:
```
POST http://localhost:3001/api/auth/login
Status: 200
Response: {
  "data": {
    "user": {...},
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### קבלת Moments:
```
GET http://localhost:3001/api/moments
Authorization: Bearer eyJhbGci...
Status: 200
Response: {
  "data": [...],
  "count": 3
}
```

### יצירת Moment:
```
POST http://localhost:3001/api/moments
Authorization: Bearer eyJhbGci...
Body: {
  "title": "...",
  "momentDate": "...",
  ...
}
Status: 201
```

---

## בדיקת Zustand State (DevTools)

התקן את React DevTools extension:
1. פתח React DevTools
2. לחץ על "Components"
3. בחר ב-`App`
4. תראה את ה-hooks:
   - `useAuthStore`: user, accessToken, isAuthenticated
   - `useMomentStore`: moments array

---

## ✅ סיכום הבדיקות

אם כל הבדיקות עברו:

- ✅ הרשמה והתחברות עובדים
- ✅ JWT tokens נשמרים ב-Zustand (in-memory)
- ✅ Protected routes עובדים
- ✅ Axios interceptors מוסיפים Authorization header
- ✅ יצירת moments עובדת
- ✅ מחיקת moments עובדת
- ✅ Toast notifications עובדים
- ✅ UI מגיב (Loading states)
- ✅ שגיאות מטופלות כראוי

**🎉 Full Stack Application מוכן!**

---

## Next Steps

עכשיו אפשר להוסיף:
1. **עריכת Moments** - לחיצה על moment לפתוח modal עריכה
2. **פילטרים** - סינון לפי רגש, חשיבות, תאריכים
3. **סטטיסטיקות** - דף stats עם גרפים
4. **Tags System** - הוספת תגיות
5. **Media Upload** - העלאת תמונות
6. **3D Timeline** - הוויזואליזציה בתלת-מימד (השלב המתקדם!)

---

## טיפים

### Hot Reload
כשאתה עורך קבצים ב-`client/src`, הדפדפן יתעדכן אוטומטית.

### Debugging
- Console errors: לחץ F12 → Console
- Network requests: F12 → Network
- React state: React DevTools extension

### Styling
- כל הסגנון הוא Tailwind CSS
- עריכת צבעים: `tailwind.config.js`
- עריכת גופנים: `index.css`

### עברית RTL
אם יש בעיות עם כיוון טקסט, הוסף ל-`index.html`:
```html
<html dir="rtl">
```
