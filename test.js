"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const axios_1 = require("axios");
const index_1 = require("./index");
function jsonGetter(url, headers = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        var res = yield axios_1.default.get(url, {
            responseType: "json",
            headers: headers
        });
        return res.data;
    });
}
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        var upedia = new index_1.Urlpedia(jsonGetter);
        var gifv = 'http://i.imgur.com/yiPKTF4.gifv';
        var data = yield upedia.getInfoAsync(gifv);
        console.log(data.embedHtml);
        console.log(data.recognized);
        var galleryOneThing = 'http://imgur.com/gallery/pNcN8';
        var data = yield upedia.getInfoAsync(galleryOneThing);
        console.log(data.embedHtml);
        console.log(data.recognized);
    });
}
test().then(function () {
    console.log('succeeded');
}).catch(function () {
    console.log('failed');
});
