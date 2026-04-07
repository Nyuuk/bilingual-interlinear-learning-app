"use client";

import { Editor } from '@/components/Editor';

export default function EditorPage() {
    return (
        <main className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                        Lesson Editor
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Import, validate, edit, and publish bilingual interlinear lessons.
                    </p>
                </div>

                <Editor />
            </div>
        </main>
    );
}
