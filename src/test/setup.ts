/* eslint-disable @typescript-eslint/no-explicit-any */
// テスト環境のセットアップ
import { beforeAll } from "vitest";

// Node.js環境でのブラウザAPIのモック
beforeAll(() => {
  // FileReaderのモック（型エラーを回避するため any でキャスト）
  (global as any).FileReader = class FileReader {
    static readonly EMPTY = 0;
    static readonly LOADING = 1;
    static readonly DONE = 2;

    result: string | ArrayBuffer | null = null;
    error: any = null;
    readyState: number = 0;
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;

    readAsArrayBuffer(file: Blob) {
      setTimeout(() => {
        this.readyState = 2;
        // Fileオブジェクトの実際のデータを返すように修正
        if ((file as any).arrayBuffer) {
          (file as any).arrayBuffer().then((buffer: ArrayBuffer) => {
            this.result = buffer;
            if (this.onload) {
              this.onload({} as ProgressEvent<FileReader>);
            }
          });
        } else {
          this.result = new ArrayBuffer((file as any).size || 0);
          if (this.onload) {
            this.onload({} as ProgressEvent<FileReader>);
          }
        }
      }, 0);
    }

    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true; }
  };

  // Fileのモック（型エラーを回避するため any でキャスト）
  (global as any).File = class File {
    name: string;
    size: number;
    type: string;
    lastModified: number;
    webkitRelativePath = "";
    private _buffer: ArrayBuffer;

    constructor(bits: BlobPart[], name: string, options: FilePropertyBag = {}) {
      this.name = name;
      this.type = options.type || "";
      this.lastModified = options.lastModified || Date.now();
      
      // bitsからArrayBufferを作成
      let totalSize = 0;
      const buffers: ArrayBuffer[] = [];
      
      for (const bit of bits) {
        if (typeof bit === "string") {
          const encoder = new TextEncoder();
          const encoded = encoder.encode(bit);
          buffers.push(encoded.buffer);
          totalSize += encoded.byteLength;
        } else if (bit instanceof ArrayBuffer) {
          buffers.push(bit);
          totalSize += bit.byteLength;
        } else if (bit instanceof Uint8Array) {
          const buffer = bit.buffer as ArrayBuffer;
          buffers.push(buffer.slice(bit.byteOffset, bit.byteOffset + bit.byteLength));
          totalSize += bit.byteLength;
        }
      }
      
      this.size = totalSize;
      this._buffer = new ArrayBuffer(totalSize);
      
      if (buffers.length > 0) {
        const view = new Uint8Array(this._buffer);
        let offset = 0;
        for (const buffer of buffers) {
          view.set(new Uint8Array(buffer), offset);
          offset += buffer.byteLength;
        }
      }
    }

    arrayBuffer() {
      return Promise.resolve(this._buffer.slice(0));
    }
    
    bytes() {
      return Promise.resolve(new Uint8Array(this._buffer));
    }

    slice() {
      return new (global as any).File([], this.name, { type: this.type });
    }

    stream() {
      return new ReadableStream();
    }

    text() {
      return Promise.resolve("");
    }
  };

  // performanceのモック
  if (typeof global.performance === "undefined") {
    global.performance = {
      now: () => Date.now(),
    } as Performance;
  }
});