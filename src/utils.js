
import sandVert from './sand.vert';
import windVert from './wind.vert';
import trunkVert from './trunk.vert';
import waddleVert from './waddle.vert';
import snoiseShader from './snoise.glsl';

window.shaderPID = 10000;

export const applyShader = function (material, type = 'sand', waddle = false) {
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
		if (type !== 'sand') tickUniforms();

		material.userData.shader = shader;
		shader.vertexShader = shader.vertexShader.replace(
			'void main()',
			`
				${type === 'trunk' ? '' : 'uniform float u_time;'}
				${snoiseShader}
				void main()
			`);
		shader.vertexShader = shader.vertexShader.replace(
			'#include <begin_vertex>',
			`
			#include <begin_vertex>
			${type === 'sand' ? sandVert : ''}
			${type === 'wind' ? windVert : ''}
			${type === 'trunk' ? trunkVert : ''}
			${waddle ? waddleVert : ''}
		`);
	};

	// Make sure WebGLRenderer doesn't reuse a single program
	if (type !== 'sand') {
		material.customProgramCacheKey = function () {
			return parseInt(window.shaderPID++); // some random ish number
		};
	}
}