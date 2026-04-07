import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { ContentStatus, InterlinearContent } from '@/types';
import { validateContent } from '@/lib/contentValidation';

export const dynamic = "force-dynamic";

const parseStatus = (value: unknown): ContentStatus => (
    value === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as InterlinearContent;

        if (!body.metadata || !body.data) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const validation = validateContent(body.metadata, body.data);
        if (!validation.isValid) {
            return NextResponse.json({
                error: validation.formError ?? "Invalid content",
                validation,
            }, { status: 400 });
        }

        const content = await getPrisma().content.create({
            data: {
                title: body.metadata.title,
                source_lang: body.metadata.source_lang,
                target_lang: body.metadata.target_lang,
                status: parseStatus(body.metadata.status),
                data: body.data,
            },
        });

        return NextResponse.json(content, { status: 201 });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const contents = await getPrisma().content.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(contents);
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
