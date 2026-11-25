import { z } from "zod";

export const createNotebookSchema = z.object({
    title: z.string()
        .trim()
        .min(1, "Notebook title is required")
        .max(100),
    
    description: z.string()
        .trim()
        .max(500)
        .optional(),

    type: z.enum(['structured', "scrapbook"])
        .default("structured"),
    
    pageSettings: z.object({
        size: z.enum(["A4", "A5", "letter", "custom"])
            .default("A4"),
        width: z.number().positive().optional(),
        height: z.number().positive().optional(),
        unit: z.enum(['mm', 'in'])
            .default('mm')
    }).optional()
}).superRefine((data, ctx) => {
    if(data.pageSettings?.size == "custom"){
        if(!data.pageSettings.width || !data.pageSettings.height){
            ctx.addIssue({
                code: "custom",
                message: "Custom page size requires"
            })
        }
    }
})

export type CreateNotebookInputs = z.infer<typeof createNotebookSchema>
