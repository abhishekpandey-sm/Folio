import { Chapter, Page, mongoose } from "@folio/database";
import type { UpdatePageInput } from "../validators/page.schema.js";


export async function createPage(
    notebookId: string,
    chapterId: string
) {
    const session = await mongoose.startSession();

    let createdPage = null;

    try {
        await session.withTransaction(async () => {
            // Reset this because the transaction callback may retry.
            createdPage = null;

            const chapterExists = await lockChapterPageStructure(
                notebookId,
                chapterId,
                session
            );

            if (!chapterExists) {
                return;
            }

            const lastPage = await Page.findOne({
                chapterId
            })
                .sort({ position: -1 })
                .select("position")
                .session(session)
                .lean();

            const nextPosition = lastPage
                ? lastPage.position + 1
                : 0;

            const [page] = await Page.create(
                [
                    {
                        chapterId,
                        position: nextPosition,
                        content: []
                    }
                ],
                { session }
            );

            createdPage = page;
        });

        return createdPage;
    } catch (error) {
        console.error("CREATE PAGE TRANSACTION FAILED:", error);
        throw error;
    }finally {
        await session.endSession();
    }
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



export async function deletePage(
    notebookId: string,
    chapterId: string,
    pageId: string
): Promise<boolean> {
    const session = await mongoose.startSession();

    let deleted = false;

    try {
        await session.withTransaction(async () => {
            deleted = false;

            const chapterExists = await lockChapterPageStructure(
                notebookId,
                chapterId,
                session
            );

            if (!chapterExists) {
                return;
            }

            const pages = await Page.find({ chapterId })
                .sort({ position: 1 })
                .session(session);

            const pageIndex = pages.findIndex(
                page => page._id.toString() === pageId
            );

            if (pageIndex === -1) {
                return;
            }

            const highestPosition = pages.length - 1;

            await Page.deleteOne(
                {
                    _id: pageId,
                    chapterId
                },
                { session }
            );

            const remainingPages = pages.filter(
                (_, index) => index !== pageIndex
            );

            // First move every remaining page to temporary positions.
            for (let i = 0; i < remainingPages.length; i++) {
                await Page.updateOne(
                    {
                        _id: remainingPages[i]._id,
                        chapterId
                    },
                    {
                        $set: {
                            position: highestPosition + 1 + i
                        }
                    },
                    { session }
                );
            }

            // Then assign contiguous positions starting at zero.
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


export async function reorderPage(
    notebookId: string,
    chapterId: string,
    pageId: string,
    newPosition: number
): Promise<"success" | "not_found" | "invalid_position"> {
    const session = await mongoose.startSession();

    let result: "success" | "not_found" | "invalid_position" =
        "not_found";

    try {
        await session.withTransaction(async () => {
            result = "not_found";

            const chapterExists = await lockChapterPageStructure(
                notebookId,
                chapterId,
                session
            );

            if (!chapterExists) {
                return;
            }

            const pages = await Page.find({ chapterId })
                .sort({ position: 1 })
                .session(session);

            const currentIndex = pages.findIndex(
                page => page._id.toString() === pageId
            );

            if (currentIndex === -1) {
                return;
            }

            if (
                newPosition < 0 ||
                newPosition >= pages.length
            ) {
                result = "invalid_position";
                return;
            }

            if (currentIndex === newPosition) {
                result = "success";
                return;
            }

            const [movingPage] = pages.splice(currentIndex, 1);

            pages.splice(newPosition, 0, movingPage);

            const highestPosition = pages.length - 1;

            // Phase 1: move all pages to unique temporary positions.
            for (let i = 0; i < pages.length; i++) {
                await Page.updateOne(
                    {
                        _id: pages[i]._id,
                        chapterId
                    },
                    {
                        $set: {
                            position: highestPosition + 1 + i
                        }
                    },
                    { session }
                );
            }

            // Phase 2: assign their final positions.
            for (let i = 0; i < pages.length; i++) {
                await Page.updateOne(
                    {
                        _id: pages[i]._id,
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

            result = "success";
        });

        return result;
    } finally {
        await session.endSession();
    }
}


async function lockChapterPageStructure(
    notebookId: string,
    chapterId: string,
    session: mongoose.ClientSession
) {
    const chapter = await Chapter.findOneAndUpdate(
        {
            _id: chapterId,
            notebookId
        },
        {
            $inc: {
                pageStructureVersion: 1
            }
        },
        {
            session,
            returnDocument: "after"
        }
    )
        .select("_id")
        .lean();

    return chapter !== null;
}


