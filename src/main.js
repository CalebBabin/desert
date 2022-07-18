import TwitchChat from "twitch-chat-emotes-threejs";
import * as THREE from "three";
import Stats from "stats-js";
import "./main.css";
import { applyShader } from './utils';


/*
** connect to twitch chat
*/

// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});

if (query_vars.channels || query_vars.channel) {
	const temp = query_vars.channels || query_vars.channel;
	channels = temp.split(',');
}

let stats = false;
if (query_vars.stats) {
	stats = new Stats();
	stats.showPanel(1);
	document.body.appendChild(stats.dom);
}

let sunset = false;
if (query_vars.sunset) {
	sunset = query_vars.sunset.toLowerCase() === 'true';
}

const waddleBlacklist = {
	'moon2WALK': true,
	'Glizzy': true,
	'AAUGH': true,
	'TWERKERS': true,
	'BALDSPIN': true,
	'borpaSpin': true,
	'CUMDETECTED': true,
	'DDoomer': true,
	'doctorPls': true,
	'furryRun': true,
	'FLAPPERS': true,
	'gachiROLL': true,
	'gachiBASS': true,
	'HYPERNODDERS': true,
	'HYPERNOPERS': true,
	'HYPERRACC': true,
	'Kissapregomie': true,
	'Kissabrother': true,
	'Kissahomie': true,
	'peepoNaruSprint': true,
	'peepoBOOM': true,
	'PepeSpin': true,
	'pepeRun': true,
	'PianoTime': true,
	'TeaTime': true,
	'TeaTime2': true,
	'RapThis': true,
	'Slap': true,
	'POOTERS': true,
	'VIBERS': true,
	'OMEGALAUGHING': true,
};

const ChatInstance = new TwitchChat({
	THREE,

	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.MeshLambertMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
		side: THREE.DoubleSide,
	},

	materialHook: (material, name) => {
		material.emissiveMap = material.map;
		material.emissive = new THREE.Color(sunset ? '#AAAAAA' : '#777777');
		applyShader(material, waddleBlacklist.hasOwnProperty(name) ? 'sand' : 'waddle');
	},

	channels,
	maximumEmoteLimit: 3,
	duplicateEmoteLimit: 0,
	maximumEmoteLimit_pleb: 1,
	duplicateEmoteLimit_pleb: 0,
})

/*
** Initiate ThreeJS
*/

const camera = new THREE.PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	0.1,
	3000
);
camera.position.z = 20;
camera.position.y = 2;
camera.rotation.x = Math.PI / 12;


const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', () => {
	resize();
	window.addEventListener('resize', resize);
	if (stats) document.body.appendChild(stats.dom);
	document.body.appendChild(renderer.domElement);
	draw();
})


/*
** Handle Twitch Chat Emotes
*/
const sceneEmoteArray = [];
const emoteGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
ChatInstance.listen((emotes) => {
	const group = new THREE.Group();
	group.timestamp = Date.now();
	group.position.set(
		((Math.pow(Math.random(), 2)) * (Math.random() > 0.5 ? 1 : -1))
		* 8 - 15,
		0,
		-15
	)

	let i = 0;
	emotes.forEach((emote) => {
		const plane = new THREE.Mesh(emoteGeometry, emote.material);
		plane.position.x = i;
		plane.position.y = 0.5;
		group.add(plane);
		i++;
	})

	// Set velocity to a random normalized value
	group.velocity = new THREE.Vector3(
		1.25,
		0,
		1.75
	);
	//group.velocity.normalize();

	group.rotation.y = Math.atan2(group.velocity.x, group.velocity.z);

	scene.add(group);
	sceneEmoteArray.push(group);
});


/*
	Scene setup
*/
import skyTextureURL from './sky.png';
import skySunsetTextureURL from './skySunset.png';
const skyTexture = new THREE.TextureLoader().load(sunset ? skySunsetTextureURL : skyTextureURL);
scene.fog = new THREE.Fog(new THREE.Color('#ffdcb0'), 0, 65);

const sky = new THREE.Mesh(new THREE.SphereBufferGeometry(2000, 16, 8), new THREE.MeshBasicMaterial({
	map: skyTexture,
	side: THREE.BackSide,
	fog: false,
}));
scene.add(sky);

import sunTextureURL from './sun.png';
const sunTexture = new THREE.TextureLoader().load(sunTextureURL);
const sun = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 1, 1), new THREE.MeshBasicMaterial({
	map: sunTexture,
	transparent: true,
	blending: THREE.AdditiveBlending,
	opacity: 0.21,
}));
scene.add(sun);
sun.scale.setScalar(150);
if (sunset) {
	sun.position.set(80, 30, -100);
} else {
	sun.position.set(0.5, 1, 0.2).multiplyScalar(100);
}
sun.lookAt(camera.position);

