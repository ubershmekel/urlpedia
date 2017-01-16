"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const assert = require("assert");
const mocha_1 = require("mocha");
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
mocha_1.describe('Urlpedia', function () {
    var upedia = new index_1.Urlpedia(jsonGetter);
    mocha_1.describe('embed', function () {
        mocha_1.it('gifv create a video element', () => __awaiter(this, void 0, void 0, function* () {
            var gifv = 'http://i.imgur.com/yiPKTF4.gifv';
            var data = yield upedia.getInfoAsync(gifv);
            //console.log(data.renderEmbed());
            var expected = '<video autoplay loop><source src="http://i.imgur.com/yiPKTF4.webm" /><source src="http://i.imgur.com/yiPKTF4.mp4" /></video>';
            assert.equal(expected, data.renderEmbed());
        }));
        mocha_1.it('imgur convert gallery to image', () => __awaiter(this, void 0, void 0, function* () {
            var expected = '<video autoplay loop><source src="http://i.imgur.com/yiPKTF4.webm" /><source src="http://i.imgur.com/yiPKTF4.mp4" /></video>';
            var galleryOneThing = 'http://imgur.com/gallery/pNcN8';
            var data = yield upedia.getInfoAsync(galleryOneThing);
            //console.log(data.renderEmbed());
            assert.equal(expected, data.renderEmbed());
        }));
        mocha_1.it('imgur convert gallery to image', () => __awaiter(this, void 0, void 0, function* () {
            var expected = '';
            var invalid = 'http://cnn.com/gallery/pNcN8';
            var data = yield upedia.getInfoAsync(invalid);
            assert.equal(expected, data.renderEmbed());
        }));
    });
});
//# sourceMappingURL=test.js.map