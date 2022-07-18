import * as THREE from "three";

const particles = 10000;

const geometry = new THREE.BufferGeometry();

const positions = [];
const colors = [];

const color = new THREE.Color();

const minDistance = 90;
const maxDistance = minDistance + 25;
const maxHeight = 100;

for (let i = 0; i < particles; i++) {

	// positions
	const direction = Math.random() * Math.PI * 2;
	const distance = Math.random() * (maxDistance - minDistance) + minDistance;
	const x = Math.sin(direction) * distance;
	const z = Math.cos(direction) * distance;
	const y = Math.random() * maxHeight;

	positions.push(x, y, z);

	const shade = Math.random();
	color.setRGB(shade, shade, shade);
	colors.push(color.r, color.g, color.b);

}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

geometry.computeBoundingSphere();

//

const material = new THREE.PointsMaterial({ size: 0.07, vertexColors: true });

const points = new THREE.Points(geometry, material);

points.position.z += minDistance - 3;

export default points;
