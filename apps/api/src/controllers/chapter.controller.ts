import { Request, Response } from "express";
import { createChapterSchema, updateChapterSchema, reorderChapterSchema} from "../validators/chapter.schema.js";
import { createChapter, getNotebookChapters, getChapterById, updateChapter, deleteChapter, reorderChapter } from "../services/chapter.service.js";


export async function createChapterController(
    req: Request,
    res: Response
) {
    try{
        const rawNotebookId = req.params.notebookId;

        if(typeof rawNotebookId !== "string"){
            return res.status(400).json({
                success: false,
                message: "Invalid NotebookId"
            })
        }

        const notebookId = rawNotebookId.trim();

        const result = createChapterSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            })
        }

        const chapter = await createChapter(
            notebookId,
            result.data
        )

        return res.status(201).json({
            success: true,
            message: "Chapter created successfully",
            chapter
        })
    } catch(error){
        console.error("Create chapter error: ", error)

        return res.status(500).json({
            success: false,
            message: "Failed to create chapter"
        })
    }
}

export async function getNotebookChaptersController(
    req: Request,
    res: Response
) {
    try {
        const rawNotebookId = req.params.notebookId;

        if (typeof rawNotebookId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid notebook ID"
            });
        }

        const notebookId = rawNotebookId.trim();

        const chapters = await getNotebookChapters(notebookId);

        return res.status(200).json({
            success: true,
            message: "Chapters fetched successfully",
            count: chapters.length,
            chapters
        });

    } catch (error) {
        console.error("Get notebook chapters error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch chapters"
        });
    }
}

export async function getChapterController(
    req: Request,
    res: Response
){
    try{
        const rawNotebookId = req.params.notebookId;
        const rawChapterId = req.params.chapterId;

        if( typeof rawNotebookId !== "string" || typeof rawChapterId !== "string"){
            return res.status(400).json({
                success: false,
                message: 'Invalid notebook or chapter Id'
            })
        }

        const notebookId = rawNotebookId.trim();
        const chapterId = rawChapterId.trim();

        const chapter = await getChapterById(notebookId, chapterId);

        if(!chapter){
            return res.status(404).json({
                success: false,
                message: "Chapter not found"
            })
        }

        return res.status(201).json({
            success: true,
            message: "Chapter fetched successfully",
            chapter
        })
    } catch(error){
        console.error("Get chapter error: ", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch chapter"
        })
    }
}

export async function updateChapterController(
    req: Request,
    res: Response
) {
    try {
        const { notebookId: rawNotebookId, chapterId: rawChapterId } = req.params;

        if( typeof rawNotebookId !== "string" || typeof rawChapterId !== "string"){
            return res.status(400).json({
                success: false,
                message: "Invalid notebook or chapter Id"
            })
        }

        const notebookId = rawNotebookId.trim()
        const chapterId = rawChapterId.trim()

        const result = updateChapterSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            })
        }

        const updatedChapter = await updateChapter(
            notebookId,
            chapterId,
            result.data
        )

        if(!updatedChapter){
            return res.status(404).json({
                success: false,
                message: "Chapter not found"
            })
        }

        return res.status(201).json({
            success: true,
            message: "Chapter updated successfully",
            chapter: updatedChapter
        })
    } catch(error){
        console.error("Update chapter error: ", error)

        return res.status(500).json({
            success: false,
            message: "Failed to update chapter"
        })
    }
}

export async function deleteChapterController(req: Request, res: Response) {
    try{
        const { notebookId: rawNotebookId, chapterId: rawChapterId } = req.params;

        if (
            typeof rawNotebookId !== "string" ||
            typeof rawChapterId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid notebook or chapter ID"
            });
        }

        const notebookId = rawNotebookId.trim();
        const chapterId = rawChapterId.trim();

        if (!notebookId || !chapterId) {
            return res.status(400).json({
                success: false,
                message: "Notebook ID and chapter ID are required"
            });
        }

        const deleted = await deleteChapter(notebookId, chapterId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Chapter not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Chapter and its pages deleted successfully"
        });

    } catch (error) {
        console.error("Delete chapter error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete chapter"
        });
    }
}

export async function reorderChapterController(
    req: Request,
    res: Response
) {
    try {
        const { notebookId: rawNotebookId, chapterId: rawChapterId } = req.params;

        if (
            typeof rawNotebookId !== "string" || typeof rawChapterId !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid notebook or chapter ID"
            });
        }

        const notebookId = rawNotebookId.trim();
        const chapterId = rawChapterId.trim();

        if (!notebookId || !chapterId) {
            return res.status(400).json({
                success: false,
                message: "Notebook ID and chapter ID are required"
            });
        }

        const result = reorderChapterSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            });
        }

        const outcome = await reorderChapter(
            notebookId,
            chapterId,
            result.data.position
        );

        if (outcome === "not_found") {
            return res.status(404).json({
                success: false,
                message: "Chapter not found"
            });
        }

        if (outcome === "invalid_position") {
            return res.status(400).json({
                success: false,
                message: "Invalid chapter position"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Chapter reordered successfully"
        });

    } catch (error) {
        console.error("Reorder chapter error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reorder chapter"
        });
    }
}