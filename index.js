/**
 * Discover information about a url and embed it
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
};
var equivalentDomains = {
    "youtu.be": "youtube.com",
};
/**
 * simplifyDotCom('www.twitter.com') == 'twitter.com'
 */
function simplifyDotCom(domain) {
    if (domain.endsWith(".com")) {
        var parts = domain.split('.');
        var lastTwoParts = parts.slice(parts.length - 2).join('.');
        return lastTwoParts;
    }
    else {
        return domain;
    }
}
function normalizeDomain(domain) {
    if (equivalentDomains[domain]) {
        return equivalentDomains[domain];
    }
    else {
        return simplifyDotCom(domain);
    }
}
exports.normalizeDomain = normalizeDomain;
function getImgurAlbum(url, getter) {
    return __awaiter(this, void 0, void 0, function* () {
        var albumID = url.match(/.*\/(.+?$)/)[1];
        var jsonUrl = 'https://api.imgur.com/3/album/' + albumID;
        var auth = 'Client-ID ' + 'f2edd1ef8e66eaf';
        var headers = {
            Authorization: auth
        };
        var data = yield getter(jsonUrl, headers);
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
    });
}
;
var converters = [
    {
        name: "imgurAlbums",
        detect: /imgur\.com\/(a|gallery)\/.*/,
        convert: function (url, jsonGetter) {
            return __awaiter(this, void 0, void 0, function* () {
                var singleImageUrl = yield getImgurAlbum(url, jsonGetter);
                if (singleImageUrl) {
                    return new Urlpedia(jsonGetter).getInfoAsync(singleImageUrl);
                }
                else {
                    return {
                        recognized: false
                    };
                }
            });
        }
    },
    {
        name: "imgurGifv",
        detect: /imgur\.com.*(gif|gifv|mp4|webm)/,
        convert: function (url, jsonGetter) {
            return __awaiter(this, void 0, void 0, function* () {
                var no_extension = url.replace(/\.\w+$/, '');
                var webmUrl = no_extension + '.webm';
                var mp4Url = no_extension + '.mp4';
                return {
                    embedHtml: video(webmUrl, mp4Url),
                    recognized: true,
                };
            });
        }
    },
    {
        name: "imgurNoExtension",
        detect: /imgur\.com[^\.]+/,
        convert: function (url, jsonGetter) {
            return __awaiter(this, void 0, void 0, function* () {
                var newUrl = url + '.jpg';
                var image = `<img src="${newUrl}" />`;
                return {
                    embedHtml: image,
                    recognized: true,
                };
            });
        }
    },
    {
        name: "redditPost",
        detect: /reddit\.com\/r\/.*/,
        convert: function (url, jsonGetter) {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    recognized: false
                };
            });
        }
    },
    {
        name: "gfycat",
        detect: /gfycat\.com.*/,
        convert: function (url, jsonGetter) {
            return __awaiter(this, void 0, void 0, function* () {
                //https://gfycat.com/cajax/get/ScaryGrizzledComet
                var match = url.match(/gfycat.com\/(\w+)/i);
                if (match && match.length > 1)
                    var name = match[1];
                else
                    return false;
                var data = yield jsonGetter('https://gfycat.com/cajax/get/' + name);
                var html = video(data.gfyItem.webmUrl, data.gfyItem.mp4Url);
                return {
                    recognized: true,
                    embedHtml: html
                };
            });
        },
    },
    {
        name: "imageExtension",
        detect: /\.(png|jpg|jpeg|gif|bmp)$/,
        convert: function (url, jsonGetter) {
            return __awaiter(this, void 0, void 0, function* () {
                var newElem = `<img src="${url}"/>`;
                return {
                    recognized: true,
                    embedHtml: newElem,
                };
            });
        }
    },
];
class Urlpedia {
    constructor(jsonGetter) {
        this.jsonGetter = jsonGetter;
    }
    getInfoAsync(url) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var key in converters) {
                var converter = converters[key];
                if (url.match(converter.detect)) {
                    console.log("Matched: " + url + "\n to - " + converter.name);
                    var res = yield converter.convert(url, this.jsonGetter);
                    //console.log(newElem);
                    if (res.recognized)
                        return res;
                }
            }
            return {
                recognized: false
            };
        });
    }
}
exports.Urlpedia = Urlpedia;
