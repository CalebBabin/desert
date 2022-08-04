import TwitchChat from "twitch-chat-emotes-threejs";
import * as THREE from "three";
import Stats from "stats-js";
import "./main.css";
import { applyShader } from "./utils";

/*
 ** connect to twitch chat
 */

// a default array of twitch channels to join
let channels = ["moonmoon"];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});

if (query_vars.channels || query_vars.channel) {
	const temp = query_vars.channels || query_vars.channel;
	channels = temp.split(",");
}

let stats = false;
if (query_vars.stats) {
	stats = new Stats();
	stats.showPanel(1);
	document.body.appendChild(stats.dom);
}

let sunset = false;
let night = false;
if (query_vars.sunset) {
	sunset = query_vars.sunset.toLowerCase() === "true";
}
if (query_vars.night) {
	night = query_vars.night.toLowerCase() === "true";
}

const waddleBlacklist = {
	moon2WALK: true,
	Glizzy: true,
	AAUGH: true,
	TWERKERS: true,
	BALDSPIN: true,
	borpaSpin: true,
	CUMDETECTED: true,
	DDoomer: true,
	doctorPls: true,
	furryRun: true,
	FLAPPERS: true,
	gachiROLL: true,
	gachiBASS: true,
	HYPERNODDERS: true,
	HYPERNOPERS: true,
	HYPERRACC: true,
	Kissapregomie: true,
	Kissabrother: true,
	Kissahomie: true,
	peepoNaruSprint: true,
	peepoBOOM: true,
	PepeSpin: true,
	pepeRun: true,
	PianoTime: true,
	TeaTime: true,
	TeaTime2: true,
	RapThis: true,
	Slap: true,
	POOTERS: true,
	VIBERS: true,
	OMEGALAUGHING: true,
};

const ChatInstance = new TwitchChat({
	THREE,

	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.MeshLambertMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
		//side: THREE.DoubleSide,
	},

	materialHook: (material, name) => {
		material.emissiveMap = material.map;
		material.emissive = new THREE.Color(sunset ? "#AAAAAA" : "#777777");
		applyShader(material, waddleBlacklist.hasOwnProperty(name) ? "sand" : "waddle");
	},

	channels,
	maximumEmoteLimit: 3,
	duplicateEmoteLimit: 0,
	maximumEmoteLimit_pleb: 1,
	duplicateEmoteLimit_pleb: 0,
});

/*
 ** Initiate ThreeJS
 */

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 3000);
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

window.addEventListener("DOMContentLoaded", () => {
	resize();
	window.addEventListener("resize", resize);
	if (stats) document.body.appendChild(stats.dom);
	document.body.appendChild(renderer.domElement);
	draw();
});

/*
 ** Handle Twitch Chat Emotes
 */
const sceneEmoteArray = [];
const emoteGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
ChatInstance.listen((emotes) => {
	const group = new THREE.Group();
	group.timestamp = Date.now();
	const rand = Math.random();
	if (rand < 0.075 && emotes.length === 1) {
		group.position.set(-1, 0.7, 18 * (Math.random() * 2 - 1));
		group.position.x *= window.innerWidth / window.innerHeight;
		group.position.x *= group.position.z + 18;

		group.finalDestination = -group.position.x;

		// Set velocity to a random normalized value
		group.velocity = new THREE.Vector3(0, 0, 1);
		group.rolling = true;
	} else {
		const position = Math.pow(Math.random(), 2) * (Math.random() > 0.5 ? 1 : -1);
		group.position.set(
			position * 8 - 10,
			-1, // rise up from the ground for a cleaner transition in
			-position - 6
		);
		// Set velocity to a random normalized value
		group.velocity = new THREE.Vector3(1.5, 0, 1.65);
	}

	let i = 0;
	emotes.forEach((emote) => {
		const plane = new THREE.Mesh(emoteGeometry, emote.material);
		plane.position.x = i;
		plane.position.y = 0.425;
		if (group.rolling) plane.position.y = -0.2;
		group.add(plane);
		i++;
	});

	group.rotation.y = Math.atan2(group.velocity.x, group.velocity.z);
	if (!group.rolling) {
		group.rotation.y -= 0.5;
	}
	group.originalRotation = new THREE.Vector3().copy(group.rotation);

	scene.add(group);
	sceneEmoteArray.push(group);
});

