## Multiparser

> A Deno module for parsing multipart/form-data

[![tag](https://img.shields.io/badge/Deno%20-std%400.59.0-333?&logo=Deno)](https://deno.land/std@0.59.0)
[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/multiparser)

***Note: Multiparser V2 is out!***

### Features:

- Very simple API
- Upload options
- Much faster than deno standard library

## V2 Documentation

### Why V2?

Multiparser version 2 is aim to have better performance than V1. Since V1 is dependent on deno@std, which is very unstable. So Multiparser V2 has no dependencies, and it's much faster!

### Usage
```ts
// multiParser
import { multiParserV2, FormV2, FormFileV2 } from 'https://deno.land/x/multiparser@v2.0.0/mod.ts'

const form = await multiParserV2(request, maxMem?)
```
Where: 

  ```request: serverRequest``` is a raw server request coming from Deno http module.

Result: 
  - success, return `Form`
  - failed, return `undefined`

Form Definition:

```ts
interface Form {
  fields: Record<string, string>;
  files: Record<string, FormFile | FormFile[]>;
}
```

Basic Example: 

Suppose your form has two fields, the first one has field name `singleStr` with text "this is string value" only, and the second field called `singleImg` with a img file named "singleImg.png". 

```ts
import { serve } from "https://deno.land/std@0.59.0/http/server.ts";
import { multiParser } from 'https://deno.land/x/multiparser@v2.0.0/mod.ts'

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
      <div>singleStr: <input type="text" name="singleStr" /></div>
      <div>singleImg: <input type="file" name="singleImg"/></div>
      <input type="submit" value="Upload" />
    </form>
  ` });
}
```

After you upload the form, the returned value would be like below: 

```ts
form = {
  fields: {
    <string>singleStr: "this is string value"
  },
  files: {
    singleFile: {
      <string>name: "singleFile",
      <string>filename: "singleImg.png",
      <string>contentType: "image/png",
      <number>size: 11837,
      <Uint8Array>content: [...]
    }
  }
}

```


## V1 Documentation

### Usage
```ts
const form = await multiParser(request, maxMem?)
```
```request: serverRequest``` is a raw server request coming from Deno http module.

```maxMem: number``` maximum memory size to store file in memory,``` unit: byte```
* default ```10485760``` bytes (10MB)

### Return value: 

Returned valud can either be 
- a object with `string`, `FormFile`, `FormFile[]` (array of `FormFile`) 
- `undefined`

A sample returned form value:
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

Here we can see 
 - `title` is a form field name, and its value is a string `"123145"`
 - `singleFile` is a form field name, and its value is the type of `FormFile`,

Where:

```ts
interface FormFile {
  /** filename  */
  filename: string;
  /** content-type header value of file */
  type: string;
  /** byte size of file */
  size: number;
  /** in-memory content of file. Either content or tempfile is set  */
  content?: Uint8Array;
}
```

The `content` can be used to write file content to local disk by using `Deno.writeFile(<FileName>, <content>)`

## Examples

### With Deno http module

```ts
import { serve } from "https://deno.land/std@0.59.0/http/server.ts";
import { multiParser } from 'https://deno.land/x/multiparser@v2.0.0/mod.ts'

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
import { Application, Context } from "https://deno.land/x/oak@6.0.0/mod.ts";
import { multiParser } from 'https://deno.land/x/multiparser@v2.0.0/mod.ts'

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
