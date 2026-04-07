import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getPrisma } from '@/lib/prisma';
import { ContentStatus, InterlinearContent } from '@/types';
import { normalizeInterlinearPairs, validateContent } from '@/lib/contentValidation';

export const dynamic = "force-dynamic";

const parseStatus = (value: unknown): ContentStatus => (
    value === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
);

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const content = await getPrisma().content.findUnique({
            where: { id }
        });

        if (!content) {
            return NextResponse.json({ error: "Not Found" }, { status: 404 });
        }

        return NextResponse.json(content);
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json() as Partial<InterlinearContent['metadata']> & {
            data?: InterlinearContent['data'];
        };

        const updateData: Record<string, unknown> = {};

        if (typeof body.title === 'string') updateData.title = body.title;
        if (typeof body.source_lang === 'string') updateData.source_lang = body.source_lang;
        if (typeof body.target_lang === 'string') updateData.target_lang = body.target_lang;
        if (body.status) updateData.status = parseStatus(body.status);
        if (body.data) updateData.data = body.data as unknown as Prisma.InputJsonValue;

        if (
            typeof body.title === 'string' ||
            typeof body.source_lang === 'string' ||
            typeof body.target_lang === 'string' ||
            Array.isArray(body.data)
        ) {
            const existing = await getPrisma().content.findUnique({ where: { id } });

            if (!existing) {
                return NextResponse.json({ error: "Not Found" }, { status: 404 });
            }

            const validation = validateContent({
                title: typeof body.title === 'string' ? body.title : existing.title,
                source_lang: typeof body.source_lang === 'string' ? body.source_lang : existing.source_lang,
                target_lang: typeof body.target_lang === 'string' ? body.target_lang : existing.target_lang,
                status: parseStatus(body.status ?? (existing as { status?: unknown }).status),
            }, Array.isArray(body.data) ? body.data : normalizeInterlinearPairs(existing.data));

            if (!validation.isValid) {
                return NextResponse.json({
                    error: validation.formError ?? "Invalid content",
                    validation,
                }, { status: 400 });
            }
        }

        const updated = await getPrisma().content.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await getPrisma().content.delete({
            where: { id }
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
