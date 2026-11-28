import { Chapter, Page, mongoose } from "@folio/database";
import type { UpdatePageInput } from "../validators/page.schema.js";

export async function createPage( notebookId: string, chapterId: string){
    const chapter = await Chapter.findOne({
        _id: chapterId,
        notebookId
    }).select("_id").lean()

    if(!chapter){
        return null;
    }

    const lastPage = await Page.findOne({ chapterId })
        .sort({ position : -1 })
        .select("position")
        .lean()

    const nextPosition = lastPage
        ? lastPage.position + 1
        : 0
        
    const page = await Page.create({
        chapterId,
        position: nextPosition,
        content: []
    })

    return page;
}


export async function getChapterPages( notebookId: string, chapterId: string ) {
    const chapter = await Chapter.findOne({
        _id: chapterId,
        notebookId
    }).select("_id").lean();

    if (!chapter) {
        return null;
    }

    const pages = await Page.find({ chapterId })
        .sort({ position: 1 })
        .lean();

    return pages;
}


export async function getPageById( notebookId: string, chapterId: string, pageId: string ) {

    const chapter = await Chapter.findOne({
        _id: chapterId,
        notebookId
    }).select("_id").lean();

    if(!chapter)   return null;

    const page = await Page.findOne({
        _id: pageId,
        chapterId
    }).lean();

    return page;
}


export async function updatePage( notebookId: string, chapterId: string, pageId: string, input: UpdatePageInput) {

    const chapter = await Chapter.findOne({
        _id: chapterId,
        notebookId
    }).select("_id").lean();

    if (!chapter) return null;

    const updatedPage = await Page.findOneAndUpdate(
        {
            _id: pageId,
            chapterId
        },
        {
            $set: {
                content: input.content
            }
        },
        {
            returnDocument: "after",
            runValidators: true
        }
    ).lean();

    return updatedPage;
}



export async function deletePage( notebookId: string, chapterId: string, pageId: string ): Promise<boolean> {

    const session = await mongoose.startSession();

    try {
        let deleted = false;

        await session.withTransaction(async () => {

            const chapter = await Chapter.findOne({
                _id: chapterId,
                notebookId
            }).session(session);

            if (!chapter) return;

            const pages = await Page.find({ chapterId })
                .sort({ position: 1 })
                .session(session);

            const pageToDelete = pages.find(
                page => page._id.toString() === pageId
            );

            if (!pageToDelete) return;

            await Page.deleteOne({
                _id: pageId,
                chapterId
            }).session(session);

            const remainingPages = pages.filter(
                page => page._id.toString() !== pageId
            );

            const highestPosition = Math.max(
                ...pages.map(page => page.position)
            );

            const temporaryStart = highestPosition + 1;

            for (let i = 0; i < remainingPages.length; i++) {
                await Page.updateOne(
                    {
                        _id: remainingPages[i]._id,
                        chapterId
                    },
                    {
                        $set: {
                            position: temporaryStart + i
                        }
                    },
                    { session }
                );
            }

            for (let i = 0; i < remainingPages.length; i++) {
                await Page.updateOne(
                    {
                        _id: remainingPages[i]._id,
                        chapterId
                    },
                    {
                        $set: {
                            position: i
                        }
                    },
                    { session }
                );
            }

            deleted = true;
        });

        return deleted;

    } finally {
        await session.endSession();
    }
}


export async function reorderPage( notebookId: string, chapterId: string, pageId: string, newPosition: number ): Promise<"success" | "not_found" | "invalid_position"> {

    const session = await mongoose.startSession();

    try {
        let outcome: "success" | "not_found" | "invalid_position" = "not_found";

        await session.withTransaction(async () => {

            const chapter = await Chapter.findOne({
                _id: chapterId,
                notebookId
            }).session(session);

            if (!chapter) {
                outcome = "not_found";
                return;
            }

            const pages = await Page.find({ chapterId })
                .sort({ position: 1 })
                .session(session);

            const currentIndex = pages.findIndex(
                page => page._id.toString() === pageId
            );

            if (currentIndex === -1) {
                outcome = "not_found";
                return;
            }

            if (newPosition >= pages.length) {
                outcome = "invalid_position";
                return;
            }

            // No need to update anything if the page is already there.
            if (currentIndex === newPosition) {
                outcome = "success";
                return;
            }

            // 5. Create the new order in memory.
            const reordered = [...pages];

            const [pageToMove] = reordered.splice(currentIndex, 1);

            reordered.splice(newPosition, 0, pageToMove);

            // 6. Move every page to temporary positions.
            const highestPosition = Math.max(
                ...pages.map(page => page.position)
            );

            const temporaryStart = highestPosition + 1;

            for (let i = 0; i < reordered.length; i++) {
                await Page.updateOne(
                    {
                        _id: reordered[i]._id,
                        chapterId
                    },
                    {
                        $set: {
                            position: temporaryStart + i
                        }
                    },
                    { session }
                );
            }

            // 7. Assign final positions: 0, 1, 2...
            for (let i = 0; i < reordered.length; i++) {
                await Page.updateOne(
                    {
                        _id: reordered[i]._id,
                        chapterId
                    },
                    {
                        $set: {
                            position: i
                        }
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
