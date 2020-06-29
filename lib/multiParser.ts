import { ServerRequest } from "https://deno.land/std@0.56.0/http/server.ts";
import { MultipartReader, FormFile } from "https://deno.land/std@0.56.0/mime/multipart.ts";

function refineRequest(req: any): ServerRequest {
  let refinedReq = new ServerRequest()
  refinedReq.headers = req.headers
  refinedReq.r = req.r
  return refinedReq
}


//default maxMemory = 10485760 bytes = 10 Mb
export function multiParser(rawReq: any, maxMem: number = 10 << 20)
  : Promise<Record<string, FormFile | string> | undefined> {
  return new Promise(async (resolve, reject) => {
    // const refineReq = refineRequest(rawReq)
    // TODO: use req.body only
    const refineReq = refineRequest(rawReq)

    const boundaryRegex = /^multipart\/form-data;\sboundary=(?<boundary>.*)$/

    let match: RegExpMatchArray | null
    if (refineReq.headers.get("content-type") &&
      (match = refineReq.headers.get("content-type")!.match(boundaryRegex))) {

      const formBoundary: string = match.groups!.boundary
      const reader = new MultipartReader(refineReq.r, formBoundary);
      const formData = await reader.readForm(maxMem)

      const form: Record<string, FormFile | string> = {}
      for (let [key, value] of formData.entries()) {
        form[key] = <FormFile | string>value
      }
      resolve(form)
    }

    resolve(undefined)
  })
}

