"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const assert = require("assert");
const path = require("path");
const fs_1 = require("fs");
const fsp = require("fs-promise");
const crypto = require("crypto");
const sourceMapSupport = require("source-map-support");
const io_1 = require("../util/io");
const util_1 = require("../util/util");
sourceMapSupport.install();
if (process.env.LONGJOHN) {
    console.log("=== USING LONGJOHN ===");
    const longjohn = require("longjohn");
    longjohn.async_trace_limit = -1; // unlimited
}
exports.home = path.join(__dirname, "..", "..");
exports.settings = util_1.parseJson(fs_1.readFileSync(path.join(exports.home, "settings.json"), "utf-8"));
exports.typesDataFilename = "definitions.json";
exports.notNeededPackagesPath = path.join(exports.settings.definitelyTypedPath, "notNeededPackages.json");
(function (RejectionReason) {
    RejectionReason[RejectionReason["TooManyFiles"] = 0] = "TooManyFiles";
    RejectionReason[RejectionReason["BadFileFormat"] = 1] = "BadFileFormat";
    RejectionReason[RejectionReason["ReferencePaths"] = 2] = "ReferencePaths";
})(exports.RejectionReason || (exports.RejectionReason = {}));
var RejectionReason = exports.RejectionReason;
function isNotNeededPackage(pkg) {
    return pkg.packageKind === "not-needed";
}
exports.isNotNeededPackage = isNotNeededPackage;
function writeDataFile(filename, content, formatted = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDir = path.join(exports.home, "data");
        yield fsp.ensureDir(dataDir);
        yield io_1.writeFile(path.join(dataDir, filename), JSON.stringify(content, undefined, formatted ? 4 : undefined));
    });
}
exports.writeDataFile = writeDataFile;
const dataDir = path.join(exports.home, "data");
function dataFilePath(filename) {
    return path.join(dataDir, filename);
}
function existsTypesDataFileSync() {
    return fs_1.existsSync(dataFilePath(exports.typesDataFilename));
}
exports.existsTypesDataFileSync = existsTypesDataFileSync;
function readTypesDataFile() {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield io_1.readJson(dataFilePath(exports.typesDataFilename)));
    });
}
exports.readTypesDataFile = readTypesDataFile;
/**
 * Read all typings and extract a single one.
 * Do *not* call this in a loop; use `readTypings` instead.
 */
function readPackage(packageName) {
    return __awaiter(this, void 0, void 0, function* () {
        return getPackage(yield readTypesDataFile(), packageName);
    });
}
exports.readPackage = readPackage;
function getPackage(typings, packageName) {
    const pkg = typings[packageName];
    if (pkg === undefined) {
        throw new Error(`Can't find package ${packageName}`);
    }
    return pkg;
}
exports.getPackage = getPackage;
function typingsFromData(typeData) {
    return Object.keys(typeData).map(packageName => typeData[packageName]);
}
exports.typingsFromData = typingsFromData;
function readTypings() {
    return __awaiter(this, void 0, void 0, function* () {
        return typingsFromData(yield readTypesDataFile());
    });
}
exports.readTypings = readTypings;
function readNotNeededPackages() {
    return __awaiter(this, void 0, void 0, function* () {
        const raw = (yield io_1.readJson(exports.notNeededPackagesPath)).packages;
        for (const pkg of raw) {
            for (const key in pkg) {
                if (!["libraryName", "typingsPackageName", "sourceRepoURL", "asOfVersion"].includes(key)) {
                    throw new Error(`Unexpected key in not-needed package: ${key}`);
                }
            }
            assert(pkg.libraryName && pkg.typingsPackageName && pkg.sourceRepoURL);
            assert(typeof pkg.asOfVersion === "string" || pkg.asOfVersion === undefined);
            assert(!pkg.projectName && !pkg.packageKind && !pkg.globals && !pkg.declaredModules);
            pkg.projectName = pkg.sourceRepoURL;
            pkg.packageKind = "not-needed";
            pkg.globals = [];
            pkg.declaredModules = [];
        }
        return raw;
    });
}
exports.readNotNeededPackages = readNotNeededPackages;
function readAllPackages() {
    return __awaiter(this, void 0, void 0, function* () {
        const [typings, notNeeded] = yield Promise.all([readTypings(), readNotNeededPackages()]);
        return { typings, notNeeded };
    });
}
exports.readAllPackages = readAllPackages;
function readAllPackagesArray() {
    return __awaiter(this, void 0, void 0, function* () {
        const { typings, notNeeded } = yield readAllPackages();
        return typings.concat(notNeeded);
    });
}
exports.readAllPackagesArray = readAllPackagesArray;
function computeHash(content) {
    // Normalize line endings
    content = content.replace(/\r\n?/g, "\n");
    const h = crypto.createHash("sha256");
    h.update(content, "utf8");
    return h.digest("hex");
}
exports.computeHash = computeHash;
function definitelyTypedPath(dirName) {
    return path.join(exports.settings.definitelyTypedPath, dirName);
}
exports.definitelyTypedPath = definitelyTypedPath;
function getOutputPath({ typingsPackageName }) {
    return path.join(exports.settings.outputPath, typingsPackageName);
}
exports.getOutputPath = getOutputPath;
function fullPackageName(typingsPackageName) {
    return `@${exports.settings.scopeName}/${typingsPackageName.toLowerCase()}`;
}
exports.fullPackageName = fullPackageName;
function notNeededReadme({ libraryName, typingsPackageName, sourceRepoURL }, useNewline = true) {
    const lines = [
        `This is a stub types definition for ${libraryName} (${sourceRepoURL}).`,
        `${libraryName} provides its own type definitions, so you don't need ${fullPackageName(typingsPackageName)} installed!`
    ];
    return lines.join(useNewline ? "\n" : " ");
}
exports.notNeededReadme = notNeededReadme;
//# sourceMappingURL=common.js.map