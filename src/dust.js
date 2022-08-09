import { BufferGeometry, Color, Float32BufferAttribute, Points, PointsMaterial } from "three";

const particles = 32000;

const geometry = new BufferGeometry();

const positions = [];
const colors = [];

const color = new Color();

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

	const shade = Math.random() * 0.5;
	color.setRGB(shade, shade, shade);
	colors.push(color.r, color.g, color.b);

}

geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

geometry.computeBoundingSphere();

//

const material = new PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.75 });

const points = new Points(geometry, material);

points.position.z += minDistance - 3;

export default points;
