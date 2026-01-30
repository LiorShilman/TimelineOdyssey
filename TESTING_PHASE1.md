# Testing Phase 1: Authentication System

## הכנה לבדיקה

### 1. הפעלת Docker Services
```bash
npm run docker:up
```
ודא ש-PostgreSQL, Redis ו-MinIO רצים:
```bash
docker-compose ps
```

### 2. הרצת Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. הפעלת השרת
```bash
npm run dev:server
```

אמור לראות:
```
✅ Database connected successfully
🚀 Server running on http://localhost:3001
📊 Environment: development
```

---

## בדיקות API

### 1. בדיקת Health Check
```bash
curl http://localhost:3001/api/health
```

תוצאה צפויה:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "environment": "development"
}
```

### 2. הרשמת משתמש חדש
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

תוצאה צפויה (201):
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "avatarUrl": null,
      "emailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. ניסיון הרשמה עם אותו אימייל (אמור להיכשל)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

תוצאה צפויה (409):
```json
{
  "error": "Conflict",
  "message": "User with this email already exists"
}
```

### 4. התחברות
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

תוצאה צפויה (200):
```json
{
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**שמור את ה-accessToken לבדיקות הבאות!**

### 5. קבלת פרטי משתמש (עם אימות)
```bash
# החלף YOUR_ACCESS_TOKEN עם ה-token שקיבלת
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

תוצאה צפויה (200):
```json
{
  "data": {
    "id": "uuid...",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "avatarUrl": null,
    "emailVerified": false,
    "isActive": true,
    "createdAt": "2024-...",
    "updatedAt": "2024-..."
  }
}
```

### 6. ניסיון גישה ללא אימות (אמור להיכשל)
```bash
curl -X GET http://localhost:3001/api/users/me
```

תוצאה צפויה (401):
```json
{
  "error": "Authentication Error",
  "message": "No authorization token provided"
}
```

### 7. עדכון פרטי משתמש
```bash
curl -X PUT http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name"
  }'
```

תוצאה צפויה (200):
```json
{
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid...",
    "email": "test@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    ...
  }
}
```

### 8. Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

תוצאה צפויה (200):
```json
{
  "message": "Logout successful"
}
```

### 9. בדיקת Refresh Token
```bash
# החלף YOUR_REFRESH_TOKEN עם ה-refresh token שקיבלת
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

תוצאה צפויה (200):
```json
{
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_token..."
  }
}
```

---

## בדיקות שגיאות

### 1. סיסמה חלשה
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@example.com",
    "password": "123"
  }'
```

תוצאה צפויה (400):
```json
{
  "error": "Validation Error",
  "message": "Password must be at least 8 characters long, ..."
}
```

### 2. אימייל לא תקין
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "Test1234"
  }'
```

תוצאה צפויה (400):
```json
{
  "error": "Validation Error",
  "message": "Invalid email format"
}
```

### 3. התחברות עם סיסמה שגויה
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123"
  }'
```

תוצאה צפויה (401):
```json
{
  "error": "Authentication Error",
  "message": "Invalid email or password"
}
```

---

## בדיקה עם Prisma Studio

פתח את Prisma Studio כדי לראות את המשתמשים במסד הנתונים:

```bash
npm run prisma:studio
```

פתח: http://localhost:5555

צפוי לראות:
- טבלת **User** עם המשתמש שנרשם
- הסיסמה מוצפנת (hash)
- שדות emailVerified=false, isActive=true

---

## בדיקת Rate Limiting

נסה לשלוח 6 בקשות הרשמה תוך 15 דקות:

```bash
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user$i@example.com\",\"password\":\"Test1234\"}"
  echo "\n"
done
```

הבקשה ה-6 אמורה להחזיר (429):
```json
{
  "error": "Too Many Requests",
  "message": "Too many authentication attempts, please try again later"
}
```

---

## ✅ סיכום הבדיקות

אם כל הבדיקות עברו בהצלחה, אז:

- ✅ Server רץ ומחובר למסד נתונים
- ✅ הרשמה עובדת עם בדיקת תקינות
- ✅ התחברות מחזירה JWT tokens
- ✅ אימות JWT עובד על routes מוגנים
- ✅ עדכון פרופיל עובד
- ✅ Rate limiting עובד
- ✅ טיפול בשגיאות עובד כראוי

**המערכת מוכנה להמשך פיתוח!** 🎉

---

## בעיות נפוצות

### Docker לא עובד
```bash
docker-compose down
docker-compose up -d
```

### Database connection failed
בדוק שה-PostgreSQL רץ:
```bash
docker-compose logs postgres
```

### TypeScript errors
```bash
cd server
npm install @types/node --save-dev
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```
