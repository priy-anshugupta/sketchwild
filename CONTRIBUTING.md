# Contributing to SketchWild

Use Node 22, run `npm ci`, copy `.env.example` to `.env`, and install `gemma3:4b` in Ollama. `npm run dev` starts the local frontend and API. See the README for the observation workflow.

Before opening a pull request, run:

```sh
npm test
npm run build
```

Describe the user-visible problem, the change, and how you checked it. Include screenshots for layout changes. Preserve drafts and avoid deleting a contributor's browser journal during testing.

## Coaching and evaluation changes

The coach should ground an invitation in both pictures. Do not substitute authored examples for failed inference, grade artistic ability, or turn an ambiguous image into a confident claim. Keep category feature restrictions and uncertain/retake responses intact.

Use the evaluation runner with consented subject/sketch pairs when changing prompts or model selection. Report the exact model, measured response time, and examples of errors. Mock tests and generated examples establish pipeline behavior, not real-world accuracy. Record genuine outdoor trials separately from sample uploads.

## Assets and credentials

Only add assets you can redistribute. Describe their provenance; label synthetic sample images. Respect third-party licenses and model terms. Never commit API keys, `.env`, personal recordings, or private evaluation photos. Keep local experiments under ignored `artifacts/`.

New features should support a short screen interaction followed by real-world observation. Rewards recognize participation; they are not verified proof of location or drawing quality.
