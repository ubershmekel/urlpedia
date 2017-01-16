import * as assert from 'assert';
import { describe, it } from 'mocha';

import axios from 'axios';

import { Urlpedia } from './index';


async function jsonGetter(url: string, headers: Object = {}): Promise<any> {
    var res = await axios.get(url, {
        responseType: "json",
        headers: headers
    });
    return res.data;
}


describe('Urlpedia', function () {
    var upedia = new Urlpedia(jsonGetter);
    describe('embed', function () {
        it('gifv create a video element', async () => {
            var gifv = 'http://i.imgur.com/yiPKTF4.gifv';
            var data = await upedia.getInfoAsync(gifv)
            //console.log(data.renderEmbed());
            var expected = '<video autoplay loop><source src="http://i.imgur.com/yiPKTF4.webm" /><source src="http://i.imgur.com/yiPKTF4.mp4" /></video>';
            assert.equal(expected, data.renderEmbed());
        });
        it('imgur convert gallery to image', async () => {
            var expected = '<video autoplay loop><source src="http://i.imgur.com/yiPKTF4.webm" /><source src="http://i.imgur.com/yiPKTF4.mp4" /></video>';
            var galleryOneThing = 'http://imgur.com/gallery/pNcN8';
            var data = await upedia.getInfoAsync(galleryOneThing)
            //console.log(data.renderEmbed());
            assert.equal(expected, data.renderEmbed());
        });
        it('imgur convert gallery to image', async () => {
            var expected = '';
            var invalid = 'http://cnn.com/gallery/pNcN8';
            var data = await upedia.getInfoAsync(invalid)
            assert.equal(expected, data.renderEmbed());
        });
    });
});