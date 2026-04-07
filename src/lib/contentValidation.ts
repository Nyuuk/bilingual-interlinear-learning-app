import { InterlinearContent, InterlinearPair } from '@/types';

export interface PairValidationIssue {
    index: number;
    source?: string;
    target?: string;
}

export interface ContentValidationResult {
    isValid: boolean;
    metadata: {
        title?: string;
        source_lang?: string;
        target_lang?: string;
    };
    pairs: PairValidationIssue[];
    formError?: string;
}

const isBlank = (value: string) => value.trim().length === 0;

export const validatePairs = (pairs: InterlinearPair[]): PairValidationIssue[] => {
    if (pairs.length === 0) {
        return [{ index: -1, source: 'Add at least one source/target pair.' }];
    }

    return pairs.reduce<PairValidationIssue[]>((issues, pair, index) => {
        const nextIssue: PairValidationIssue = { index };

        if (isBlank(pair.source)) {
            nextIssue.source = 'Source chunk is required.';
        }

        if (isBlank(pair.target)) {
            nextIssue.target = 'Target translation is required.';
        }

        if (nextIssue.source || nextIssue.target) {
            issues.push(nextIssue);
        }

        return issues;
    }, []);
};

export const validateContent = (
    metadata: InterlinearContent['metadata'],
    pairs: InterlinearPair[],
): ContentValidationResult => {
    const pairIssues = validatePairs(pairs);
    const metadataIssues: ContentValidationResult['metadata'] = {};

    if (isBlank(metadata.title)) {
        metadataIssues.title = 'Lesson title is required.';
    }

    if (isBlank(metadata.source_lang)) {
        metadataIssues.source_lang = 'Source language is required.';
    }

    if (isBlank(metadata.target_lang)) {
        metadataIssues.target_lang = 'Target language is required.';
    }

    const hasMetadataIssues = Object.keys(metadataIssues).length > 0;
    const hasPairIssues = pairIssues.length > 0;

    return {
        isValid: !hasMetadataIssues && !hasPairIssues,
        metadata: metadataIssues,
        pairs: pairIssues,
        formError: !hasMetadataIssues && !hasPairIssues ? undefined : 'Fix validation errors before saving.',
    };
};

export const parseImportedContent = (json: string): InterlinearContent => {
    const parsed = JSON.parse(json) as unknown;

    if (!parsed || typeof parsed !== 'object') {
        throw new Error('Imported JSON must be an object with metadata and data.');
    }

    const content = parsed as Partial<InterlinearContent>;

    return {
        metadata: {
            title: content.metadata?.title ?? '',
            source_lang: content.metadata?.source_lang ?? '',
            target_lang: content.metadata?.target_lang ?? '',
        },
        data: Array.isArray(content.data)
            ? content.data.map((pair) => ({
                source: typeof pair?.source === 'string' ? pair.source : '',
                target: typeof pair?.target === 'string' ? pair.target : '',
            }))
            : [],
    };
};
