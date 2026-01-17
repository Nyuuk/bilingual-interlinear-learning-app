export interface InterlinearPair {
    source: string;
    target: string;
}

export interface InterlinearContent {
    metadata: {
        title: string;
        source_lang: string;
        target_lang: string;
    };
    data: InterlinearPair[];
}
