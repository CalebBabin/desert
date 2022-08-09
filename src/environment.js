
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { applyShader } from './utils';
import { Color, DoubleSide, Group, InstancedMesh, Mesh, MeshPhongMaterial, MeshStandardMaterial, NearestFilter, Object3D, PlaneBufferGeometry, RepeatWrapping, TextureLoader, Vector3 } from 'three';
const modelLoader = new GLTFLoader();

export const environment = new Group();

// sand color is #ffdcb0
import sandTextureURL from './desert.png';
const sandTexture = new TextureLoader().load(sandTextureURL);
sandTexture.repeat.setScalar(60);
sandTexture.wrapS = RepeatWrapping;
sandTexture.wrapT = RepeatWrapping;
sandTexture.minFilter = NearestFilter;
sandTexture.magFilter = NearestFilter;
const sand = new Mesh(
	new PlaneBufferGeometry(160, 80, Math.round(160 * 0.8), Math.round(80 * 0.8)),
	new MeshStandardMaterial({
		color: new Color('#ffffff'),
		metalness: 0.2,
		roughness: 1,
		map: sandTexture,
		flatShading: true,
	})
);
applyShader(sand.material);
sand.geometry.rotateX(-Math.PI / 2);
environment.add(sand);


const trunkMaterial = new MeshPhongMaterial({
	color: '#D39A54',
	flatShading: true,
	shininess: 0,
})
applyShader(trunkMaterial, 'trunk');
const leafMaterial = new MeshPhongMaterial({
	color: '#A9FF93',
	flatShading: true,
	side: DoubleSide,
	vertexColors: true,
	shininess: 0,
})
applyShader(leafMaterial, 'wind');

modelLoader.load('/tree1.glb', function (gltf) {
	const trunk = gltf.scene.getObjectByName('Trunk');
	trunk.material = trunkMaterial;
	const leaves = gltf.scene.getObjectByName('Leaves');
	leaves.material = leafMaterial;

	/*let max = 0;
	for (let index = 0; index < trunk.geometry.attributes.position.count; index += trunk.geometry.attributes.position.itemSize) {
		max = Math.max(trunk.geometry.attributes.position.array[index + 2], trunk.geometry.attributes.position.array[index + 1], trunk.geometry.attributes.position.array[index], max);
	}
	console.log(max);*/

	const trunkInstance = new InstancedMesh(trunk.geometry, trunk.material, 32);
	const leavesInstance = new InstancedMesh(leaves.geometry, leaves.material, 32);
	const dummy = new Object3D();
	dummy.rotation.order = 'ZXY';
	let treeInstances = 0;

	const spawnTree = (position, rotation, height = 1) => {
		dummy.position.set(position.x, position.y, position.z);
		dummy.rotation.set(rotation.x, rotation.y, rotation.z);
		dummy.scale.setScalar(2.5 * height);
		dummy.rotation.y = Math.random() * Math.PI * 2;
		dummy.updateMatrixWorld();
		trunkInstance.setMatrixAt(treeInstances++, dummy.matrix);
		leavesInstance.setMatrixAt(treeInstances++, dummy.matrix);

		trunkInstance.instanceMatrix.needsUpdate = true;
		leavesInstance.instanceMatrix.needsUpdate = true;
	}

	spawnTree(new Vector3(23, -1, -1), new Vector3(0.2, 0, 0.2));
	spawnTree(new Vector3(-15, 0, 0), new Vector3(0.1, 0, -0.1));
	spawnTree(new Vector3(0, -2, -20), new Vector3(0, 0, -0.05));

	spawnTree(new Vector3(20, 0, -35), new Vector3(0.2, 0, 0.1));
	spawnTree(new Vector3(40, 0, -25), new Vector3(0, 0, 0.1));
	spawnTree(new Vector3(-50, 0, -30), new Vector3(0.1, 0, 0));


	environment.add(trunkInstance);
	environment.add(leavesInstance);

});

modelLoader.load('/plant.glb', function (gltf) {
	const plant = gltf.scene.getObjectByName('Leaves');
	plant.material = leafMaterial;

	const plantInstance = new InstancedMesh(plant.geometry, plant.material, 32);
	const dummy = new Object3D();
	dummy.rotation.order = 'ZYX';
	let plantInstances = 0;

	const position = new Vector3();
	const spawnPlant = (zRotation, height = 1) => {
		dummy.rotation.x = 0.1;
		dummy.rotation.z = zRotation;
		dummy.rotation.y = Math.random() * Math.PI * 2;
		dummy.scale.setScalar(height);
		dummy.updateMatrixWorld();
		plantInstance.setMatrixAt(plantInstances++, dummy.matrix);
		plantInstance.instanceMatrix.needsUpdate = true;
	}

	dummy.position.set(-5, 0.6, 10);
	spawnPlant(-0.05, 0.5);

	dummy.position.set(6, -0.05, 2);
	spawnPlant(0., 1);

	dummy.position.set(20, 0.7, -8);
	spawnPlant(0.15, 1);

	dummy.position.set(-18.5, 0.5, -8);
	spawnPlant(-0.15, 1);

	dummy.position.set(-20, -0.05, 2);
	spawnPlant(0, 0.5);

	dummy.position.set(15, 1.6, -16);
	spawnPlant(-0.1, 1);

	dummy.position.set(10, 1, -30);
	spawnPlant(0.3, 1);

	dummy.position.set(-5, 0.5, 15);
	spawnPlant(0.08, 0.5);
	dummy.position.set(5, 0.20, 15);
	spawnPlant(-0.08, 0.5);

	environment.add(plantInstance);
});