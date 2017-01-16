import axios from 'axios';

import {Urlpedia} from './index';


async function jsonGetter(url: string, headers: Object = {}): Promise<any> {
    var res = await axios.get(url, {
        responseType: "json",
        headers: headers
    });
    return res.data;
}

async function test() {
    var upedia = new Urlpedia(jsonGetter);

    var gifv = 'http://i.imgur.com/yiPKTF4.gifv';
    var data = await upedia.getInfoAsync(gifv)
    console.log(data.embedHtml);
    console.log(data.recognized);


    var galleryOneThing = 'http://imgur.com/gallery/pNcN8';
    var data = await upedia.getInfoAsync(galleryOneThing)
    console.log(data.embedHtml);
    console.log(data.recognized);
}

test().then(function() {
    console.log('succeeded');
}).catch(function() {
    console.log('failed');
    
});
