import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Try dist/public first, then server/public
  let distPath = path.resolve(__dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    distPath = path.resolve(__dirname, "public");
  }
  
  if (!fs.existsSync(distPath)) {
    console.warn(`[Static] Could not find static directory. Falling back to project root public.`);
    distPath = path.resolve(process.cwd(), "dist", "public");
  }

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory. Make sure to build the client first (npm run build). Checked: ${distPath}`,
    );
  }

  console.log(`[Static] Serving files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
