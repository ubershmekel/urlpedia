/**
 * Discover information about a url and embed it
 */

/// <reference path="./imgur.d.ts" />

export type urlType = "image" | "video" | "unknown";

export class UrlInfo {
    type: urlType = "unknown";

    webmUrl?: string;
    mp4Url?: string;
    imageUrl?: string;

    constructor(init?: Partial<UrlInfo>) {
        if(init)
            Object.assign(this, init);
    }

    isEmbeddable(): boolean {
        if (this.type == "image" || this.type == "video")
            return true;
        else
            return false;
    }

    /**
     * Return '' when it can't embed.
     */
    renderEmbed(): string {
        if (this.type == "image") {
            return this.renderEmbedImage();
        }
        if (this.type == "video") {
            return this.renderEmbedVideo();
        }
        return "";
    }

    private renderEmbedImage(): string {
        return `<img src="${this.imageUrl}" />`;
    }

    private renderEmbedVideo(): string {
        var sources = '';
        if (this.webmUrl)
            sources += `<source src="${this.webmUrl}" />`;
        if (this.mp4Url)
            sources += `<source src="${this.mp4Url}" />`;

        if (sources == '') {
            console.error("Tried to embed video with no sources");
        }
        var videoHtml = `<video autoplay loop>${sources}</video>`;
        return videoHtml;
    }
};

var video = function (webmUrl, mp4Url) {
    // On imgur when you use the <source> tags
    // it tries to redirect you to the gifv page instead of serving
    // video. We can only circumvent that by putting the src 
    // on the <video> tag :/

}

export type JsonGetterFunc = (url: string, headers?: Object) => Promise<any>;


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

    /*data.data.images.map((item, index) => {
        var info = {
            url: item.link,
            title: item.title,
            over18: item.nsfw,
            commentsLink: ""
        };
    });*/
    var firstImage = data.data.images[0];
    if(firstImage.gifv)
        return firstImage.gifv;
    else
        return firstImage.link;
};


var converters: Converter[] = [
    {
        name: "imgurAlbums",
        detect: /imgur\.com\/(a|gallery)\/.*/,
        convert: async function (url, jsonGetter: JsonGetterFunc): Promise<UrlInfo> {
            var singleImageUrl = await getImgurAlbum(url, jsonGetter);
            if (singleImageUrl) {
                return new Urlpedia(jsonGetter).getInfoAsync(singleImageUrl);
            } else {
                return new UrlInfo();
            }
        }
    },
    {
        name: "imgurGifv",
        detect: /imgur\.com.*(gif|gifv|mp4|webm)/,
        convert: async function (url, jsonGetter: JsonGetterFunc): Promise<UrlInfo> {
            var no_extension = url.replace(/\.\w+$/, '')
            var webmUrl = no_extension + '.webm'
            var mp4Url = no_extension + '.mp4';
            return new UrlInfo({
                webmUrl: webmUrl,
                mp4Url: mp4Url,
                type: 'video',
            });
        }
    },
    {
        name: "imgurNoExtension",
        detect: /imgur\.com[^\.]+/,
        convert: async function (url, jsonGetter: JsonGetterFunc): Promise<UrlInfo> {
            var newUrl = url + '.jpg';
            var image = `<img src="${newUrl}" />`;
            return new UrlInfo({
                type: "image",
                imageUrl: newUrl,
            });
        }
    },
    {
        name: "redditPost",
        detect: /reddit\.com\/r\/.*/,
        convert: async function (url, jsonGetter: JsonGetterFunc): Promise<UrlInfo> {
            return new UrlInfo();
        }
    },
    {
        name: "gfycat",
        detect: /gfycat\.com.*/,
        convert: async function (url: string, jsonGetter: JsonGetterFunc): Promise<UrlInfo> {
            //https://gfycat.com/cajax/get/ScaryGrizzledComet
            var match = url.match(/gfycat.com\/(\w+)/i);
            if (match && match.length > 1)
                var name = match[1];
            else
                return new UrlInfo();

            var data = await jsonGetter('https://gfycat.com/cajax/get/' + name);
            return new UrlInfo({
                type: "video",
                webmUrl: data.gfyItem.webmUrl,
                mp4Url: data.gfyItem.mp4Url,
            });
        },
    },
    {
        name: "imageExtension",
        detect: /\.(png|jpg|jpeg|gif|bmp)$/,
        convert: async function (url: string, jsonGetter: JsonGetterFunc): Promise<UrlInfo> {
            return new UrlInfo({
                type: "image",
                imageUrl: url,
            });
        }
    },

]



export class Urlpedia {
    jsonGetter: JsonGetterFunc;

    constructor(jsonGetter: JsonGetterFunc) {
        this.jsonGetter = jsonGetter;
    }

    async getInfoAsync(url: string): Promise<UrlInfo> {
        for (var key in converters) {
            var converter = converters[key];
            if (url.match(converter.detect)) {
                //console.log("Matched: " + url + "\n to - " + converter.name);
                var res = await converter.convert(url, this.jsonGetter);
                //console.log(newElem);
                if (res.isEmbeddable())
                    return res;
            }
        }
        return new UrlInfo();
    }


}

