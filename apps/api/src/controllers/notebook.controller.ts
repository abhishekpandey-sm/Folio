import { Request, Response } from "express";
import { createNotebookSchema, updateNotebookSchema } from "../validators/notebook.schema.js";
import { getUserNotebooks, getNotebookbyId, createNotebook, updateNotebook, deleteNotebook } from "../services/notebook.service.js";

export async function createNotebookController(
    req: Request,
    res: Response
) {
    try{
        const parsed = createNotebookSchema.safeParse(req.body)

        if(!parsed.success){
            return res.status(400).json({
                success: true,
                message: "Invalid notebook data",
                error: parsed.error.issues
            })
        }

        const userId = res.locals.userId;

        const notebook = await createNotebook(userId, parsed.data);

        return res.status(201).json({
            success: true,
            message: "Notebook created successfully",
            notebook
        })
    } catch(error){
        console.error("Create notebook error:", error);

        return res.status(500).json({
            success: true,
            message: "Failed to create notebook"
        })

    }
}

export async function getUserNotebooksController(
    req: Request,
    res: Response
) {
    try{
        const userId = res.locals.userId;

        const notebooks = await getUserNotebooks(userId);

        return res.status(200).json({
            success: true,
            count: notebooks.length,
            notebooks
        })
    } catch(error) {
        console.error("Get notebooks error: ", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve notebooks"
        })
    }
}

export async function getNotebookController(
    req: Request,
    res: Response
) {
    try {
        const { notebookId } = req.params;

        if (typeof notebookId !== "string"){
            throw new Error("Invalid notebook ID");
        }

        const notebook = await getNotebookbyId(notebookId);

        if(!notebook){
            return res.status(200).json({
                success: false,
                message: "Notebook note found"
            })
        }

        return res.status(200).json({
            success: true,
            notebook,
            role: res.locals.notebook
        })
    } catch(error){
        console.error("Get notebook error: ", error);

        return res.status(500).json({
            success: false,
            message: "Failde to retrieve notebook"
        })
    }
}

export async function updateNotebookController(
    req: Request,
    res: Response
) {
    try{
        const { notebookId } = req.params;
        const parsed = updateNotebookSchema.safeParse(req.body)

        if (typeof notebookId !== "string"){
            throw new Error("Invalid notebook ID");
        }

        if(!parsed.success){
            return res.status(400).json({
                success: false,
                message: "Invalid notebook data",
                errors: parsed.error.issues
            })
        }

        const updatedNotebook = await updateNotebook(
            notebookId,
            parsed.data
        )        

        if(!updatedNotebook){
            return res.status(404).json({
                success: false,
                message: "Notebook not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Notebook updated successfully",
            notebook: updatedNotebook
        })
    } catch(error){
        console.error("Updated notebook error: ", error)

        return res.status(500).json({
            success: false,
            message: "Failed to update notebook"
        })
    }
}

export async function deleteNotebookController(
    req: Request,
    res: Response
){
    try {
        const rawNotebookId = req.params.notebookId;

        if (typeof rawNotebookId !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid notebook ID"
            });
        }

        const deleted = await deleteNotebook(rawNotebookId);

        if(!deleted){
            return res.status(404).json({
                success: false,
                message: "Notebook not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Notebook and its chapters and pages deleted successfully"
        })
    } catch(error){
        console.error("Delete notebook error: ", error)

        return res.status(500).json({
            success: false,
            message: "Failed to delete Notebook"
        })
    }
}   