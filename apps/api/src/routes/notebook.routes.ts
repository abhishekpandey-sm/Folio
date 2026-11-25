import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createNotebookController } from "../controllers/notebook.controller.js";
import { getNotebookContrller } from "../controllers/notebook.controller.js";
import { requireNotebookRole } from "../middleware/notebook-permission.middleware.js";

const notebookRouter = Router()

notebookRouter.post(
    "/",
    authenticate,
    createNotebookController
)

notebookRouter.get(
    "/:notebookId",
    authenticate,
    requireNotebookRole("viewer"),
    getNotebookContrller
)

export default notebookRouter;