declare module "cors" {
  import type { RequestHandler } from "express";
  const cors: (options?: any) => RequestHandler;
  export default cors;
}

