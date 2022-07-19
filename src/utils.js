
import sandVert from './sand.vert';
import windVert from './wind.vert';
import waddleVert from './waddle.vert';
import snoiseShader from './snoise.glsl';
import cellnoiseShader from './cellnoise.glsl';

window.shaderPID = 10000;

const typeIDs = {};
const getTypeId = (type) => {
	if (!typeIDs.hasOwnProperty(type)) {
		typeIDs[type] = window.shaderPID++;
	}
	return typeIDs[type];
}

export const applyShader = function (material, type = 'sand') {
	const tickUniforms = () => {
		if (uniforms) {
			uniforms.u_time.value = performance.now();
		}
		window.requestAnimationFrame(tickUniforms);
	}
	let uniforms = null;
	//material.onBeforeCompile(())
	material.onBeforeCompile = function (shader) {
		shader.uniforms.u_time = { value: Math.random() * 1000 };
		uniforms = shader.uniforms;

		if (type === 'wind') tickUniforms();

		material.userData.shader = shader;
		shader.vertexShader = shader.vertexShader.replace(
			'void main()',
			`
				${type === 'wind' ? 'uniform float u_time;' : ''}
				${snoiseShader}
				${cellnoiseShader}
				void main()
			`);
		shader.vertexShader = shader.vertexShader.replace(
			'#include <begin_vertex>',
			`
			#include <begin_vertex>
			${type === 'sand' ? sandVert : ''}
			${type === 'wind' ? windVert : ''}
			${type === 'waddle' ? (sandVert + '\n\n' + waddleVert) : ''}
		`);
		shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '');
	};

	// Make sure WebGLRenderer doesn't reuse a single program
	material.customProgramCacheKey = function () {
		return parseInt(getTypeId(type)); // some random ish number
	};
}