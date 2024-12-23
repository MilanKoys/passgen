const fileInput = document.querySelector("input[type='file']");
const widthInput = document.querySelector("input#width");
const heightInput = document.querySelector("input#height");
const passwordInput = document.querySelector("input#password");
const encryptButton = document.querySelector("button#encrypt");
const decryptButton = document.querySelector("button#decrypt");
const saveButton = document.querySelector("button#save");
const canvas = document.querySelector("canvas");

let fileBuffer = null;

saveButton.addEventListener("click", (event) =>
  saveArrayBuffer(fileBuffer, "image.raw"),
);

encryptButton.addEventListener("click", async (event) => {
  const buffer = new Uint8Array(fileBuffer);
  const width = widthInput.value;
  const height = heightInput.value;
  await encryptBuffer(passwordInput.value, buffer);
  renderBuffer(buffer, width, height);
});

decryptButton.addEventListener("click", async (event) => {
  const buffer = new Uint8Array(fileBuffer);
  const width = widthInput.value;
  const height = heightInput.value;
  await decryptBuffer(passwordInput.value, buffer);
  renderBuffer(buffer, width, height);
});

fileInput.addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (!file) return console.log("No file selected.");

  const reader = new FileReader();
  const width = widthInput.value;
  const height = heightInput.value;

  reader.onload = (event) => {
    fileBuffer = event.target.result;
    const buffer = new Uint8Array(fileBuffer);
    renderBuffer(buffer, width, height);
  };

  reader.readAsArrayBuffer(file);
});

function renderBuffer(buffer, width, height) {
  const context = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  for (let i = 0; i < width * height * 4; i += 4) {
    const y = Math.floor(i / 4 / width);
    const x = i / 4 - y * width;
    const r = buffer[i];
    const g = buffer[i + 1];
    const b = buffer[i + 2];
    const a = buffer[i + 3];
    context.fillStyle = `rgba(${r},${g},${b},${a})`;
    context.fillRect(x, y, 1, 1);
  }
}

async function generateKey(password, length) {
  const hash = await sha256(password);
  const key = generateRandomString(hash, length);
  return key;
}

async function encryptBuffer(password, buffer) {
  const key = await generateKey(password, buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = buffer[i] + key[i].charCodeAt(0) * 49297;
    while (buffer[i] > 255) buffer[i] -= 255;
  }
}

async function decryptBuffer(password, buffer) {
  const key = await generateKey(password, buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] = buffer[i] - key[i].charCodeAt(0) * 49297;
    while (buffer[i] < 0) buffer[i] += 255;
  }
}

async function sha256(string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hash = String.fromCharCode(...Array.from(new Uint8Array(hashBuffer)));
  return hash;
}

function generateRandomString(hash, length) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charsetLength = charset.length;

  let seed = 0;
  for (let i = 0; i < hash.length; i++) {
    seed += hash.charCodeAt(i);
  }

  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280; // Linear congruential generator
    return seed / 233280;
  }

  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(pseudoRandom() * charsetLength);
    randomString += charset[randomIndex];
  }

  return randomString;
}

function saveArrayBuffer(arrayBuffer, fileName) {
  const blob = new Blob([arrayBuffer], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}
