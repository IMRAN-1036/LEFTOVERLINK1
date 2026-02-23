# API & Data Structure Reference

## Food Location Data Structure

### Backend Response Example

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Vegetable Biryani",
  "description": "Fresh vegetable biryani with raita",
  "quantity": 20,
  "expiry": "2026-02-24T10:30:00Z",
  "status": "available",
  "provider": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Food Charity Org",
    "_id": "507f1f77bcf86cd799439012"
  },
  "location": {
    "lat": 17.385044,
    "lng": 78.486671,
    "address": "123 Main Street, Hyderabad, Telangana"
  },
  "imageUrl": "https://...",
  "views": 45,
  "interested": 3
}
```

### Frontend Transform (ReceiverDashboard)

```typescript
const transformedFoods = res.data.map((food: any) => ({
  id: food._id,
  providerId: food.provider?._id || food.provider,
  providerName: food.provider?.name || "Unknown Provider",
  providerRating: food.provider?.rating,
  foodType: food.title,
  isVeg: true,
  dietaryType: "mixed" as const,
  quantity: food.quantity,
  description: food.description,
  expiryTime: new Date(food.expiry),
  location: {
    lat: food.location?.lat || 0,
    lng: food.location?.lng || 0,
    address: food.location?.address || "Unknown Location",
  },
  status: food.status,
  imageUrl: food.imageUrl,
  distance: null,
  urgency: calculateUrgency(new Date(food.expiry)),
}));
```

### Validation Rules Applied

✅ `location.lat` must be a number and non-zero
✅ `location.lng` must be a number and non-zero
✅ Both coordinates must not be NaN
✅ Both coordinates must exist

---

## Pickup History Data Structure

### LocalStorage Format

```typescript
localStorage.getItem("pickupHistory")[
  // Returns:
  {
    id: "p-1708706400000",
    providerId: "provider-123",
    providerName: "John's Food Bank",
    receiverId: "receiver-456",
    receiverName: "Sarah",
    foodType: "Biryani",
    quantity: 10,
    status: "claimed",
    claimedAt: "2026-02-23T10:00:00Z",
    estimatedPickupTime: "2026-02-23T11:00:00Z",
    requestStatus: "pending", // "pending" | "accepted" | "declined"
    location: {
      lat: 17.385,
      lng: 78.487,
      address: "123 Main St",
    },
  }
];
```

### Request Tracking Logic

```typescript
const pendingRequests = allHistory.filter((order) => {
  const pid = String(order.providerId);
  const uid = String(user.id || user._id);
  const matchesProvider = pid === uid || order.providerName === user.name;
  return matchesProvider && order.requestStatus === "pending";
});

const count = pendingRequests.length;
```

---

## Location Detection Methods

### Method 1: Browser Geolocation (Auto-Detect)

```typescript
// From useLocation hook
const detectLocation = async (silent = false) => {
  // Uses browser's geolocation API
  // Returns: { lat, lng, address }
  // Converts to address using reverse geocoding
};
```

### Method 2: Manual Search (AddressAutocomplete)

```typescript
// From AddressAutocomplete component
const handleSelect = (location: LocationResult) => {
  setDetectedLocation({
    lat: location.lat,
    lng: location.lon, // Note: OSM returns 'lon' not 'lng'
    address: location.display_name,
  });
};
```

### Expected Coordinates (Examples)

- Hyderabad: `lat: 17.385044, lng: 78.486671`
- Mumbai: `lat: 19.075983, lng: 72.877655`
- Delhi: `lat: 28.704059, lng: 77.102493`
- Bangalore: `lat: 12.971599, lng: 77.594563`

---

## Error Handling

### Location Validation Errors

```typescript
// Error: Location coordinates missing
if (!address) {
  toast.error("Please provide a pickup location");
}

// Error: Invalid coordinates
if (
  !detectedLocation ||
  detectedLocation.lat === 0 ||
  detectedLocation.lng === 0
) {
  toast.error("Please detect your location or try again");
}

// Error: NaN coordinates
if (isNaN(detectedLocation.lat) || isNaN(detectedLocation.lng)) {
  toast.error("Invalid location coordinates");
}
```

### Request Count Errors

```typescript
// Error: Invalid pickupHistory format
try {
  const history = JSON.parse(localStorage.getItem("pickupHistory") || "[]");
  // Process...
} catch (err) {
  console.error("Failed to parse pickup history", err);
  // Fallback to empty array
}
```

---

## API Endpoints Used

### Food Management

- `GET /api/food` - List all food posts
- `POST /api/food` - Create new food post
- `DELETE /api/food/:id` - Remove food listing
- `PUT /api/food/claim/:id` - Claim/reserve food
- `POST /api/food/:id/view` - Increment view count

### Location Endpoints

- No dedicated location API
- Locations stored with food posts
- Uses browser geolocation API for detection

---

## Database Schema Reference

### Food Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  quantity: Number,
  expiry: Date,
  status: String, // "available" | "claimed" | "expired"
  provider: ObjectId, // Reference to User
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  imageUrl: String,
  views: Number,
  interested: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  role: String, // "provider" | "receiver"
  wallet: Number,
  totalEarnings: Number,
  totalMealsDonated: Number,
  rating: Number,
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  createdAt: Date
}
```

---

## LocalStorage Keys

| Key                       | Purpose              | Example                                  |
| ------------------------- | -------------------- | ---------------------------------------- |
| `user`                    | Current user data    | `{"id":"...","name":"...","role":"..."}` |
| `token`                   | Auth token           | `"eyJhbGc..."`                           |
| `pickupHistory`           | Food claims/requests | `[{...}, {...}]`                         |
| `removed_posts_${userId}` | Hidden expired posts | `["post-id-1","post-id-2"]`              |
| `refreshProviderListings` | Force refresh signal | Timestamp value                          |

---

## Environment Variables

Required in `.env` or `vite.config.ts`:

```env
VITE_API_URL=http://localhost:5001
```

---

## Testing Data

### Test User 1 (Provider)

```json
{
  "id": "provider-123",
  "name": "Fresh Food Org",
  "email": "provider@test.com",
  "role": "provider",
  "location": {
    "lat": 17.385,
    "lng": 78.487,
    "address": "Hyderabad, India"
  }
}
```

### Test User 2 (Receiver)

```json
{
  "id": "receiver-456",
  "name": "John Doe",
  "email": "receiver@test.com",
  "role": "receiver",
  "location": {
    "lat": 17.378,
    "lng": 78.491,
    "address": "Hyderabad, India"
  }
}
```

### Test Food Post

```json
{
  "title": "Vegetable Biryani",
  "description": "Fresh biryani made with organic vegetables",
  "quantity": 15,
  "expiry": "2026-02-24T10:00:00Z",
  "location": {
    "lat": 17.385044,
    "lng": 78.486671,
    "address": "123 Main Street, Hyderabad"
  }
}
```

---

## Debug Commands

### Check Location Data

```javascript
// Browser Console
localStorage.getItem("user"); // Check current user
localStorage.getItem("pickupHistory"); // Check requests
const foods = await fetch("/api/food").then((r) => r.json());
foods.forEach((f) =>
  console.log(`${f.title}: ${f.location.lat}, ${f.location.lng}`),
);
```

### Simulate Request

```javascript
const history = JSON.parse(localStorage.getItem("pickupHistory") || "[]");
history.push({
  id: "test-" + Date.now(),
  providerId: "provider-123",
  providerName: "Test Provider",
  requestStatus: "pending",
});
localStorage.setItem("pickupHistory", JSON.stringify(history));
window.location.reload();
```
