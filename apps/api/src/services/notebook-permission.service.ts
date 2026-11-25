import {Notebook} from "@folio/database"

type NotebookRole = "owner" | "editor" | "viewer" 

export async function getNotebookRole( notebookId: string, userId: string) : Promise<NotebookRole | null>{
    const notebook = await Notebook.findOne({
        _id: notebookId,
        $or: [
            {ownerId: userId},
            {   
                collaborators: {
                    $elemMatch: { userId }
                }
            }
        ]
    })
    .select("ownerId collaborators")
    .lean();

    if(!notebook){
        return null
    }

    if(notebook.ownerId.toString() === userId){
        return "owner"
    }

    const collaborator = notebook.collaborators.find( (item) => item.userId.toString() === userId )

    if(!collaborator){
        return null
    }

    return collaborator.role === "editor" ? "editor" : "viewer";
}

