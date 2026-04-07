import React from 'react';
import { InterlinearPair } from '@/types';
import { cn } from '@/lib/utils';

interface InterlinearRendererProps {
    pairs: InterlinearPair[];
    className?: string;
    sourceClassName?: string;
    targetClassName?: string;
    fontSizeScale?: number;
    showTranslation?: boolean;
}

/**
 * InterlinearRenderer
 * Renders an array of source-target pairs.
 * Uses inline-flex containers to ensure pairs stay together (Sticky Pairs).
 */
export const InterlinearRenderer: React.FC<InterlinearRendererProps> = ({
    pairs,
    className,
    sourceClassName,
    targetClassName,
    fontSizeScale = 1,
    showTranslation = true,
}) => {
    return (
        <div className={cn("flex flex-wrap gap-x-4 gap-y-8 leading-relaxed", className)}>
            {pairs.map((pair, index) => (
                <div
                    key={index}
                    className="group inline-flex flex-col items-center min-w-fit px-1 py-0.5 rounded-md transition-all duration-200 hover:bg-muted/50"
                >
                    <span
                        className={cn(
                            "font-bold tracking-tight text-source",
                            sourceClassName
                        )}
                        style={{ fontSize: `${1.25 * fontSizeScale}rem` }}
                    >
                        {pair.source || "\u00A0"}
                    </span>
                    <span
                        className={cn(
                            "font-medium italic text-target/90",
                            targetClassName
                        )}
                        style={{ fontSize: `${0.875 * fontSizeScale}rem` }}
                    >
                        {showTranslation ? (pair.target || "\u00A0") : "\u00A0"}
                    </span>
                </div>
            ))}
        </div>
    );
};
