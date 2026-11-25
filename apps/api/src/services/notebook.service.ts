import { Notebook } from "@folio/database";
import type { CreateNotebookInputs } from "../validators/notebook.schema.js";

export async function createNotebook(
    userId: string,
    input: CreateNotebookInputs
) {
    const notebook = await Notebook.create({
        ...input,
        ownerId: userId
    })

    return notebook;
}

export async function getUserNotebooks(userId: string){
    const notebooks = await Notebook.find({
        $or: [
            {ownerId: userId},
            {"collaborators.userId": userId}
        ]
    })
    .sort({ updatedAt: -1 })
    .lean();

    return notebooks;
}

export async function getNotebookbyId(notebookId: string){
    const notebook = await Notebook.findById(notebookId).lean();
    
    return notebook; 
}