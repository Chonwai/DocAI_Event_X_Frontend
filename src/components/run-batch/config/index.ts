/* eslint-disable import/no-mutable-exports */

export const API_PREFIX = process.env.NEXT_PUBLIC_API_SERVER;
export const PUBLIC_API_PREFIX = process.env.NEXT_PUBLIC_API_SERVER;
export const PUBLIC_API_SPEAKING = 'https://speaking.docai.net';

export const LOCALE_COOKIE_NAME = 'locale';
export const DEFAULT_VALUE_MAX_LEN = 48;

export const REACT_APP_AZURE_STORAGE_SAS_TOKEN =
    'sp=racwdli&st=2024-05-07T13:17:47Z&se=2026-05-07T21:17:47Z&sv=2022-11-02&sr=c&sig=IC0vCLdl%2FGl4PREwKvVtb%2FTLYa1lOHBljMqHwaH%2FDas%3D';

export const ContainerName = 'test-storage';
export const SasToken = REACT_APP_AZURE_STORAGE_SAS_TOKEN;
export const StorageAccountName = 'cs110032001ea43be18';

export const UPLOAD_URL = `https://${StorageAccountName}.blob.core.windows.net/?${SasToken}`;

export const AzureKey = '0016ce7666cb46c29ce889a5b2d316f2';

export const Endpoint = 'https://essay-grading.cognitiveservices.azure.com/';
