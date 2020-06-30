import { ServerRequest } from "https://deno.land/std@0.56.0/http/server.ts";
import {
  MultipartReader,
  FormFile,
} from "https://deno.land/std@0.56.0/mime/multipart.ts";

function refineRequest(req: any): ServerRequest {
  let refinedReq = new ServerRequest();
  refinedReq.headers = req.headers;
  refinedReq.r = req.r;
  return refinedReq;
}

const boundaryRegex = /^multipart\/form-data;\sboundary=(?<boundary>.*)$/;

//default maxMemory = 10485760 bytes = 10 Mb
export function multiParser(
  rawReq: any,
  maxMem: number = 10 << 20
): Promise<Record<string, FormFile | FormFile[] | string> | undefined> {
  return new Promise(async (resolve, reject) => {
    if (rawReq?.headers?.get("content-type")) {
      const refineReq = refineRequest(rawReq);

      let match = refineReq.headers.get("content-type")!.match(boundaryRegex);
      // invalid header
      if (!match) {
        reject("multiParser: Invalid header");
      }

      const formBoundary: string = match!.groups!.boundary;
      const reader = new MultipartReader(refineReq.r, formBoundary);
      const formData = await reader.readForm(maxMem);

      const form: Record<string, FormFile | FormFile[] | string> = {};
      for (let [key, value] of formData.entries()) {
        form[key] = <FormFile | string>value;
      }
      resolve(form);
    } else {
      reject(
        "multiParser: no content-type header, unable to find form boundary"
      );
    }
  });
}