/*
	Scene setup
*/
import skyTextureURL from "./sky.png";
import skySunsetTextureURL from "./skySunset.png";
import skyNightTextureURL from "./skyNight.png";
let definitiveSkyURL = skyTextureURL;
if (sunset) definitiveSkyURL = skySunsetTextureURL;
if (night) definitiveSkyURL = skyNightTextureURL;

const skyTexture = new THREE.TextureLoader().load(definitiveSkyURL);
if (night) {
	scene.fog = new THREE.Fog(new THREE.Color("#8A4C74"), 0, 80);
} else {
	scene.fog = new THREE.Fog(new THREE.Color("#ffdcb0"), 0, 65);
}

const sky = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(800 * 10, 600 * 10),
	new THREE.MeshBasicMaterial({
		map: skyTexture,
		fog: false,
	})
);
sky.material.map.magFilter = THREE.NearestFilter;
sky.position.z = -2000;
scene.add(sky);

import sunTextureURL from "./sun.png";
import moonTextureURL from "./moon.jpg";
let sun;

if (!night) {
	const sunTexture = new THREE.TextureLoader().load(sunTextureURL);
	sun = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(1, 1, 1, 1),
		new THREE.MeshBasicMaterial({
			map: sunTexture,
			transparent: true,
			blending: THREE.AdditiveBlending,
			opacity: 0.21,
		})
	);
} else {
	const moonTexture = new THREE.TextureLoader().load(moonTextureURL);
	sun = new THREE.Mesh(
		new THREE.SphereBufferGeometry(0.5),
		new THREE.MeshBasicMaterial({
			map: moonTexture,
			color: 0xf5d6ff,
			fog: false,
		})
	);
	sun.material.map.magFilter = THREE.NearestFilter;
	sun.material.map.minFilter = THREE.NearestFilter;
}
scene.add(sun);
sun.scale.setScalar(150);
if (night) {
	sun.position.set(-100, 0, -250);
} else if (sunset) {
	sun.position.set(80, 30, -100);
} else {
	sun.position.set(0.5, 1, 0.2).multiplyScalar(100);
}
if (night) sun.rotation.y = Math.random() * Math.PI * 2;
else sun.lookAt(camera.position);

let ambientLight;

if (night) ambientLight = new THREE.AmbientLight(new THREE.Color("#002F96"), 0.5);
else if (sunset) ambientLight = new THREE.AmbientLight(new THREE.Color("#d79865"), 0.25);
else ambientLight = new THREE.AmbientLight(new THREE.Color("#FFFFFF"), 0.36);

scene.add(ambientLight);

let sunLight;
if (night) sunLight = new THREE.DirectionalLight(new THREE.Color("#DDAAFF"), 0.75);
else if (sunset) sunLight = new THREE.DirectionalLight(new THREE.Color("#ffe1b8"), 1.25);
else sunLight = new THREE.DirectionalLight(new THREE.Color("#FFFFFF"), 0.75);
scene.add(sunLight);
sunLight.position.copy(sun.position);
if (sunset) sunLight.position.y *= 1.5;
if (night) sunLight.position.y += 50;

import points from "./dust.js";
scene.add(points);
points.position.z += camera.position.z;

import { environment } from "./environment.js";
scene.add(environment);

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
		if (element.rolling) {
			element.position.x += delta * 6.5;
			element.rotation.z -= delta * 5;
		} else {
			element.position.addScaledVector(element.velocity, delta);
		}

		if (element.position.y < 0) element.position.y = Math.min(0, element.position.y + delta * 2);

		if (element.position.z >= camera.position.z + 2 || (element.finalDestination && element.position.x >= element.finalDestination)) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			//element.update();
		}
	}

	if (night) sun.rotation.y += delta * 0.01;

	renderer.render(scene, camera);
	if (stats) stats.end();
}
