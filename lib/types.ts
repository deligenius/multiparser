export interface FileInfo extends Record<string, any> {
  contentDisposition: string;
  name: string;
  filename?: string;
  contentType: string;
  ext: string;
  content: Uint8Array | string;
  savedFileName?: string;
}

export interface RawField {
  headers: Headers | null;
  data: Uint8Array;
}

export interface Options {
  uploadDir?: string;
  keepExtension?: boolean;
  maxFileSize?: number;
  maxFields?: number;
  maxFieldSize?: number;
  multiple?: boolean;
}
