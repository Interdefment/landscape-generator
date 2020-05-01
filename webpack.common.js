const path = require('path');
const devMode = process.env.NODE_ENV !== 'production';
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

if (process.env.NODE_ENV !== 'production') {
  console.log('Looks like we are in development mode!');
}

module.exports = {
  entry: {
    main: './src/index.ts'
  },
  output: {
    filename: '[name].js',
		path: path.resolve(__dirname, './dist'),
		publicPath: devMode ? '/' : '',
  },
	resolve: {
		modules: [
			"node_modules"
		],
		extensions: ["*", ".ts", ".js"]
	},
	resolveLoader: {
		modules: ["node_modules"],
		moduleExtensions: ['-loader'],
		extensions: ["*", ".ts", ".js", ".css"]
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
        use: [
					'ts'
				]
			},
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel',
					options: {
						presets: ['env']
					}
				}
			},
			{
				test: /\.(html)$/,
				use: [
					{
						loader: 'html',
						options: {
							minimize: true,
							removeComments: false,
							collapseWhitespace: true
						}
					}
				]
			},
			{
				test: /\.scss$/,
				use: [
					devMode ? 'style' : MiniCssExtractPlugin.loader,
					'css',
					{
						loader: 'postcss',
						options: {
								plugins: [
									require('autoprefixer')({
												browsers:['ie >= 8', 'last 4 version']
										})
								],
								sourceMap: true
						}
					},
					{ loader: 'sass', options: { sourceMap: true } }
				]
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: [
					{
						loader: 'file',
						options: {
							name: '[name].[ext]',
							outputPath: 'img/',
							publicPath: 'img/'
						}
					},
					{
						loader: 'image-webpack-loader',
						options: {
							limit: 10000,
							mozjpeg: {
								progressive: true,
								quality: 65
							},
							optipng: {
								enabled: false,
							},
							pngquant: {
								quality: '65-90',
								speed: 4
							},
							gifsicle: {
								interlaced: false,
							},
							webp: {
								quality: 75
							}
						}
					},
				]
			}
		]
	},
};