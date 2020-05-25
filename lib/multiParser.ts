import { ServerRequest } from "https://deno.land/std@0.53.0/http/server.ts";
import { MultipartReader, FormFile } from "https://deno.land/std/mime/multipart.ts";


//default maxMemory = 10485760 bytes = 10 Mb

export function multiParser(req: ServerRequest, maxMem: number = 10 << 20)
  : Promise<Record<string, FormFile | string> | undefined> {
  return new Promise(async (resolve, reject) => {
    const boundaryRegex = /^multipart\/form-data;\sboundary=(?<boundary>.*)$/

    let match: RegExpMatchArray | null
    if (req.headers.get("content-type") &&
      (match = req.headers.get("content-type")!.match(boundaryRegex))) {

      const formBoundary: string = match.groups!.boundary
      const reader = new MultipartReader(req.body, formBoundary);
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