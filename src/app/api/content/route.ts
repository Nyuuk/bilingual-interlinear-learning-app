import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { InterlinearContent } from '@/types';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as InterlinearContent;

        if (!body.metadata || !body.data) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const content = await getPrisma().content.create({
            data: {
                title: body.metadata.title,
                source_lang: body.metadata.source_lang,
                target_lang: body.metadata.target_lang,
                data: body.data as any, // Prisma Json field
            }
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
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
