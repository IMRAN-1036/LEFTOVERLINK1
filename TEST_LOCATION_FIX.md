# 🧪 Quick Test: Provider Location on Map

## Before You Start

- Make sure the server fix has been applied (check `/server/src/modules/food/food.service.js`)
- Close any running dev servers
- Clear browser cache (optional but recommended)

## Test Procedure (5 minutes)

### Terminal 1: Start Backend

```bash
cd /Users/shaikimran/Downloads/LeftOverLink/server
npm start
```

✅ Wait for: `Server running on http://localhost:5000`

### Terminal 2: Start Frontend

```bash
cd /Users/shaikimran/Downloads/LeftOverLink/client
npm run dev
```

✅ Wait for: `http://localhost:5173`

### Step 1: Provider Login

- Open `http://localhost:5173` in browser
- Login with provider credentials
- You should see the Provider Dashboard

### Step 2: Post Food

1. Click **"Start Sharing"** or navigate to "Share Food"
2. Fill the form:
   - **Food Type**: "Leftover Biryani" (or anything)
   - **Quantity**: 5
   - **Expiry**: 2 hours
3. **Click "Detect Location"** button
   - Wait for location popup
   - Confirm your detected location
4. **Submit the form**
   - Should see: ✅ "Food posted successfully!"

### Step 3: Switch to Receiver & View Map

1. **Logout** from provider account
2. **Login** with receiver account (create one if needed)
3. **Click "View Map"** button in navigation
4. **Check the map**:
   - ✅ Should show your location (red marker)
   - ✅ Should show provider marker (green/colored)
   - ✅ Should have a connecting line between them
   - ✅ Should show "1 providers" or count

### Step 4: Verify Marker Details

1. **Click on the provider marker** (the green/colored one, not red)
2. **Check the popup shows**:
   - ✅ Food type
   - ✅ Provider name
   - ✅ Quantity
   - ✅ Distance
   - ✅ Location address

## Success Indicators ✅

- [ ] Provider dashboard loads without errors
- [ ] Food posts successfully with location
- [ ] Map displays both receiver (red) and provider (colored) markers
- [ ] Markers are not at (0, 0) coordinates
- [ ] Clicking marker shows food details
- [ ] No console errors related to location

## Troubleshooting

### Map Shows "0 providers"

- Check browser console for errors (F12 → Console)
- Verify provider actually posted with location detection
- Try refreshing the page

### Markers Not Visible

- Zoom out on the map (scroll wheel)
- Check if markers are in the correct geographic region
- Verify location permissions were granted

### Location Says "Unknown"

- Check that the address autocomplete field was filled
- In PostFoodPage, the address should be auto-filled from autocomplete

### Still Not Working?

1. Clear browser localStorage:
   - Open DevTools (F12)
   - Go to Application → LocalStorage
   - Delete all entries
   - Refresh page
2. Check server logs for errors
3. Verify the fix was applied to `food.service.js`

## Expected Console Logs

You should see in browser console:

```
Auto-refetching receiver foods...
[Array of food items with valid lat/lng]
```

You should see in server logs:

```
Posting food with payload: {title: "...", location: {lat: ..., lng: ..., address: "..."}}
Food posted successfully: {_id: "...", location: {lat: ..., lng: ..., address: "..."}}
```

---

**If all checks pass ✅, the location fix is working correctly!**
