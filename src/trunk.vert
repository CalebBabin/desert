vec4 vWorldPosition = instanceMatrix * vec4(transformed.xyz, 1.0) * modelMatrix;
float invertedPowY = (1.0 - pow(1.0 - (position.y / 3.519505500793457), 2.0));

//transformed.x += sin(transformed.z * 1.0 + position.y * 0.5) * (invertedPowY);
//transformed.z += cos(transformed.x * 1.0 + position.y * 0.5) * (invertedPowY);