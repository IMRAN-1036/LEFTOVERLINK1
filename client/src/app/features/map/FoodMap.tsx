import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { FoodPost } from "../../types";

type FoodWithDistance = FoodPost & { distance: number | null };

type FoodMapProps = {
  centerLat: number | null | undefined;
  centerLng: number | null | undefined;
  posts: FoodWithDistance[];
  onSelectPost?: (post: FoodWithDistance) => void;
};

export function FoodMap({ centerLat, centerLng, posts, onSelectPost }: FoodMapProps) {
  if (!posts.length) return null;

  const hasCenter = typeof centerLat === "number" && typeof centerLng === "number";
  const center: LatLngExpression = hasCenter
    ? [centerLat as number, centerLng as number]
    : [posts[0].location.lat, posts[0].location.lng];

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-green-100 dark:border-green-900/40 mb-4">
      <MapContainer center={center} zoom={13} style={{ width: "100%", height: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {posts.map((post) => {
          const coords: LatLngExpression = [post.location.lat, post.location.lng];
          return (
            <Marker
              key={post.id}
              position={coords}
              eventHandlers={{
                click: () => onSelectPost?.(post),
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-bold">{post.foodType}</div>
                  <div className="text-xs text-muted-foreground">{post.providerName}</div>
                  {post.distance != null && (
                    <div className="text-xs">
                      {(post.distance || 0).toFixed(1)} km away
                    </div>
                  )}
                  <div className="text-xs mt-1">{post.location.address}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

