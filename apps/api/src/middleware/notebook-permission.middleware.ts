
import { Request, Response, NextFunction } from "express";
import { mongoose } from "@folio/database";
import { getNotebookRole } from "../services/notebook-permission.service.js";

type RequiredRole = "viewer" | "editor" | "owner";

const roleHierarchy: Record<RequiredRole, number> = {
    viewer: 1,
    editor: 2,
    owner: 3
};

export function requireNotebookRole(requiredRole: RequiredRole) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const rawNotebookId = req.params.notebookId;
            const userId = res.locals.userId;

            if (typeof rawNotebookId !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Invalid notebook ID"
                });
            }

            const notebookId = rawNotebookId.trim();



            if (!notebookId) {
                return res.status(400).json({
                    success: false,
                    message: "Notebook ID is required"
                });
            }

            if (!mongoose.isObjectIdOrHexString(notebookId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid notebook ID",
                    receivedId: notebookId,
                    receivedLength: notebookId.length
                });
            }

            const userRole = await getNotebookRole(notebookId, userId);

            if (!userRole) {
                return res.status(404).json({
                    success: false,
                    message: "Notebook not found"
                });
            }

            if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
                return res.status(403).json({
                    success: false,
                    message: "You don't have permission to perform this action"
                });
            }

            res.locals.notebookRole = userRole;
            next();

        } catch (error) {
            console.error("Notebook permission error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to verify notebook permissions"
            });
        }
    };
}
