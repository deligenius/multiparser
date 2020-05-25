## Multiparser

> A Deno module for parsing multipart/form-data

This project is under development, some documentation and api may change during the time. 

### Features:

- Very simple API
- Maximum file size option
- Easy to understand examples

### Usage
```ts
const form = await multiParser(request)
```
```request: serverRequest``` is a raw server request coming from Deno http module.


## Examples

### With Deno http module

```ts
import { serve } from "https://deno.land/std@0.53.0/http/server.ts";
import { multiParser } from 'https://raw.githubusercontent.com/deligenius/multiparser/master/mod.ts'

const s = serve({ port: 8000 });
for await (const req of s) {
  if (req.url === "/upload") {
    const form = await multiParser(req)
    if (form) {
      console.log(form)
    }
  }

  req.respond({
    headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
    body: `
    <h3>Deno http module</h3>
    <form action="/upload" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="singleFile"/></div>
      <input type="submit" value="Upload" />
    </form>
  ` });
}
```

### With Deno http module
```ts
import { Application, Context } from "https://deno.land/x/oak/mod.ts";
import { multiParser } from 'https://raw.githubusercontent.com/deligenius/multiparser/master/mod.ts'

const app = new Application();

app.use(async (ctx) => {
  if (ctx.request.url.pathname === '/upload') {
    const form = await multiParser(ctx.request.serverRequest)
    if (form) {
      console.log(form)
    }
  }

  ctx.response.headers.set("Content-Type", "text/html; charset=utf-8")
  ctx.response.body = `
     <h3>Deno Oak framework</h3>
     <form action="/upload" enctype="multipart/form-data" method="post">
       <div>Text field title: <input type="text" name="title" /></div>
       <div>File: <input type="file" name="singleFile"/></div>
       <input type="submit" value="Upload" />
     </form>
  `
});

await app.listen({ port: 8000 });
```