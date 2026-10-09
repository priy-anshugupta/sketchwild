# Security and privacy

Do not post credentials, private images, or exploitable security details in a public issue. For a vulnerability, use GitHub's private vulnerability reporting if it is enabled on this repository. Otherwise, open an issue asking the maintainer for a private reporting channel without disclosing the exploit.

## Current boundaries

- The journal stores photos and notes in IndexedDB in the user's browser. It has no account sync, server backup, or application-level encryption. Export before clearing browser data.
- In local mode, the two uploaded images are processed by the app's computer through Ollama. Hosted mode sends them to the selected provider; verify its retention policy.
- Image handling restricts raster formats, file size, pixel count, and image dimensions, and removes metadata before inference. Uploaded images are untrusted inputs.
- The coach validates response structure and category policies. Model feedback can still be inaccurate; it is not species identification or professional advice.
- Same-origin checking, concurrency limits, and in-memory rate/request caps reduce accidental or simple misuse. They are not authentication or a durable billing limit. Restarting the server resets these counters.

For a larger public deployment, assess authentication, persistent budget limits, abuse monitoring, and provider-specific data handling before increasing traffic. Keep keys server-side, rotate exposed credentials, and never expose the local Ollama API directly to the public internet.
