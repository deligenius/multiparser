import * as bytes from "../std/bytes/mod.ts";
import { BufReader } from "../std/io/bufio.ts";
import { TextProtoReader } from "../std/textproto/mod.ts";

export const encoder = new TextEncoder();

interface RawField {
  headers: Headers | null;
  data: Uint8Array;
}

export async function getRawFields(
  reader: Deno.Reader,
  headerBoundary: Uint8Array,
  limitBytes: number
): Promise<RawField[]> {
  // boundary
  const boundaryByte = bytes.concat(encoder.encode("--"), headerBoundary);
  // \r\n--boundary
  const beginBoundaryByte = bytes.concat(
    encoder.encode("\r\n--"),
    headerBoundary,
  );
  // --boundary--
  const endBoundaryByte = bytes.concat(boundaryByte, encoder.encode("--"));

  const bufReader = new BufReader(reader);

  let lineByte = await bufReader.readLine();
  let rawFields: RawField[] = [];
  // line exists and line !== endBoundary
  while (lineByte && !bytes.equal(lineByte.line, endBoundaryByte)) {
    if (bytes.equal(lineByte.line, boundaryByte)) {
      let headers = await getFieldHeader(bufReader);
      let data = await getFieldData(bufReader, beginBoundaryByte, limitBytes);
      if (data) {
        // skip \r\n
        bufReader.read(new Uint8Array(2));
        rawFields.push({ headers, data });
      }else{
        // no data, the file size is over the limit
        throw new Error("file is larger than the limit: " + limitBytes + "bytes" )
      }
    }

    lineByte = await bufReader.readLine();
  }
  return rawFields;
}

async function getFieldHeader(bufReader: BufReader): Promise<Headers | null> {
  const headerReader = new TextProtoReader(bufReader);
  const header = await headerReader.readMIMEHeader();
  return header;
}

async function getFieldData(
  bufReader: BufReader,
  boundary: Uint8Array,
  limitBytes: number,
): Promise<Uint8Array | undefined> {
  let restPart = await bufReader.peek(limitBytes + boundary.byteLength);
  // TODO: findIndex() may return -1, because bufReader haven't read to the end
  let fieldBodyLength = bytes.findIndex(restPart!, boundary);
  if (fieldBodyLength >= 0) {
    let fieldDataBuf = new Uint8Array(fieldBodyLength);
    // read exact fieldBodyLength bytes into fieldDataBuf
    bufReader.read(fieldDataBuf);
    return fieldDataBuf;
  } else {
    return undefined;
  }
}
