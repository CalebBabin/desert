vec4 vWorldPosition = modelMatrix * vec4(transformed.xyz, 1.0);
transformed.y += snoise(vec3(vWorldPosition.x * 0.3, 10.0, vWorldPosition.z * 0.2)) * 0.2;
transformed.y += snoise(vec3(vWorldPosition.x * 0.02, 75.2, vWorldPosition.z * 0.03)) * 3.0;
transformed.x += snoise(vec3(vWorldPosition.x * 0.03, 0.0, vWorldPosition.z * 0.03));