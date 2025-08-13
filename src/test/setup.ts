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
        this.result = new ArrayBuffer((file as any).size || 0);
        if (this.onload) {
          this.onload({} as ProgressEvent<FileReader>);
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

    constructor(bits: BlobPart[], name: string, options: FilePropertyBag = {}) {
      this.name = name;
      this.size = bits.reduce((acc, bit) => {
        if (typeof bit === "string") return acc + bit.length;
        if (bit instanceof ArrayBuffer) return acc + bit.byteLength;
        return acc;
      }, 0);
      this.type = options.type || "";
      this.lastModified = options.lastModified || Date.now();
    }

    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(this.size));
    }
    
    bytes() {
      return Promise.resolve(new Uint8Array(this.size));
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