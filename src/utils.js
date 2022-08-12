import sandVert from "./sand.vert";
import windVert from "./wind.vert";
import waddleVert from "./waddle.vert";
import starFrag from "./star.frag";
import snoiseShader from "./snoise.glsl";
import cellnoiseShader from "./cellnoise.glsl";

window.shaderPID = 10000;

const typeIDs = {};
const getTypeId = (type) => {
	if (!typeIDs.hasOwnProperty(type)) {
		typeIDs[type] = window.shaderPID++;
	}
	return typeIDs[type];
};

export const applyShader = function (material, type = "sand") {
	const tickUniforms = () => {
		if (uniforms) {
			uniforms.u_time.value = performance.now();
		}
		window.requestAnimationFrame(tickUniforms);
	};
	let uniforms = null;
	//material.onBeforeCompile(())
	material.onBeforeCompile = function (shader) {
		shader.uniforms.u_time = { value: Math.random() * 1000 };
		uniforms = shader.uniforms;

		const tick = type === "wind" || type === "star";

		if (tick) tickUniforms();

		material.userData.shader = shader;
		shader.vertexShader = shader.vertexShader.replace(
			"void main()",
			`
				${tick ? "uniform float u_time;" : ""}
				${type === "star" ? "varying vec4 vWorldPosition;" : ""}
				${snoiseShader}
				${cellnoiseShader}
				void main()
			`
		);
		shader.vertexShader = shader.vertexShader.replace(
			"#include <begin_vertex>",
			`
			#include <begin_vertex>
			${type === "star" ? "vWorldPosition = vec4(instanceMatrix) * vec4(modelMatrix);" : ""}
			${type === "sand" ? sandVert : ""}
			${type === "wind" ? windVert : ""}
			${type === "waddle" ? sandVert + "\n\n" + waddleVert : ""}
		`
		);

		shader.fragmentShader = shader.fragmentShader.replace(
			"void main()",
			`
				${type === "star" ? "varying vec4 vWorldPosition;" : ""}
				${tick ? "uniform float u_time;" : ""}
				void main()
			`
		);
		shader.fragmentShader = shader.fragmentShader.replace("#include <color_fragment>", "");

		shader.fragmentShader = shader.fragmentShader.replace(
			"#include <alphatest_fragment>",
			`
			#include <alphatest_fragment>
			${type === "star" ? starFrag : ""}
		`
		);
	};

	// Make sure WebGLRenderer doesn't reuse a single program
	material.customProgramCacheKey = function () {
		return parseInt(getTypeId(type)); // some random ish number
	};
};
