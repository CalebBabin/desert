float amount = sin((vWorldPosition.z + vWorldPosition.x) * 2.0) * 0.5 * position.x;
//transformed.x += amount * 0.25;
transformed.y += max(0.0, amount);
transformed.z += amount;