import { Notebook, Chapter, Page, mongoose } from "@folio/database";
import type { CreateNotebookInputs, UpdateNotebookInput } from "../validators/notebook.schema.js";


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

export async function updateNotebook(
    notebookId: string,
    input: UpdateNotebookInput
){
    const updatedNotebook = await Notebook.findByIdAndUpdate(
        notebookId,
        {
            $set: input
        },
        {
            new: true,
            runValidators: true
        }
    ).lean();

    return updatedNotebook;
}

export async function deleteNotebook( notebookId: string ){
    const session = await mongoose.startSession()

    try{
        let deleted = false;

        await session.withTransaction(async () => {
            const chapters = await Chapter.find({notebookId})
                            .select("_id")
                            .session(session)
                    
            const chapterIds = chapters.map(
                (chapter) => chapter.id
            )

            if(chapterIds.length > 0){
                await Page.deleteMany({
                    chapterId: { $in: chapterIds}
                }).session(session)
            }

            await Chapter.deleteMany({
                notebookId
            }).session(session)

            const result = await Notebook.deleteOne({
                _id: notebookId
            }).session(session)

            deleted = result.deletedCount === 1;
        })

        return deleted;

    } finally {
        await session.endSession()
    }
}