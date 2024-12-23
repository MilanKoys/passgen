const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const filePath = path.join(__dirname, process.argv[2]);

fs.readFile(filePath, (err: Error, data: Buffer) => {
  if (err) throw err;
  const hash = crypto.createHash("sha256");
  hash.update(data);
  console.log(hash.digest("base64"));
});
