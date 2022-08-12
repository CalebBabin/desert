import { AdditiveBlending, DoubleSide, DynamicDrawUsage, MeshBasicMaterial, Object3D } from "three";
import { Vector3 } from "three";
import { InstancedMesh, PlaneBufferGeometry } from "three";
import { Group } from "three";

const dummy = new Object3D();
function resetPosition(id) {
	positions[id].set((Math.random() - 0.5) * 600 * 11, 600 * 4 * Math.random(), -2000);
	//positions[id].set(Math.random() - 0.5, 10, -200);

	dummy.position.copy(positions[id]);
	dummy.updateMatrix();
	starInstance.setMatrixAt(id, dummy.matrix);
}

export function updateStars(delta) {
	const scalar = delta * 20;
	for (let index = 0; index < starCount; index++) {
		positions[index].set(positions[index].x + velocities[index].x * scalar, positions[index].y + velocities[index].y * scalar, positions[index].z + velocities[index].z * scalar);
		dummy.position.copy(positions[index]);
		dummy.updateMatrix();

		starInstance.setMatrixAt(index, dummy.matrix);
		if (Math.abs(positions[index].x) > 3000 || Math.abs(positions[index].y) > 3000 || positions[index].z > 10) {
			resetPosition(index);
		}
	}

	starInstance.instanceMatrix.needsUpdate = true;
}

const scene = new Group();
const starCount = 2048;

const velocities = new Array(starCount);
const positions = new Array(starCount);

let starInstance;
export default function createStars() {
	const starGeometry = new PlaneBufferGeometry(8, 8);
	const starMaterial = new MeshBasicMaterial({
		side: DoubleSide,
		fog: false,
		color: 0xffffff,
		transparent: true,
		opacity: 0.3,
		blending: AdditiveBlending,
	});
	//applyShader(starMaterial, 'star');
	starInstance = new InstancedMesh(starGeometry, starMaterial, starCount);
	starInstance.instanceMatrix.setUsage(DynamicDrawUsage);

	for (let index = 0; index < starCount; index++) {
		positions[index] = new Vector3();
		resetPosition(index);
		velocities[index] = new Vector3(Math.random() - 0.5, Math.random(), Math.random() * 0.5);
	}

	scene.add(starInstance);

	return scene;
}
