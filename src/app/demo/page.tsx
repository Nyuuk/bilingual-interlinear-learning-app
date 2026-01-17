"use client";

import { Editor } from '@/components/Editor';

export default function DemoPage() {
    return (
        <main className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                        BILA Demo
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Test the Interlinear Gloss rendering and interactive editor.
                    </p>
                </div>

                <Editor />
            </div>
        </main>
    );
}
