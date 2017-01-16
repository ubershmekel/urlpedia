/**
 * Discover information about a url and embed it
 */

var video = function (webmUrl, mp4Url) {
    // On imgur when you use the <source> tags
    // it tries to redirect you to the gifv page instead of serving
    // video. We can only circumvent that by putting the src 
    // on the <video> tag :/
    var sources = '';
    if (webmUrl)
        sources += `<source src="${webmUrl}" />`;
    if (mp4Url)
        sources += `<source src="${mp4Url}" />`;

    if (sources == '') {
        console.error("Tried to embed video with no sources");
    }
    var videoHtml = `<video autoplay loop>${sources}</video>`;
    return videoHtml;

    /*
    //video.attr("src", urls[0]);
    
    var url;
    if(!webmUrl && !mp4Url) {
        console.error("Empty video urls given");
        return;
    }
    
    if(mp4Url)
        url = mp4Url
    else
        url = webmUrl
    
    if (Modernizr.video.webm && webmUrl) {
        // Thank you http://diveintohtml5.info/detect.html
        // try WebM
        url = webmUrl;
    }

    url = url.replace("http://", "https://");
    video.attr("src", url);
    return video;
    */
}

var equivalentDomains = {
    "youtu.be": "youtube.com",
    "i.imgur.com": "imgur.com"
}

export type JsonGetterFunc = (url: string, headers?: Object) => Promise<any>;

export interface UrlInfo {
    embedHtml?: string;
    recognized: boolean;
}

type ConverterFunction = (url: string, jsonGetter: JsonGetterFunc) => Promise<UrlInfo>;

interface Converter {
    name: string,
    detect: RegExp,
    convert: ConverterFunction
}

async function getImgurAlbum(url: string, getter: JsonGetterFunc) {
    var albumID = url.match(/.*\/(.+?$)/)[1];
    var jsonUrl = 'https://api.imgur.com/3/album/' + albumID;

    var auth = 'Client-ID ' + 'f2edd1ef8e66eaf';
    var headers = {
        Authorization: auth
    }
    var data: imgur.RootObject = await getter(jsonUrl, headers);

    if (data.data.images.length === 0) {
        console.error("No data from this url :(");
        return null;
    }

    data.data.images.map((item, index) => {
        var info = {
            url: item.link,
            title: item.title,
            over18: item.nsfw,
            commentsLink: ""
        };
    });

    return data.data.images[0].link;
};


var converters: Converter[] = [
    {
        name: "imgurAlbums",
        detect: /imgur\.com\/(a|gallery)\/.*/,
        convert: async function (url, jsonGetter: JsonGetterFunc) {
            var singleImageUrl = await getImgurAlbum(url, jsonGetter);
            if (singleImageUrl) {
                return new Urlpedia(jsonGetter).getInfoAsync(singleImageUrl);
            } else {
                return {
                    recognized: false
                };
            }
        }
    },
    {
        name: "imgurGifv",
        detect: /imgur\.com.*(gif|gifv|mp4|webm)/,
        convert: async function (url, jsonGetter: JsonGetterFunc) {
            var no_extension = url.replace(/\.\w+$/, '')
            var webmUrl = no_extension + '.webm'
            var mp4Url = no_extension + '.mp4';
            return {
                embedHtml: video(webmUrl, mp4Url),
                recognized: true,
            }
        }
    },
    {
        name: "imgurNoExtension",
        detect: /imgur\.com[^\.]+/,
        convert: async function (url, jsonGetter: JsonGetterFunc) {
            var newUrl = url + '.jpg';
            var image = `<img src="${newUrl}" />`;
            return {
                embedHtml: image,
                recognized: true,
            }
        }
    },
    {
        name: "redditPost",
        detect: /reddit\.com\/r\/.*/,
        convert: async function (url, jsonGetter: JsonGetterFunc) {
            return {
                recognized: false
            };
        }
    },
    {
        name: "gfycat",
        detect: /gfycat\.com.*/,
        convert: async function (url: string, jsonGetter: JsonGetterFunc) {
            //https://gfycat.com/cajax/get/ScaryGrizzledComet
            var match = url.match(/gfycat.com\/(\w+)/i);
            if (match && match.length > 1)
                var name = match[1];
            else
                return false;

            var data = await jsonGetter('https://gfycat.com/cajax/get/' + name);
            var html = video(data.gfyItem.webmUrl, data.gfyItem.mp4Url);
            return {
                recognized: true,
                embedHtml: html
            };
        },
    },
    {
        name: "imageExtension",
        detect: /\.(png|jpg|jpeg|gif|bmp)$/,
        convert: async function (url: string, jsonGetter: JsonGetterFunc) {
            var newElem = `<img src="${url}"/>`;
            return {
                recognized: true,
                embedHtml: newElem,
            };
        }
    },

]

export class Urlpedia {
    jsonGetter: JsonGetterFunc;

    constructor(jsonGetter: JsonGetterFunc) {
        this.jsonGetter = jsonGetter;
    }

    async getInfoAsync(url): Promise<UrlInfo> {
        for (var key in converters) {
            var converter = converters[key];
            if (url.match(converter.detect)) {
                console.log("Matched: " + url + "\n to - " + converter.name);
                var res = await converter.convert(url, this.jsonGetter);
                //console.log(newElem);
                if (res.recognized)
                    return res;
            }
        }
        return {
            recognized: false
        }
    }
}

