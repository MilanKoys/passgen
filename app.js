"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const filePath = process.argv[2];
fs.readFile(filePath, (err, data) => {
    if (err)
        throw err;
    const hash = crypto.createHash("sha256");
    hash.update(data);
    console.log(hash.digest("base64"));
});
