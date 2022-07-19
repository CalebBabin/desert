vec4 vWorldPosition = modelMatrix * vec4(transformed.xyz, 1.0);

transformed.y += snoise(vec3(vWorldPosition.x * 0.3, 10.0, vWorldPosition.z * 0.3)) * 0.05;

vec2 cellularNoiseResult = cellular(vec2(vWorldPosition.x * 0.075 + 0.5, vWorldPosition.z * 0.075 + 0.42));

transformed.y += pow(cellularNoiseResult.y * cellularNoiseResult.x, 1.5) * 3.0;

//transformed.x += snoise(vec3(vWorldPosition.x * 0.01, 0.0, vWorldPosition.z * 0.01));