import { z } from "zod";

const headingBlockSchema = z.object({
    type: z.literal("heading"),
    data: z.object({
        text: z.string().trim().min(1).max(500),
        level: z.union([
            z.literal(1),
            z.literal(2),
            z.literal(3)
        ])
    })
});

const paragraphBlockSchema = z.object({
    type: z.literal("paragraph"),
    data: z.object({
        text: z.string().max(10000)
    })
});

const imageBlockSchema = z.object({
    type: z.literal("image"),
    data: z.object({
        key: z.string().min(1),
        alt: z.string().max(500).default(""),
        caption: z.string().max(1000).optional()
    })
});

const codeBlockSchema = z.object({
    type: z.literal("code"),
    data: z.object({
        code: z.string().max(20000),
        language: z.string().max(50).optional()
    })
});

const listBlockSchema = z.object({
    type: z.literal("list"),
    data: z.object({
        items: z.array(z.string().min(1).max(2000)).min(1).max(500),
        ordered: z.boolean()
    })
});

const tableBlockSchema = z.object({
    type: z.literal("table"),
    data: z.object({
        rows: z.array(
            z.array(z.string().max(2000)).min(1).max(50)
        ).min(1).max(500)
    })
});

export const contentBlockSchema = z.discriminatedUnion("type", [
    headingBlockSchema,
    paragraphBlockSchema,
    imageBlockSchema,
    codeBlockSchema,
    listBlockSchema,
    tableBlockSchema
]);


export const updatePageSchema = z.object({
    content: z.array(contentBlockSchema).max(500)
});


export const reorderPageSchema = z.object({
    position: z.number()
        .int("Position must be an integer")
        .min(0, "Position cannot be negative")
});


export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type ReorderPageInput = z.infer<typeof reorderPageSchema>;




