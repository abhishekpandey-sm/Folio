import { Request, Response, NextFunction } from "express";
import { getNotebookRole } from "../services/notebook-permission.service.js";
import { mongoose } from "@folio/database";

type TRequiredRole = "viewer" | "editor"| "owner";

const roleHierchy: Record<TRequiredRole, number> = {
    viewer: 1,
    editor: 2,
    owner: 3
}


export function requireNotebookRole(requiredRole: TRequiredRole){
    return async ( req: Request, res: Response, next: NextFunction ) => {
        try{
            const {notebookId} = req.params;
            const userId = res.locals.userId;

            if(!notebookId){
                return res.status(400).json({
                    success: false,
                    message: "Notebook ID is required"
                })
            }

            if (!mongoose.isValidObjectId(notebookId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid notebook ID"
                });
            }

            if (typeof notebookId !== "string" || !notebookId.trim()) {
                return res.status(400).json({
                   success: false,
                    message: "Invalid Notebook ID"
                 });
            }

            const userRole = await getNotebookRole(notebookId, userId)

            if(!userRole){
                return res.status(404).json({
                    success: false,
                    message: "Notebook not found"
                })
            }

            if( roleHierchy[userRole] < roleHierchy[requiredRole]){
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to perform this action"
                })
            }

            res.locals.notebookRole = userRole;

            next();
        } catch(error){
            console.error("Notebook permission error: ", error)

            return res.status(500).json({
                success: false,
                message: "Failed to verify notebook permissions"
            })
        }
    }
}