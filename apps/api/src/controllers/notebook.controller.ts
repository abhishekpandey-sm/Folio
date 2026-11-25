import { Request, Response } from "express";
import { createNotebookSchema } from "../validators/notebook.schema.js";
import { getUserNotebooks, getNotebookbyId, createNotebook } from "../services/notebook.service.js";

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

export async function getNotebookContrller(
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