## Multiparser

> A Deno module for parsing multipart/form-data

[![tag](https://img.shields.io/badge/Deno%20-std%400.114.0-333?&logo=Deno)](https://deno.land/std@0.114.0)


### Features:

- Very simple API
- Upload options
- Much faster than deno standard library

## Documentation

Multiparser version 2 aims to have better performance than V1. Since V1 is dependent on deno@std entirely, which is very unstable. So Multiparser V2 has less dependencies, and it's much faster!

### Usage
```ts
// multiParser
import { multiParser, Form, FormFile } from 'https://deno.land/x/multiparser@<version>/mod.ts'

const form = await multiParser(request)

```
**Where**: 

  ```request: Request``` is a raw server request coming from Deno http module.

**Result**: 
  - success, return `Form`
  - fail, return `undefined`

**`Form` Definition**:

```ts
interface Form {
  fields: Record<string, string>;
  files: Record<string, FormFile | FormFile[]>;
}
```

### Basic Example: 

Suppose your form has two fields, the first one has field name `singleStr` with text "this is string value" only, and the second field called `singleImg` with a img file named "singleImg.png". 

```ts
import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { multiParser } from 'https://deno.land/x/multiparser@<version>/mod.ts'

serve(async (req) => {

  const parsed = await multiParser(req)
  console.log(parsed);


  return new Response(`
  <h3>Deno http module</h3>
  <form action="/upload" enctype="multipart/form-data" method="post">
    <div>singleStr: <input type="text" name="singleStr" /></div>
    <div>singleImg: <input type="file" name="singleImg"/></div>
    <input type="submit" value="Upload" />
  </form>
`, {
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    }
  })

});


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


### With Oak 

```ts
import { Application, Context, NativeRequest } from "https://deno.land/x/oak@v10.5.0/mod.ts";
import { multiParser } from 'https://deno.land/x/multiparser@<version>/mod.ts'

const app = new Application();

app.use(async (ctx) => {
  
  if (ctx.request.url.pathname === '/upload') {
    const form = await multiParser((ctx.request.originalRequest as NativeRequest).request)
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
