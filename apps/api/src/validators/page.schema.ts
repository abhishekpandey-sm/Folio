
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
    }).strict()
}).strict();

const paragraphBlockSchema = z.object({
    type: z.literal("paragraph"),
    data: z.object({
        text: z.string().max(10000)
    }).strict()
}).strict();

const imageBlockSchema = z.object({
    type: z.literal("image"),
    data: z.object({
        key: z.string().min(1),
        alt: z.string().max(500).default(""),
        caption: z.string().max(1000).optional()
    }).strict()
}).strict();

const codeBlockSchema = z.object({
    type: z.literal("code"),
    data: z.object({
        code: z.string().max(20000),
        language: z.string().max(50).optional()
    }).strict()
}).strict();

const listBlockSchema = z.object({
    type: z.literal("list"),
    data: z.object({
        items: z.array(
            z.string().min(1).max(2000)
        ).min(1).max(500),
        ordered: z.boolean()
    }).strict()
}).strict();

const tableBlockSchema = z.object({
    type: z.literal("table"),
    data: z.object({
        rows: z.array(
            z.array(z.string().max(2000)).min(1).max(50)
        ).min(1).max(500)
    }).strict()
}).strict();

export const contentBlockSchema = z.discriminatedUnion("type", [
    headingBlockSchema,
    paragraphBlockSchema,
    imageBlockSchema,
    codeBlockSchema,
    listBlockSchema,
    tableBlockSchema
]);

export type ContentBlock = z.infer<typeof contentBlockSchema>;

export const updatePageSchema = z.object({
    content: z.array(contentBlockSchema).max(500)
}).strict();

export type UpdatePageInput = z.infer<typeof updatePageSchema>;

export const reorderPageSchema = z.object({
    position: z.number().int().min(0)
}).strict();

export type ReorderPageInput = z.infer<typeof reorderPageSchema>;
