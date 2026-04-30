# Debugging Login Error

## Quick Diagnostic Steps

### 1. Check if Backend is Running

Open browser console and run:

```javascript
fetch("http://localhost:5000/api/health")
  .then((r) => r.json())
  .then((d) => console.log(d))
  .catch((e) => console.error("Backend not accessible:", e));
```

**Expected response:**

```json
{
  "status": "OK",
  "message": "Backend is running",
  "timestamp": "2026-04-30T..."
}
```

If you see "Backend not accessible" error:

- Backend is not running or not listening on port 5000
- Run: `npm start` in the backend folder

---

### 2. Check Environment Variables

**Backend** - `.env` file should have:

```
MONGO_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
PORT=5000
```

**Frontend** - Create `.env.local` with:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then restart frontend dev server if you created `.env.local`

---

### 3. Check Browser Console for Detailed Error

When login fails, check browser developer tools (F12 → Console) for messages like:

- `Logging in to: http://localhost:5000`
- `Response status: 400/500/404`
- Actual error message

---

### 4. Check Backend Logs

Terminal where backend is running should show:

```
[2026-04-30T...] POST /api/user/login
Login request received: { name: "...", age: 25, consent: true }
Audio record created: ObjectId(...)
```

If you see errors:

- **ECONNREFUSED**: MongoDB not running/accessible
- **ValidationError**: Missing fields from request
- **Unknown error**: Check MongoDB connection string

---

### 5. Verify MongoDB Connection

In terminal where backend is running, look for:

```
MongoDB connected
```

If NOT showing, MongoDB is not connected:

- Check `MONGO_URI` in `.env`
- Verify MongoDB cluster is accessible
- Try connecting directly: `mongosh "mongodb+srv://user:pass@cluster.mongodb.net/"`

---

### 6. Test Backend Directly with cURL

Open terminal and run:

```bash
curl -X POST http://localhost:5000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","age":25,"consent":true}'
```

**Expected response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "...",
    "name": "Test",
    "age": 25
  }
}
```

---

## Common Issues & Fixes

| Issue                                 | Cause                     | Fix                                     |
| ------------------------------------- | ------------------------- | --------------------------------------- |
| "Backend not accessible"              | Backend not running       | Run `npm start` in backend folder       |
| `status: 400` "Name, age... required" | Missing form fields       | Ensure all 3 fields filled in form      |
| `status: 500`                         | MongoDB connection failed | Check MONGO_URI and MongoDB cluster     |
| `status: 500`                         | Unexpected error          | Check backend console for error details |
| CORS error in browser                 | Frontend URL not allowed  | Already allowed with CORS middleware    |

---

## Full Diagnostic Script

Run this in browser console for complete info:

```javascript
async function diagnose() {
  console.log("=== DIAGNOSTICS ===");

  // 1. Check backend health
  try {
    const health = await fetch("http://localhost:5000/api/health").then((r) =>
      r.json(),
    );
    console.log("✓ Backend status:", health.status);
  } catch (e) {
    console.error("✗ Backend not accessible:", e.message);
    return;
  }

  // 2. Check API URL
  const apiUrl = "http://localhost:5000";
  console.log("API URL:", apiUrl);

  // 3. Try login
  try {
    const res = await fetch(`${apiUrl}/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", age: 25, consent: true }),
    });
    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Response data:", data);
  } catch (e) {
    console.error("Login error:", e.message);
  }
}

diagnose();
```

---

## Still Not Working?

1. **Check all console outputs**:
   - Browser console (F12)
   - Backend terminal/console
   - Check for error messages

2. **Verify connection string**:
   - Make sure whitelist IP address includes your machine in MongoDB Atlas

3. **Restart everything**:

   ```bash
   # Backend
   npm install
   npm start

   # Frontend (new terminal)
   npm run dev
   ```

4. **Check network tab in DevTools**:
   - F12 → Network tab → Try login
   - Click the `/api/user/login` request
   - Check Request payload and Response
