const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const autoprefixer = require("autoprefixer");

const fs = require("fs");

const isDevelopment = process.env.NODE_ENV == "development";

function generateHtmlPlugins(templateDir) {
    const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
    return templateFiles.map(item => {
        const parts = item.split(".");
        const name = parts[0];
        const extension = parts[1];
        return new HtmlWebpackPlugin({
            filename: `${name}.html`,
            template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
            inject: false
        });
    });
}

const htmlPlugins = generateHtmlPlugins("./src/html/pages");

const rules = [
    {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src/js"),
        use: ["babel-loader"]
    },
    {
        test: /\.(css|sass|scss)$/,
        include: path.resolve(__dirname, "src/scss"),
        use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: "css-loader", options: { sourceMap: true } },
            { loader: "sass-loader", options: { sourceMap: true } },
            {
                loader: "postcss-loader",
                options: {
                    ident: "postcss",
                    sourceMap: true,
                    plugins: [
                        autoprefixer({
                            browsers: ["ie >= 10", "ios_saf >= 8", "last 4 version"]
                        })
                    ]
                }
            }
        ]
    },
    {
        test: /\.html$/,
        include: path.resolve(__dirname, "src/html/includes"),
        use: ["raw-loader"]
    }
];

module.exports = {
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: false
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessor: require("cssnano"),
                cssProcessorOptions: { reduceIdents: false }
            })
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, "./public/"),
        compress: true,
        port: 3000,
        overlay: true,
        historyApiFallback: {
            index: "/index.html"
        }
    },
    entry: ["./src/js/index.js", "./src/scss/index.scss"],
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "app.bundle.js"
    },
    devtool: isDevelopment && "source-map",
    module: {
        rules
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "app.bundle.css",
            chunkFilename: "[id].css"
        }),
        new CopyWebpackPlugin([
            {
                from: "./src/assets",
                to: "./assets"
            }
        ])
    ].concat(htmlPlugins)
};
