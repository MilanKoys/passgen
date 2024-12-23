const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const fileArgIndex: number = process.argv.findIndex((arg) => arg === "--file");
const editor: boolean =
  process.argv.findIndex((arg) => arg === "--editor") > -1 ? true : false;
const filePath: string = process.argv[fileArgIndex + 1] ?? "";

fs.readFile(filePath, (err: Error, data: Buffer) => {
  if (err) throw err;
  const hash = crypto.createHash("sha256");
  hash.update(data);
  console.log(hash.digest("base64"));
});

if (editor) {
  const server = express();
  server.use(cors());
  server.use(helmet());
  server.use(morgan("tiny"));
  server.use(express.json());
  server.use(express.static("public"));
  server.listen(3000, () =>
    console.log(`Passgen editor running on http://localhost:${3000}`),
  );
}
