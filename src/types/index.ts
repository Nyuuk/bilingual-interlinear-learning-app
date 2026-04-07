export interface InterlinearPair {
    source: string;
    target: string;
}

export type ContentStatus = 'DRAFT' | 'PUBLISHED';

export interface InterlinearContent {
    metadata: {
        title: string;
        source_lang: string;
        target_lang: string;
        status?: ContentStatus;
    };
    data: InterlinearPair[];
}
