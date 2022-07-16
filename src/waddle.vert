float amount = (sin(vWorldPosition.z * 3.5) + 1.0) * 0.3 * position.x;
transformed.x += amount * 0.25;
transformed.y += amount;
transformed.z += amount * 2.0;