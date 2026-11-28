
const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";
const TOKEN = process.env.ACCESS_TOKEN;
const NOTEBOOK_ID = process.env.NOTEBOOK_ID;
const CHAPTER_ID = process.env.CHAPTER_ID;


console.log("1. Script started");

console.log("2. Environment variables:", {
    tokenExists: Boolean(TOKEN),
    notebookExists: Boolean(NOTEBOOK_ID),
    chapterExists: Boolean(CHAPTER_ID)
});

if (!TOKEN || !NOTEBOOK_ID || !CHAPTER_ID) {
    throw new Error(
        "Set ACCESS_TOKEN, NOTEBOOK_ID and CHAPTER_ID first."
    );
}

async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const body = await response.json().catch(() => null);

    return {
        status: response.status,
        body
    };
}



async function main() {

    console.log("3. Main function started");

    const basePath =
        `/notebooks/${NOTEBOOK_ID}/chapters/${CHAPTER_ID}/pages`;

    console.log("4. Sending requests to:", `${API_URL}${basePath}`);

    console.log("5. Sending 10 concurrent requests...");

    // Send ten create requests at approximately the same time.
    const results = await Promise.all(
        Array.from({ length: 10 }, async (_, index) => {
            console.log(`Request ${index + 1} started`);

            try {
                const result = await request(basePath, {
                    method: "POST"
                });

                console.log(
                    `Request ${index + 1} finished:`,
                    result.status
                );

                return result;
            } catch (error) {
                console.error(
                    `Request ${index + 1} failed:`,
                    error
                );

                throw error;
            }
        })
    );

    console.log("6. All requests completed");

    console.table(
        results.map((result, index) => ({
            request: index + 1,
            status: result.status
        }))
    );

    const successful = results.filter(
        result => result.status === 201
    );

    console.log(
        `Successful creates: ${successful.length}/10`
    );

    // Fetch all pages after the concurrent requests finish.
    const listResult = await request(basePath);

    if (listResult.status !== 200) {
        throw new Error(
            `Could not fetch pages. Status: ${listResult.status}`
        );
    }

    // Adjust this extraction if your controller uses a different
    // response property.
    const pages =
        listResult.body?.data?.pages ??
        listResult.body?.pages ??
        listResult.body?.data;

    if (!Array.isArray(pages)) {
        console.log("API response:", listResult.body);
        throw new Error("Could not find the pages array in the response.");
    }

    const positions = pages
        .map(page => page.position)
        .sort((a, b) => a - b);

    console.log("Final positions:", positions);

    const positionsAreContiguous = positions.every(
        (position, index) => position === index
    );

    if (!positionsAreContiguous) {
        throw new Error("Page positions are not contiguous.");
    }

    if (successful.length !== 10) {
        throw new Error(
            "Some concurrent create requests failed. Investigate the responses."
        );
    }

    console.log("Concurrency test passed.");
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});




