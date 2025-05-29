import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import {
    AzureKey,
    ContainerName,
    Endpoint,
    SasToken,
    StorageAccountName,
    UPLOAD_URL
} from '../config';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const UploadToAzure = async (file: File): Promise<string> => {
    // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
    const blobService = new BlobServiceClient(UPLOAD_URL);

    // get Container - full public read access
    const containerClient: ContainerClient = blobService.getContainerClient(ContainerName);

    const uploadFileToBlob = async (file: File | null): Promise<string> => {
        if (!file) return '';
        // upload file
        const file_url = await createBlobInContainer(file);
        return file_url;
    };

    const createBlobInContainer = async (file: File): Promise<string> => {
        // create blobClient for container
        const blobClient = containerClient.getBlockBlobClient(file.name);
        // set mimetype as determined from browser with file upload control
        const options = { blobHTTPHeaders: { blobContentType: file.type } };
        // upload file
        await blobClient.uploadData(file, options);
        const blobProperties = await blobClient.getProperties();
        console.log(blobClient.url);
        // setAzureFileUrl(blobClient.url);
        return blobClient.url;
    };

    const getBlobsInContainer = async () => {
        const returnedBlobUrls = [];

        // get list of blobs in container
        // eslint-disable-next-line
        for await (const blob of containerClient.listBlobsFlat()) {
            console.log(`${blob.name}`);

            const blobItem = {
                url: `https://${StorageAccountName}.blob.core.windows.net/${ContainerName}/${blob.name}?${SasToken}`,
                name: blob.name
            };

            // if image is public, just construct URL
            returnedBlobUrls.push(blobItem);
        }

        return returnedBlobUrls;
    };

    const file_url = await uploadFileToBlob(file);
    return file_url;
};

export const CallAzureOcrService = async (image_url: string): Promise<string> => {
    const computerVisionClient = new ComputerVisionClient(
        new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': AzureKey } }),
        Endpoint
    );
    /**
     * END - Authenticate
     */

    // Perform read and await the result from URL
    async function readTextFromURL(client: any, url: any): Promise<string> {
        console.log('called readTextFromURL');
        // To recognize text in a local image, replace client.read() with readTextInStream() as shown:
        console.log(url);
        let result = await client.read(url);
        console.log('come to here');
        console.log(result);
        // Operation ID is last path segment of operationLocation (a URL)
        const operation = result.operationLocation.split('/').slice(-1)[0];

        // Wait for read recognition to complete
        // result.status is initially undefined, since it's the result of read
        while (result.status !== 'succeeded') {
            console.log('Waiting for read recognition to complete...');
            // await promisify(setTimeout)(1000);
            await sleep(1000);
            result = await client.getReadResult(operation);
        }
        return result.analyzeResult.readResults; // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
    }

    // Prints all text from Read result
    function printRecText(readResults: any) {
        console.log('Recognized text:');
        const res = [];
        for (const page in readResults) {
            if (readResults.length > 1) {
                console.log(`==== Page: ${page}`);
            }
            const result = readResults[page];
            if (result.lines.length) {
                for (const line of result.lines) {
                    res.push(line.words.map((w: any) => w.text).join(' '));
                }
            } else {
                console.log('No recognized text.');
            }
        }
        return res.join('\n');
    }

    async function computerVision(image_url: string): Promise<string> {
        try {
            if (!(typeof image_url === 'string' && image_url.trim().length > 0)) {
                return '';
            }
            /**
             * OCR: READ PRINTED & HANDWRITTEN TEXT WITH THE READ API
             * Extracts text from images using OCR (optical character recognition).
             */
            console.log('-------------------------------------------------');
            console.log('READ PRINTED, HANDWRITTEN TEXT AND PDF');
            console.log();

            // URL images containing printed and/or handwritten text.
            // The URL can point to image files (.jpg/.png/.bmp) or multi-page files (.pdf, .tiff).
            // const printedTextSampleURL = 'https://raw.githubusercontent.com/Azure-Samples/cognitive-services-sample-data-files/master/ComputerVision/Images/printed_text.jpg';
            const printedTextSampleURL = image_url;

            // Recognize text in printed image from a URL
            console.log('Read printed text from URL...', printedTextSampleURL.split('/').pop());
            console.log(computerVisionClient.credentials);
            const printedResult = await readTextFromURL(computerVisionClient, printedTextSampleURL);
            const ocred = printRecText(printedResult);
            return ocred;
        } catch (error) {
            throw error;
        }
    }

    const ocrText = await computerVision(image_url);
    return ocrText;
};
