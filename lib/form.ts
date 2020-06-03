import * as bytes from "../std/bytes/mod.ts";
import { ServerRequest } from "../std/http/server.ts";
import { getRawFields, encoder } from "./field.ts";
import { extension } from "https://cdn.pika.dev/mime-types@^2.1.27";

interface FileInfo extends Record<string, any> {
  contentDisposition: string;
  name: string;
  filename?: string;
  contentType: string;
  ext: string;
  content: Uint8Array;
}

export async function getForm(req: ServerRequest, limit: number) {
  const boundaryByte = getBoundary(req.headers.get("content-type")!);
  if (boundaryByte) {
    const rawFields = await getRawFields(req.body, boundaryByte, limit);
    const form: Record<string, FileInfo | FileInfo[]> = {};
    for (let field of rawFields) {
      const contentDisposition = field.headers?.get("content-disposition");
      const contentType = field.headers?.get("content-type");
      if (contentDisposition) {
        const fileInfo = getFileInfo(contentDisposition);
        fileInfo.contentType = contentType ? contentType : "text/plain";
        fileInfo.ext = extension(fileInfo.contentType) || "unknow";
        fileInfo.content = field.data;

        const name = fileInfo.name;
        // if multiple files with same field name
        if (form[name]) {
          if (form[name] instanceof Array) {
            form[name].push(fileInfo);
          } else {
            form[name] = <FileInfo[]> [form[name], fileInfo];
          }
        } // single field with single file
        else {
          form[name] = fileInfo;
        }
      }
    }
    return form;
  } else {
    return {};
  }
}

// contentDisposition : form-data; name="c"
function getFileInfo(contentDisposition: string): FileInfo {
  let fileInfo = <FileInfo> {};
  const contentDisArr = contentDisposition.split(";");
  fileInfo["contentDisposition"] = contentDisArr[0];

  let fileInfoArr = contentDisArr.slice(1);
  for (let info of fileInfoArr) {
    let [key, value] = info.split("=");
    key = key.trim();
    if (value[0] === '"' && value[value.length - 1] === '"') {
      value = value.substring(1, value.length - 1);
    }
    fileInfo[key] = value;
  }

  return fileInfo;
}

function getBoundary(contentType: string): Uint8Array | undefined {
  let boundaryByte = encoder.encode("boundary=");
  let contentTypeByte = encoder.encode(contentType);
  let boundaryIndex = bytes.findIndex(contentTypeByte, boundaryByte);
  if (boundaryIndex >= 0) {
    // jump over 'boundary=' to get the real boundary
    let boundary = contentTypeByte.slice(boundaryIndex + boundaryByte.length);
    return boundary;
  } else {
    return undefined;
  }
}
