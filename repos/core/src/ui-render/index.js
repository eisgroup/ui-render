"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metaToProps = exports.mapProps = exports.Render = void 0;
var Render_1 = __importDefault(require("./Render"));
exports.Render = Render_1.default;
var transforms_1 = require("./transforms");
Object.defineProperty(exports, "mapProps", { enumerable: true, get: function () { return transforms_1.mapProps; } });
Object.defineProperty(exports, "metaToProps", { enumerable: true, get: function () { return transforms_1.metaToProps; } });
exports.default = Render_1.default;
