declare module "pdfjs-dist/legacy/build/pdf" {
  const pdfjs: any;
  export = pdfjs;
}
declare module "pdfjs-dist/build/pdf.worker.entry" {
  const worker: any;
  export default worker;
}
declare module "pdfjs-dist/build/pdf.worker.min.js?url" {
  const url: string;
  export default url;
}
