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

const ChatInstance = new TwitchChat({
	THREE,

	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.MeshBasicMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
	},

	materialHook: (material) => {
		applyShader(material);
	},

	channels,
	maximumEmoteLimit: 4,
	duplicateEmoteLimit: 1,
	maximumEmoteLimit_pleb: 3,
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
	group.position.set((Math.random() * 2 - 1) * 2 - 10, 0, -10)

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
		1,
		0,
		1.75
	);
	//group.velocity.normalize();

	group.lifespan = 17500;

	scene.add(group);
	sceneEmoteArray.push(group);
});


/*
	Scene setup
*/
const ambientLight = new THREE.AmbientLight(new THREE.Color('#FFFFFF'), 0.36);
const sunLight = new THREE.DirectionalLight(new THREE.Color('#FFFFFF'), 0.75);
sunLight.position.set(0.1, 1, -0.25);
scene.add(ambientLight);
scene.add(sunLight);

import skyTextureURL from './sky.png';
const skyTexture = new THREE.TextureLoader().load(skyTextureURL);
scene.fog = new THREE.Fog(new THREE.Color('#ffdcb0'), 0, 65);

const sky = new THREE.Mesh(new THREE.SphereBufferGeometry(2000, 16, 8), new THREE.MeshBasicMaterial({
	map: skyTexture,
	side: THREE.BackSide,
	fog: false,
}));
scene.add(sky);

// sand color is #ffdcb0
import sandTextureURL from './desert.png';
const sandTexture = new TextureLoader().load(sandTextureURL);
sandTexture.repeat.setScalar(60);
sandTexture.wrapS = THREE.RepeatWrapping;
sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.minFilter = THREE.NearestFilter;
sandTexture.magFilter = THREE.NearestFilter;
const sand = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(160, 60, Math.round(160 * 1.5), Math.round(60 * 1.5)),
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
	color: '#B57B34',
	flatShading: true,
})
const leafMaterial = new THREE.MeshPhongMaterial({
	color: '#A9FF93',
	flatShading: true,
})
applyShader(leafMaterial, 'wind');

modelLoader.load('/tree.glb', function (gltf) {
	scene.add(gltf.scene);
	gltf.scene.rotation.y = -0.5;
	gltf.scene.position.z = -10;
	gltf.scene.scale.setScalar(2.5);
	gltf.scene.position.set(16.875 * camera.aspect, 0, -20);
	const trunk = gltf.scene.getObjectByName('Trunk');
	trunk.material = trunkMaterial;
	const leaves = gltf.scene.getObjectByName('Leaves');
	leaves.material = leafMaterial;
});

/*import { cloudGroup } from './clouds';
scene.add(cloudGroup);*/


/*
** Draw loop
*/
let lastFrame = performance.now();
function draw() {
	if (stats) stats.begin();
	requestAnimationFrame(draw);
	const delta = Math.min(1, Math.max(0, (performance.now() - lastFrame) / 1000));
	lastFrame = performance.now();


	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		element.position.addScaledVector(element.velocity, delta);
		if (element.timestamp + element.lifespan < Date.now()) {
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