import "@bacons/text-decoder/install";

import { type RequestMethods as RequestMethod, type RequestRedirection, Fetch } from "./specs/fetch.nitro";
import { DuplexStream, InputStream, OutputStream } from "./specs/streams.nitro";
import { ReadableStream, WritableStream } from 'web-streams-polyfill'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const stringToStream = (str: string): ReadableStream => {
  const buffer = encoder.encode(str)

  return new ReadableStream({
    start(controller) {
      controller.enqueue(buffer)
      controller.close()
    },
  })
}

const toWritableStream = (outputStream: OutputStream) => {
  return new WritableStream({
    start() {
      outputStream.open()
    },
    async write(chunk: Uint8Array) {
      if (chunk.byteLength === 0) {
        return
      }
      await outputStream.write(chunk.buffer)
    },
    close() {
      outputStream.close()
    },
    abort() {
      outputStream.close()
    },
  })
}

const fromReadableStream = (stream: ReadableStream): InputStream => {
  const duplexStream = DuplexStream()

  const writableStream = toWritableStream(duplexStream.outputStream)
  stream.pipeTo(writableStream)

  return duplexStream.inputStream
}

const mergeArrayBuffers = (buffers: ArrayBuffer[]): Uint8Array => {
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0)
  const mergedArray = new Uint8Array(totalLength)

  let offset = 0
  for (const buffer of buffers) {
    const uint8Array = new Uint8Array(buffer)
    mergedArray.set(uint8Array, offset)
    offset += uint8Array.length
  }

  return mergedArray
}

const zipPairs = (arr: Array<string>): Array<[string, string]> => {
  const result: Array<[string, string]> = [];

  for (let i = 0; i < arr.length; i += 2) {
    result.push([arr[i], arr[i + 1]]);
  }

  return result;
}


export interface RequestInit {
  body?: ReadableStream | Blob | File | string | undefined

  /**
   * Any headers you want to add to your request, contained within an object literal
   * whose keys are the names of headers and whose values are the header values.
   */
  headers?: Headers | Record<string, string>

  method?: RequestMethod

  /**
   * Determines RN's behavior in case the server replies with a redirect status (`300..399`).
   * @default 'follow'
   */
  redirect?: RequestRedirection
}

export class Request {
  readonly url: string;
  readonly body: ReadableStream | undefined;
  readonly method: RequestMethod;

  /**
   * Determines RN's behavior in case the server replies with a redirect status (`300..399`).
   * @default 'follow'
   */
  readonly redirect: RequestRedirection

  /**
   * Any headers you want to add to your request, contained within an object literal
   * whose keys are the names of headers and whose values are the header values.
   */
  readonly headers: Record<string, string>

  constructor(input: string | URL, init?: RequestInit) {
    if (typeof input !== 'string') {
      input = input.href;
    }

    this.method = init?.method ?? "GET";
    this.url = input;
    this.redirect = init?.redirect ?? "follow";

    if (init?.headers) {
      if (init.headers instanceof Headers)
        this.headers = Object.fromEntries(init.headers);
      else
        this.headers = init.headers
    } else this.headers = {}

    if (typeof init?.body === 'string') {
      this.body = stringToStream(init.body);
      this.headers['Content-Length'] = init.body.length.toString()
    }
    else if (init?.body instanceof Blob || init?.body instanceof File) {
      this.body = init.body.stream() as ReadableStream;
    }
    else {
      this.body = init?.body
    }
  }
}

export async function fetch (
  input: string | URL,
  init?: RequestInit
) {
  const request = new Request(input, init);

  const response = await Fetch.create({
    url: request.url,
    method: request.method,
    redirection: request.redirect,
    headers: Object.entries(request.headers).flat(),
    body: request.body ? fromReadableStream(request.body) : null
  });

  async function bytes(): Promise<Uint8Array> {
    const chunks: ArrayBuffer[] = []

    if (response.body) {
      let chunk: ArrayBuffer;
      response.body.open()

      do {
        chunk = await response.body.read()

        if (chunk.byteLength > 0) {
          chunks.push(chunk)
        }
      } while (chunk.byteLength > 0)
    }

    return mergeArrayBuffers(chunks)
  }

  async function arrayBuffer(): Promise<ArrayBuffer> {
    return (await bytes()).buffer
  }

  async function text(): Promise<string> {
    return decoder.decode(await bytes())
  }

  async function json<T = any>(): Promise<T> {
    return JSON.parse(await text())
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(zipPairs(response.headers)),
    bytes,
    json,
    text,
    arrayBuffer,
    type: "basic",
    url: response.url,
    ok: response.status >= 200 && response.status < 300,
    redirected: response.redirected
  };
}
