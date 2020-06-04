import * as bytes from "../std/bytes/mod.ts";
import nanoid from "https://deno.land/x/nanoid/mod.ts";
import { ServerRequest } from "../std/http/server.ts";
import { extname, join } from "https://deno.land/std/path/mod.ts";
import { getRawFields, encoder } from "./field.ts";
// import { extension } from "https://cdn.pika.dev/mime-types@^2.1.27";
import { FileInfo, Options } from "./types.ts";
import { MultiParserError } from "./error.ts";

const decoder = new TextDecoder();

function getDefaultOption(option: Options) {
  return <Options> {
    uploadDir: option.uploadDir ?? undefined,
    keepExtension: option.keepExtension ?? false,
    maxFileSize: option.maxFileSize ?? 200 << 20, //200mb
    maxFieldSize: option.maxFieldSize ?? 20 << 20, //20mb
    multiple: option.multiple ?? false,
  };
}

export async function getForm(
  req: ServerRequest,
  option?: Options,
): Promise<Record<string, FileInfo | FileInfo[]>> {
  let opt = getDefaultOption(option ?? {});
  const boundaryByte = getBoundary(req.headers.get("content-type")!);
  if (boundaryByte) {
    const rawFields = await getRawFields(req.body, boundaryByte, opt);
    const form: Record<string, FileInfo | FileInfo[]> = {};
    for (let field of rawFields) {
      const contentDisposition = field.headers?.get("content-disposition");
      const contentType = field.headers?.get("content-type");
      if (contentDisposition) {
        const fileInfo = getFileInfo(contentDisposition);
        fileInfo.contentType = contentType ? contentType : "text/plain";
        fileInfo.ext = fileInfo.filename ? extname(fileInfo.filename) : ".txt";
        // if filename doesn't exist, it's a string
        fileInfo.content = fileInfo.filename
          ? field.data
          : decoder.decode(fileInfo.data);

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

    if (opt.uploadDir) {
      SaveToLocal(form, opt);
    }
    return form;
  } else {
    throw new MultiParserError("no boundary found");
  }
}

async function SaveToLocal(
  form: Record<string, FileInfo | FileInfo[]>,
  opt: Options,
) {
  ensureDirExists(opt.uploadDir!);

  for (let [field, fileInfo] of Object.entries(form)) {
    // write multiple files
    if (fileInfo instanceof Array) {
      for (let file of fileInfo) {
        writeNow(file, opt);
      }
    } // write single file
    else {
      writeNow(fileInfo, opt);
    }
  }
}

async function ensureDirExists(dir: string) {
  try {
    let stat = Deno.statSync(dir);
    return stat.isDirectory;
  } catch (e) {
    Deno.mkdirSync(dir);
  }
}

function writeNow(fileInfo: FileInfo, opt: Options) {
  let id = nanoid(12);
  let ext = opt.keepExtension ? fileInfo.ext : "";
  let savedFileName = id + ext;
  fileInfo.savedFileName = savedFileName;
  let path = join(opt.uploadDir!, savedFileName);
  if (typeof fileInfo.content !== "string") {
    Deno.writeFile(path, fileInfo.content);
  }
}

// contentDisposition : form-data; name="c"
function getFileInfo(contentDisposition: string): FileInfo {
  let fileInfo = <FileInfo> {};
  const contentDisArr = contentDisposition.split(";");
  fileInfo.contentDisposition = contentDisArr[0];

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

export function getBoundary(contentType: string): Uint8Array | undefined {
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
