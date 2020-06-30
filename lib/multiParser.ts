import {ServerRequest, FormFile, MultipartReader} from '../deps.ts'

const boundaryRegex = /^multipart\/form-data;\sboundary=(?<boundary>.*)$/;

//default maxMemory = 10485760 bytes = 10 Mb
export function multiParser(
  rawReq: any,
  maxMem: number = 10 << 20
): Promise<Record<string, FormFile | FormFile[] | string> | undefined> {
  return new Promise(async (resolve, reject) => {
    if (rawReq?.headers?.get("content-type")) {
      // const refineReq = refineRequest(rawReq);
      const refineReq = rawReq;

      let match = refineReq.headers.get("content-type")!.match(boundaryRegex);
      // invalid header
      if (!match) {
        reject("multiParser: Invalid header");
      }

      const formBoundary: string = match!.groups!.boundary;
      const reader = new MultipartReader(refineReq.body, formBoundary);
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

