import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const POST = async (req: NextRequest, res: NextResponse) => {

    // Ensure that the request body is parsed as JSON
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json({
            status: 'not ok',
            message: 'Content type must be application/json',
        });
    }

    // Parse the JSON data from the request body
    const requestBody = await req.json();
    const dataFromBody = requestBody.data;

    console.log(dataFromBody);

    // Ensure data is provided
    if (!dataFromBody) {
        return NextResponse.json({ status: 'not ok', message: 'Data parameter is missing' });
    }

    // Create a file path with a timestamp
    const filePath = `public/file-${Date.now()}.json`;

    // Content you want to write to the file
    const fileContent = JSON.stringify({ data: dataFromBody });

    try {
        // Use the fs module to write to the file synchronously
        fs.writeFileSync(filePath, fileContent);
        console.log('File written successfully!');
        return NextResponse.json({ status: 'ok', message: 'File written successfully!' });
    } catch (err) {
        console.error('Error writing to file:', err);
        return NextResponse.json({ status: 'not ok', message: 'Error writing to file' });
    }
};

export const GET = async (req: NextRequest, res: NextResponse) => {

    const directoryPath = "public/";
    const combinedData: any = {}; // Initialize an empty object to store combined data

    // Wrap the code in a Promise to make it easier to handle asynchronous operations
    const readDirectory = async () => {
        try {
            const files = await fs.promises.readdir(directoryPath);

            // Iterate through each file in the directory
            await Promise.all(files.map(async (file) => {
                const filePath = path.join(directoryPath, file);

                // Read the content of each file
                try {
                    const data = await fs.promises.readFile(filePath, 'utf8');

                    // Parse JSON data
                    const jsonData = JSON.parse(data);

                    // Combine data from each file into the result object
                    combinedData[file] = jsonData;
                } catch (readError) {
                    console.error(`Error reading file ${file}:`, readError);
                }
            }));

            // Log the combined data
            console.log('Combined Data:', combinedData);
            return NextResponse.json(combinedData);
        } catch (err) {
            console.error('Error reading directory:', err);
            return NextResponse.json({ status: 'not ok', message: 'Error reading directory' });
        }
    };

    // Call the async function and return its result
    return await readDirectory();
};