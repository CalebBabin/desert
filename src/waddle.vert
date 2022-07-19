float waddleflip = (position.x > 0.0 ? 1.0 : -1.0);

vec3 waddleNormal = normalize(transformedNormal);
float progress = (vWorldPosition.z * waddleNormal.z + vWorldPosition.x * waddleNormal.x) * 2.5;

float distanceIntensity = max(0.25, min(1.0, 1.0 - vWorldPosition.z / 30.0)); // fade out motion by 30.0

transformed.y += max(0.0, sin(progress) * 0.35 * waddleflip) * distanceIntensity;
transformed.z += sin(progress) * 0.35 * waddleflip * distanceIntensity;