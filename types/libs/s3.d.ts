interface getFileResponse {
    submissionUrl?: string;
}
export declare const putFile: (fileName: string, fileData: Buffer, isPpt: boolean) => Promise<boolean>;
export declare const getFile: (fileName: string, isPpt: boolean) => Promise<getFileResponse>;
export declare const deleteFile: (fileName: string, isPpt: boolean) => Promise<boolean>;
export {};
