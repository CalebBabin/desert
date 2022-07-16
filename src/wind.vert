vec4 vWorldPosition =  modelMatrix * instanceMatrix * vec4(transformed.xyz, 1.0);
// color.y is green, helps target just the leaf, since I put the leaves and the tree in the same mesh and am too lazy to split it up now.
transformed.y += sin(vWorldPosition.x * 2.0 - u_time * 0.001) * 0.05;
transformed.y += cos(vWorldPosition.z * 2.0 - u_time * 0.0015) * 0.05;
