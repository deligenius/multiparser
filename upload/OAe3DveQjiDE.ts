import { serve } from "../std/http/server.ts";
import { getForm } from "../lib/form.ts";

const s = serve({ port: 8000 });
for await (const req of s) {
  if (req.url === "/upload") {
    const form = await getForm(
      req,
      {
        multiple: true,
        uploadDir: "./upload",
        keepExtension: true,
        maxFieldSize: 2048,
        maxFileSize: 2048,
      },
    );
    // console.log(form)
    for (let [key, value] of Object.entries(form)) {
      console.log(key);
      console.log(value);
    }
  }

  req.respond({
    headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
    body: `
    <h3>Deno http module</h3>
    <form action="/upload" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="multiple" multiple/></div>
      <input type="submit" value="Upload" />
    </form>
  `,
  });
}
