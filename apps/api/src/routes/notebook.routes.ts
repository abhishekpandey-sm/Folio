import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createNotebookController, getUserNotebooksController, deleteNotebookController, updateNotebookController, getNotebookController } from "../controllers/notebook.controller.js";
import { requireNotebookRole } from "../middleware/notebook-permission.middleware.js";
import { createChapterController, getNotebookChaptersController, getChapterController, updateChapterController, deleteChapterController, reorderChapterController } from "../controllers/chapter.controller.js";

const notebookRouter = Router()

notebookRouter.post(
    "/",
    authenticate,
    createNotebookController
)

notebookRouter.get(
    "/",
    authenticate,
    requireNotebookRole("viewer"),
    getUserNotebooksController
)

notebookRouter.get(
    "/:notebookId",
    authenticate,
    requireNotebookRole("viewer"),
    getNotebookController
)


notebookRouter.patch(
    "/:notebookId",
    authenticate,
    requireNotebookRole("editor"),
    updateNotebookController
);

notebookRouter.delete(
    "/:notebookId",
    authenticate,
    requireNotebookRole("owner"),
    deleteNotebookController
)

notebookRouter.post(
    "/:notebookId/chapters",
    authenticate,
    requireNotebookRole("editor"),
    createChapterController
)

notebookRouter.get(
    "/:notebookId/chapters",
    authenticate,
    requireNotebookRole("viewer"),
    getNotebookChaptersController
)

notebookRouter.get(
    "/:notebookId/chapters/:chapterId",
    authenticate,
    requireNotebookRole("viewer"),
    getChapterController
)

notebookRouter.patch(
    "/:notebookId/chapters/:chapterId",
    authenticate,
    requireNotebookRole("editor"),
    updateChapterController
)

notebookRouter.delete(
    "/:notebookId/chapters/:chapterId",
    authenticate,
    requireNotebookRole("owner"),
    deleteChapterController
)

notebookRouter.patch(
    "/:notebookId/chapters/:chapterId/reorder",
    authenticate,
    requireNotebookRole("editor"),
    reorderChapterController
);

export default notebookRouter;