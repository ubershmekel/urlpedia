// Generated thanks to http://json2ts.com/

declare module imgur {

    export interface Image {
        id: string;
        title?: any;
        description: string;
        datetime: number;
        type: string;
        animated: boolean;
        width: number;
        height: number;
        size: number;
        views: number;
        bandwidth: number;
        vote?: any;
        favorite: boolean;
        nsfw?: any;
        section?: any;
        account_url?: any;
        account_id?: any;
        is_ad: boolean;
        in_gallery: boolean;
        gifv: string;
        mp4: string;
        mp4_size: number;
        link: string;
        looping: boolean;
    }

    export interface Data {
        id: string;
        title: string;
        description?: any;
        datetime: number;
        cover: string;
        cover_width: number;
        cover_height: number;
        account_url: string;
        account_id: number;
        privacy: string;
        layout: string;
        views: number;
        link: string;
        favorite: boolean;
        nsfw: boolean;
        section?: any;
        images_count: number;
        in_gallery: boolean;
        is_ad: boolean;
        images: Image[];
    }

    export interface RootObject {
        data: Data;
        success: boolean;
        status: number;
    }

}