const ambientLight = new THREE.AmbientLight(new THREE.Color(sunset ? '#d79865' : '#FFFFFF'), sunset ? 0.25 : 0.36);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(new THREE.Color(sunset ? '#ffe1b8' : '#FFFFFF'), sunset ? 1.25 : 0.75);
scene.add(sunLight);
sunLight.position.copy(sun.position);
if (sunset) sunLight.position.y *= 1.5;

// sand color is #ffdcb0
import sandTextureURL from './desert.png';
const sandTexture = new TextureLoader().load(sandTextureURL);
sandTexture.repeat.setScalar(60);
sandTexture.wrapS = THREE.RepeatWrapping;
sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.minFilter = THREE.NearestFilter;
sandTexture.magFilter = THREE.NearestFilter;
const sand = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(160, 80, Math.round(160 * 1.5), Math.round(80 * 1.5)),
	new THREE.MeshStandardMaterial({
		color: new THREE.Color('#ffffff'),
		metalness: 0.2,
		roughness: 1,
		map: sandTexture,
		flatShading: true,
	})
);
applyShader(sand.material);
sand.geometry.rotateX(-Math.PI / 2);
scene.add(sand);


import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from "three";
const modelLoader = new GLTFLoader();


const trunkMaterial = new THREE.MeshPhongMaterial({
	color: '#D39A54',
	flatShading: true,
	shininess: 0,
})
applyShader(trunkMaterial, 'trunk');
const leafMaterial = new THREE.MeshPhongMaterial({
	color: '#A9FF93',
	flatShading: true,
	side: THREE.DoubleSide,
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

	const trunkInstance = new THREE.InstancedMesh(trunk.geometry, trunk.material, 32);
	const leavesInstance = new THREE.InstancedMesh(leaves.geometry, leaves.material, 32);
	const dummy = new THREE.Object3D();
	let treeInstances = 0;

	const spawnTree = (position, height = 1) => {
		dummy.position.set(position.x, position.y, position.z);
		dummy.scale.setScalar(2.5 * height);
		dummy.rotation.y = Math.random() * Math.PI * 2;
		dummy.updateMatrixWorld();
		trunkInstance.setMatrixAt(treeInstances++, dummy.matrix);
		leavesInstance.setMatrixAt(treeInstances++, dummy.matrix);

		trunkInstance.instanceMatrix.needsUpdate = true;
		leavesInstance.instanceMatrix.needsUpdate = true;
	}

	spawnTree(new THREE.Vector3(23, -1, -1));
	spawnTree(new THREE.Vector3(-15, 0, 0));
	spawnTree(new THREE.Vector3(0, -2, -20));

	spawnTree(new THREE.Vector3(20, 0, -35));
	spawnTree(new THREE.Vector3(40, 0, -25));
	spawnTree(new THREE.Vector3(-50, 0, -30));


	scene.add(trunkInstance);
	scene.add(leavesInstance);

});

modelLoader.load('/plant.glb', function (gltf) {
	const plant = gltf.scene.getObjectByName('Leaves');
	plant.material = leafMaterial;

	const plantInstance = new THREE.InstancedMesh(plant.geometry, plant.material, 32);
	const dummy = new THREE.Object3D();
	let plantInstances = 0;

	const position = new THREE.Vector3();
	const spawnPlant = (zRotation, height = 1) => {
		dummy.rotation.x = 0.1;
		dummy.rotation.z = zRotation;
		dummy.rotation.y = Math.random() * Math.PI * 2;
		dummy.scale.setScalar(height);
		dummy.updateMatrixWorld();
		plantInstance.setMatrixAt(plantInstances++, dummy.matrix);
		plantInstance.instanceMatrix.needsUpdate = true;
	}

	dummy.position.set(-5, -0, 10);
	spawnPlant(0, 0.5);

	dummy.position.set(6, -2.1, 2);
	spawnPlant(-0.1, 1);

	dummy.position.set(20, -0.4, -8);
	spawnPlant(-0.5, 1);

	dummy.position.set(-18.5, 1.25, -8);
	spawnPlant(-0.2, 1);

	dummy.position.set(-20, 1.4, 2);
	spawnPlant(0, 0.5);

	dummy.position.set(15, -2, -20);
	spawnPlant(-0.5, 1);

	dummy.position.set(10, 1, -30);
	spawnPlant(-0.5, 1);

	scene.add(plantInstance);

});

/*import { cloudGroup } from './clouds';
scene.add(cloudGroup);*/


import points from './dust.js';
scene.add(points);
points.position.z += camera.position.z;

/*
** Draw loop
*/
let lastFrame = performance.now();
function draw() {
	if (stats) stats.begin();
	requestAnimationFrame(draw);
	const delta = Math.min(1, Math.max(0, (performance.now() - lastFrame) / 1000));
	lastFrame = performance.now();

	points.rotation.y -= delta * 0.125;

	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		element.position.addScaledVector(element.velocity, delta);
		if (element.position.z >= camera.position.z) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			//element.update();
		}
	}

	// cloudGroup.tick(delta);

	renderer.render(scene, camera);
	if (stats) stats.end();
};