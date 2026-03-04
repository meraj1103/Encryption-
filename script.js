async function getKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt() {
  const message = document.getElementById("message").value;
  const password = document.getElementById("password").value;

  const key = await getKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(message)
  );

  const result = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted))
  };

  document.getElementById("output").textContent =
    JSON.stringify(result);
}

async function decrypt() {
  const password = document.getElementById("password").value;
  const input = JSON.parse(document.getElementById("message").value);

  const key = await getKey(password);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(input.iv) },
    key,
    new Uint8Array(input.data)
  );

  document.getElementById("output").textContent =
    new TextDecoder().decode(decrypted);
}
function copyOutput() {
  const output = document.getElementById("output").textContent;
  if (!output) {
    alert("Nothing to copy!");
    return;
  }

  navigator.clipboard.writeText(output)
    .then(() => alert("Copied to clipboard ✅"))
    .catch(err => alert("Failed to copy ❌", err));
}
