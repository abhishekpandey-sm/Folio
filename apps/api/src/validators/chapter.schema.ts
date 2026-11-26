
import { z } from "zod";

export const createChapterSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Chapter title is required")
        .max(100),

    description: z.string()
        .trim()
        .max(500)
        .optional()
});

export const updateChapterSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Chapter title cannot be empty")
        .max(100)
        .optional(),
    
    description: z.string()
        .trim()
        .max(500)
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided"
    }
)

export const reorderChapterSchema = z.object({
    position: z.number()
            .int("Position must be an integer")
            .min(0, "Position cannot be negative")
})

export type CreateChapterInput = z.infer<
    typeof createChapterSchema
>;

export type UpdateChapterInput = z.infer<
    typeof updateChapterSchema
>;

export type ReorderChapterSchema = z.infer<
    typeof reorderChapterSchema
>


