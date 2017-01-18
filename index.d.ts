/// <reference path="imgur.d.ts" />
/**
 * Discover information about a url and embed it
 */
export declare type urlType = "image" | "video" | "unknown";
export declare class UrlInfo {
    type: urlType;
    webmUrl?: string;
    mp4Url?: string;
    imageUrl?: string;
    constructor(init?: Partial<UrlInfo>);
    isEmbeddable(): boolean;
    /**
     * Return '' when it can't embed.
     */
    renderEmbed(): string;
    private renderEmbedImage();
    private renderEmbedVideo();
}
export declare type JsonGetterFunc = (url: string, headers?: Object) => Promise<any>;
export declare class Urlpedia {
    jsonGetter: JsonGetterFunc;
    constructor(jsonGetter: JsonGetterFunc);
    getInfoAsync(url: string): Promise<UrlInfo>;
}
