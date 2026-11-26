import { Chapter, Page, mongoose } from "@folio/database";
import type { CreateChapterInput, UpdateChapterInput } from "../validators/chapter.schema.js";

export async function createChapter(
    notebookId: string,
    input: CreateChapterInput
) {
    const lastChapter = await Chapter.findOne({ notebookId })
        .sort({ position: -1 })
        .select("position")
        .lean();

    const nextPosition = lastChapter
        ? lastChapter.position + 1
        : 0;

    const chapter = await Chapter.create({
        notebookId,
        title: input.title,
        description: input.description ?? "",
        position: nextPosition
    });

    return chapter;
}


export async function getNotebookChapters(notebookId: string) {
    const chapters = await Chapter.find({ notebookId })
        .sort({ position: 1 })
        .lean();

    return chapters;
}

export async function getChapterById(
    notebookId: string,
    chapterId: string
){
    const chapter = await Chapter.findOne({
        _id: chapterId,
        notebookId
    }).lean()

    return chapter;
}

export async function updateChapter(
    notebookId: string,
    chapterId: string,
    input: UpdateChapterInput
){
    const updatedChapter = await Chapter.findOneAndUpdate(
        {
            _id: chapterId,
            notebookId
        },{
            $set: input
        },{
            returnDocument: "after",
            runValidators: true
        }
    ).lean();

    return updatedChapter;
}

export async function deleteChapter(
    notebookId: string,
    chapterId: string
) {
    const session = await mongoose.startSession();

    try{
        let deleted = false;

        await session.withTransaction(async () => {
            const chapter = await Chapter.findOne({
                _id: chapterId,
                notebookId
            }).session(session);

            if(!chapter){
                return;
            }

            await Page.deleteMany({
                chapterId: chapter._id
            }).session(session)

            await Chapter.deleteOne({
                _id: chapterId,
                notebookId
            }).session(session)

            deleted = true;
        })
        
        return deleted;

    } finally{
        await session.endSession()
    }
}


export async function reorderChapter(
    notebookId: string,
    chapterId: string,
    newPosition: number
): Promise<"success" | "not_found" | "invalid_position"> {
    const session = await mongoose.startSession()

    try{
        let outcome: "success" | "not_found" | "invalid_position" = "not_found";

        await session.withTransaction(async () => {

            const chapters = await Chapter.find({ notebookId })
                .sort({ position: 1 })
                .session(session);

            const currentIndex = chapters.findIndex(
                chapter => chapter._id.toString() === chapterId
            );

            if(currentIndex === -1){
                outcome = "not_found";
                return;
            }

            if(newPosition > chapters.length){
                outcome = "invalid_position"
                return;
            }

            const reordered = [...chapters];

            const [chapterToMove] = reordered.splice(currentIndex, 1)

            reordered.splice(newPosition, 0, chapterToMove);

            //Phase 1:  Move every chapter to a temporary position.

            const highestPosition = Math.max(
                ...chapters.map(chapter => chapter.position)
            );

            const temporaryStart = highestPosition + 1;

            for (let i = 0; i < reordered.length; i++) {
                await Chapter.updateOne(
                    {
                        _id: reordered[i]._id,
                        notebookId
                    },
                    {
                        $set: { position: temporaryStart + i }
                    },
                    { session }
                );
            }

            // Phase 2: Assign the final positions.

            for (let i = 0; i < reordered.length; i++) {
                await Chapter.updateOne(
                    {
                        _id: reordered[i]._id,
                        notebookId
                    },
                    {
                        $set: { position: i }
                    },
                    { session }
                );
            }

            outcome = "success";
        });

        return outcome;

    } finally {
        await session.endSession();
    }
}