"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _assign = require("babel-runtime/core-js/object/assign");var _assign2 = _interopRequireDefault(_assign);var _promise = require("babel-runtime/core-js/promise");var _promise2 = _interopRequireDefault(_promise);var _map = require("babel-runtime/core-js/map");var _map2 = _interopRequireDefault(_map);var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);





/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @typedef {Object} LoaderContext
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {function} cacheable
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {function} async
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {function} addDependency
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {function} loadModule
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {string} resourcePath
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @property {object} options
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */

/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Executes the given module's src in a fake context in order to get the resulting string.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @this LoaderContext
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @param {string} src
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * @throws Error
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */let extractLoader = (() => {var _ref = (0, _asyncToGenerator3.default)(
    function* (src) {
        const done = this.async();
        const options = (0, _loaderUtils.getOptions)(this) || {};
        const publicPath = getPublicPath(options, this);
        const outputPath = options.useOutputPathForRelative ? this.data.outputPath : null;

        this.cacheable();

        try {
            done(null, (yield evalDependencyGraph({
                loaderContext: this,
                src,
                filename: this.resourcePath,
                publicPath,
                outputPath })));

        } catch (error) {
            done(error);
        }
    });return function extractLoader(_x) {return _ref.apply(this, arguments);};})();var _vm = require("vm");var _vm2 = _interopRequireDefault(_vm);var _path = require("path");var _path2 = _interopRequireDefault(_path);var _loaderUtils = require("loader-utils");var _resolve = require("resolve");var _resolve2 = _interopRequireDefault(_resolve);var _btoa = require("btoa");var _btoa2 = _interopRequireDefault(_btoa);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function evalDependencyGraph({ loaderContext, src, filename, publicPath = "", outputPath = null }) {let evalModule = (() => {var _ref2 = (0, _asyncToGenerator3.default)(


































        function* (src, filename) {
            const rndPlaceholder = "__EXTRACT_LOADER_PLACEHOLDER__" + rndNumber() + rndNumber();
            const rndPlaceholderPattern = new RegExp(rndPlaceholder, "g");
            const script = new _vm2.default.Script(src, {
                filename,
                displayErrors: true });

            const newDependencies = [];
            const exports = {};
            const sandbox = (0, _assign2.default)({}, global, {
                module: {
                    exports },

                exports,
                __webpack_public_path__: publicPath, // eslint-disable-line camelcase
                require: function (_require) {function require(_x4) {return _require.apply(this, arguments);}require.toString = function () {return _require.toString();};return require;}(function (givenRelativePath) {
                    const indexOfQuery = Math.max(givenRelativePath.indexOf("?"), givenRelativePath.length);
                    const relativePathWithoutQuery = givenRelativePath.slice(0, indexOfQuery);
                    const indexOfLastExclMark = relativePathWithoutQuery.lastIndexOf("!");
                    const query = givenRelativePath.slice(indexOfQuery);
                    const loaders = givenRelativePath.slice(0, indexOfLastExclMark + 1);
                    const relativePath = relativePathWithoutQuery.slice(indexOfLastExclMark + 1);
                    const absolutePath = _resolve2.default.sync(relativePath, {
                        basedir: _path2.default.dirname(filename) });

                    const ext = _path2.default.extname(absolutePath);

                    if (moduleCache.has(absolutePath)) {
                        return moduleCache.get(absolutePath);
                    }

                    // If the required file is a js file, we just require it with node's require.
                    // If the required file should be processed by a loader we do not touch it (even if it is a .js file).
                    if (loaders === "" && ext === ".js") {
                        // Mark the file as dependency so webpack's watcher is working for the css-loader helper.
                        // Other dependencies are automatically added by loadModule() below
                        loaderContext.addDependency(absolutePath);

                        const exports = require(absolutePath); // eslint-disable-line import/no-dynamic-require

                        moduleCache.set(absolutePath, exports);

                        return exports;
                    }

                    newDependencies.push({
                        absolutePath,
                        absoluteRequest: loaders + absolutePath + query });


                    return rndPlaceholder;
                }) });


            script.runInNewContext(sandbox);

            const extractedDependencyContent = yield _promise2.default.all(
            newDependencies.map((() => {var _ref3 = (0, _asyncToGenerator3.default)(function* ({ absolutePath, absoluteRequest }) {
                    const src = yield loadModule(absoluteRequest);

                    return evalModule(src, absolutePath);
                });return function (_x5) {return _ref3.apply(this, arguments);};})()));

            const contentWithPlaceholders = extractExports(sandbox.module.exports);
            const extractedContent = contentWithPlaceholders.replace(
            rndPlaceholderPattern,
            function () {
                const resolvedPath = extractedDependencyContent.shift();
                let filePath = resolvedPath;

                if (outputPath) {
                    const output = seperateDirFormFile(outputPath);
                    const resolved = seperateDirFormFile(resolvedPath);
                    const relativeDir = output.dir === resolved.dir ?
                    "" :
                    _path2.default.posix.relative(output.dir, resolved.dir) + "/";

                    filePath = relativeDir + resolved.file;
                }

                return filePath;
            });


            moduleCache.set(filename, extractedContent);

            return extractedContent;
        });return function evalModule(_x2, _x3) {return _ref2.apply(this, arguments);};})();const moduleCache = new _map2.default();function loadModule(filename) {return new _promise2.default((resolve, reject) => {// loaderContext.loadModule automatically calls loaderContext.addDependency for all requested modules
            loaderContext.loadModule(filename, (error, src) => {if (error) {reject(error);} else {resolve(src);}});});}function extractExports(exports) {const hasBtoa = "btoa" in global;const previousBtoa = global.btoa;global.btoa = _btoa2.default;try {return exports.toString();} catch (error) {throw error;} finally {if (hasBtoa) {global.btoa = previousBtoa;} else {delete global.btoa;}}}
    return evalModule(src, filename);
}

function seperateDirFormFile(pathWithFile) {
    const indexOfLastSlash = pathWithFile.lastIndexOf("/");

    if (indexOfLastSlash === -1) {
        return {
            dir: "",
            file: pathWithFile };

    }

    return {
        dir: pathWithFile.slice(0, indexOfLastSlash),
        file: pathWithFile.slice(indexOfLastSlash + 1) };

}

/**
   * @returns {string}
   */
function rndNumber() {
    return Math.random().
    toString().
    slice(2);
}

/**
   * Retrieves the public path from the loader options, context.options (webpack <4) or context._compilation (webpack 4+).
   * context._compilation is likely to get removed in a future release, so this whole function should be removed then.
   * See: https://github.com/peerigon/extract-loader/issues/35
   *
   * @deprecated
   * @param {Object} options - Extract-loader options
   * @param {Object} context - Webpack loader context
   * @returns {string}
   */
function getPublicPath(options, context) {
    if ("publicPath" in options) {
        return typeof options.publicPath === "function" ? options.publicPath(context) : options.publicPath;
    }

    if (context.options && context.options.output && "publicPath" in context.options.output) {
        return context.options.output.publicPath;
    }

    if (context._compilation && context._compilation.outputOptions && "publicPath" in context._compilation.outputOptions) {
        return context._compilation.outputOptions.publicPath;
    }

    return "";
}

// For CommonJS interoperability
module.exports = extractLoader;exports.default =
extractLoader;