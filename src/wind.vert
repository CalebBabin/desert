vec4 vWorldPosition = modelMatrix * vec4(transformed.xyz, 1.0);
// color.y is green, helps target just the leaf, since I put the leaves and the tree in the same mesh and am too lazy to split it up now.
transformed.y += sin(vWorldPosition.x * 0.5 - u_time * 0.001) * (distance(vec2(0,0), vec2(position)) * 0.75) * 0.1;
transformed.x += cos(vWorldPosition.z * 0.5 - u_time * 0.001) * (distance(vec2(0,0), vec2(position)) * 0.75) * 0.1;
