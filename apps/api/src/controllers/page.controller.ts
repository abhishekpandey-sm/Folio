import { Request, Response } from "express";
import { mongoose } from "@folio/database";
import { createPage, getChapterPages, getPageById, updatePage, deletePage, reorderPage } from "../services/page.service.js";
import { updatePageSchema, reorderPageSchema } from "../validators/page.schema.js";

export async function createPageController(
    req: Request,
    res: Response
){
    try{
        const { notebookId: rawNotebookId, chapterId: rawChapterId } = req.params;

        if( typeof rawNotebookId !== "string" || typeof rawChapterId !== "string" ){
            return res.status(400).json({
                success: false,
                message: "Invalid notebook or chapter ID"
            })
        }

        const notebookId = rawNotebookId.trim();
        const chapterId = rawChapterId.trim();

        if( !mongoose.isObjectIdOrHexString(notebookId) || !mongoose.isObjectIdOrHexString(chapterId) ){
            return res.status(400).json({
                success: false,
                message: "Invalid notebook or chapter ID"
            })
        }

        const page = await createPage(notebookId, chapterId);

         if (!page) {
            return res.status(404).json({
                success: false,
                message: "Chapter not found in this notebook"
            });
        }
    } catch(error){
        console.error("Create page error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create page"
        });
    }
}


export async function getChapterPagesController(req: Request, res: Response) {
    try {
        const { notebookId: rawNotebookId, chapterId: rawChapterId } = req.params;


        if ( typeof rawNotebookId !== "string" || typeof rawChapterId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid notebook or chapter ID"
            });
        }

        const notebookId = rawNotebookId.trim();
        const chapterId = rawChapterId.trim();


        if ( !mongoose.isObjectIdOrHexString(notebookId) || !mongoose.isObjectIdOrHexString(chapterId) ) {
            return res.status(400).json({
                success: false,
                message: "Invalid notebook or chapter ID"
            });
        }

        const pages = await getChapterPages(notebookId, chapterId);

        if (pages === null) {
            return res.status(404).json({
                success: false,
                message: "Chapter not found in this notebook"
            });
        }

        return res.status(200).json({
            success: true,
            count: pages.length,
            pages
        });

    } catch (error) {
        console.error("Get chapter pages error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve chapter pages"
        });
    }
}

export async function getPageController( req: Request, res: Response ) {
    try {
        const { notebookId: rawNotebookId, chapterId: rawChapterId, pageId: rawPageId } = req.params;

        if ( typeof rawNotebookId !== "string" || typeof rawChapterId !== "string" || typeof rawPageId !== "string" ) {
            return res.status(400).json({
                success: false,
                message: "Invalid notebook, chapter or page ID"
            });
        }

        const notebookId = rawNotebookId.trim();
        const chapterId = rawChapterId.trim();
        const pageId = rawPageId.trim();

        if ( !mongoose.isObjectIdOrHexString(notebookId) || !mongoose.isObjectIdOrHexString(chapterId) || !mongoose.isObjectIdOrHexString(pageId) ) {
            return res.status(400).json({
                success: false,
                message: "Invalid notebook, chapter or page ID"
            });
        }

        const page = await getPageById(
            notebookId,
            chapterId,
            pageId
        );

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Page or chapter not found"
            });
        }

        return res.status(200).json({
            success: true,
            page
        });

    } catch (error) {
        console.error("Get page error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve page"
        });
    }
}


export async function updatePageController( req: Request, res: Response) {
    try {
        const { notebookId, chapterId, pageId } = req.params;

        if ( typeof notebookId !== "string" || typeof chapterId !== "string" || typeof pageId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid page parameters"
            });
        }

        const ids = [notebookId, chapterId, pageId].map(id => id.trim());

        if (ids.some(id => !mongoose.isObjectIdOrHexString(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format"
            });
        }

        const parsedBody = updatePageSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid page content",
                errors: parsedBody.error.issues
            });
        }

        const updatedPage = await updatePage(
            ids[0],
            ids[1],
            ids[2],
            parsedBody.data
        );

        if (!updatedPage) {
            return res.status(404).json({
                success: false,
                message: "Page or chapter not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Page updated successfully",
            page: updatedPage
        });

    } catch (error) {
        console.error("Update page error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update page"
        });
    }
}


export async function deletePageController( req: Request, res: Response ) {
    try {
        const { notebookId, chapterId, pageId } = req.params;

        if (
            typeof notebookId !== "string" ||
            typeof chapterId !== "string" ||
            typeof pageId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page parameters"
            });
        }

        const ids = [notebookId, chapterId, pageId]
            .map(id => id.trim());

        if (ids.some(id => !mongoose.isObjectIdOrHexString(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format"
            });
        }

        const deleted = await deletePage(
            ids[0],
            ids[1],
            ids[2]
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Page or chapter not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Page deleted successfully"
        });

    } catch (error) {
        console.error("Delete page error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete page"
        });
    }
}


export async function reorderPageController( req: Request, res: Response) {
    try {
        const { notebookId, chapterId, pageId } = req.params;

        if (
            typeof notebookId !== "string" ||
            typeof chapterId !== "string" ||
            typeof pageId !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page parameters"
            });
        }

        const ids = [notebookId, chapterId, pageId]
            .map(id => id.trim());

        if (ids.some(id => !mongoose.isObjectIdOrHexString(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format"
            });
        }

        const parsedBody = reorderPageSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid page position",
                errors: parsedBody.error.issues
            });
        }

        const result = await reorderPage(
            ids[0],
            ids[1],
            ids[2],
            parsedBody.data.position
        );

        if (result === "not_found") {
            return res.status(404).json({
                success: false,
                message: "Page or chapter not found"
            });
        }

        if (result === "invalid_position") {
            return res.status(400).json({
                success: false,
                message: "Position is outside the valid page range"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Page reordered successfully"
        });

    } catch (error) {
        console.error("Reorder page error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to reorder page"
        });
    }
}

