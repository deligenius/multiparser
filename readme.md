## Multiparser

> A Deno module for parsing multipart/form-data

This project is under development, some documentation and api may change during the time. 

### Features:

- Very simple API
- Maximum file size option
- Easy to understand examples

### Usage
```ts
const form = await multiParser(request, maxMem?)
```
```request: serverRequest``` is a raw server request coming from Deno http module.

```maxMem: number``` maximum memory size to store file in memory,``` unit: byte```
* default ```10485760``` bytes (10MB)

### Return value: 

* Text field will return as ```[key]: value```
* File field will return a object with
    * title: ```string```
    * type: ```string```
    * content: ```Uint8Array```
      * content can be used as ```Deno.writeFileSync(<FileName>, <content>)``` to save to local file system
    * size: ```number```

sample returned form value:
```ts
{
  title: "123145",
  singleFile: {
    filename: "small.png",
    type: "image/png",
    content: Uint8Array(6229) [
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72,  68,
      ... 6129 more items
    ],
    size: 6229
  }
}
```

## Examples

### With Deno http module

```ts
import { serve } from "https://deno.land/std/http/server.ts";
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

### With Oak framework
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