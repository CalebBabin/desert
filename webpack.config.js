const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

const ThreeMinifierPlugin = require("@yushijinhun/three-minifier-webpack");
const threeMinifier = new ThreeMinifierPlugin();

module.exports = {
	entry: './src/main.js',
	mode: 'development',
	output: {
		path: `${__dirname}/dist`,
		filename: 'bundle.js',
	},
	plugins: [
		threeMinifier,
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html',
			hash: true,
		}),
		new CopyPlugin({
			patterns: [
				{ from: "static" },
			],
		}),
	],
	resolve: {
		plugins: [
			threeMinifier.resolver,
		],
	},
	devServer: {
		compress: true,
		port: 1234,
	},
	module: {
		rules: [
			{
				test: /\.(png|jpe?g|gif|webp)$/i,
				loader: 'file-loader',
				options: {
					outputPath: 'images',
				},
			},
			{
				test: /\.html$/i,
				use: ['html-loader'],
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /(\.frag$|\.vert$|\.glsl$)/i,
				use: 'raw-loader',
			},
		],
	},
};