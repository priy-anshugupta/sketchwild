# SketchWild build status

Updated 9 October 2026. The application is implemented and runs locally. It is not yet a validated or deployed contest submission.

## Working and checked

- Six subject exercises, duration/focus controls, and the paper-first session flow.
- Photo upload, preview, rotation, and recovery of both images after reload.
- Reflection and journal saving, category filters, revisits, deletion controls, and ZIP export.
- Mobile and desktop layouts; browser navigation; cancellation guards so late requests cannot replace another session.
- UI review: stronger label/secondary-text contrast, distinct subject palettes, visible mobile section tabs, active-state cues, enlarged touch targets, and an inert hidden mobile drawer. Mobile tabs verified across all four sections; checked at 390px and 1366px without horizontal overflow.
- Ollama and hosted open-vision adapters, category-aware prompt, output validation, explicit uncertain/retake states.
- Same-origin check, upload/type/pixel limits, metadata stripping, request/concurrency caps.
- Six designed outdoor missions, place/time filters, printable exercise, and guided series progress.
- Field passport: first sketch, three subjects, five second looks, and six completed missions. Rewards use both photos plus self-reported outdoor completion; repeated mission completions cannot duplicate mission stamps. Existing sessions without this confirmation do not receive retroactive rewards.
- Sixteen automated tests pass, including a full HTTP upload request against a mock inference server and reward eligibility/deduplication checks. A mock result verifies plumbing, not model accuracy.
- TypeScript checking and production build pass. The last dependency audit reported zero vulnerabilities.
- Render blueprint and evaluation runner are included.

## Actual inference findings

The installed `qwen3-vl:2b` alias uses reasoning weights. CPU-only two-image requests exceeded two minutes; bounded responses also returned empty final content. The app rejected them rather than inventing feedback. We changed the default to the explicit `qwen3-vl:2b-instruct` model.

The user completed the Instruct model download. Ollama now reports it installed with image support, and SketchWild reports the configured model connected. A live two-image pipeline smoke test returned HTTP 200 with a schema-valid coaching card in approximately 170 seconds on CPU. The test used the same generated decorative image in both slots, so it establishes working inference and response validation, not accurate subject/drawing comparison. Its feedback was generic and confused the subject/sketch roles; real-pair evaluation and prompt improvement remain necessary. Six-category drawing accuracy is still unvalidated.

The earlier generated banner was used only as a disposable pipeline smoke-test input. It is not outdoor trial evidence and is not part of the held-out evaluation set.

The current default is `gemma3:4b` through local Ollama. Installation and vision capability were checked. The recorded flower/reference and pencil-sketch sample comparison produced a live Gemma card reporting 146.3 seconds on the laptop CPU. It recognized the sketch's overall flower shape and invited another look at a curved petal outline. This is a successful sample-pair demonstration, not a measured accuracy benchmark or genuine outdoor trial. The finished narrated walkthrough uses normal-speed excerpts and screenshot holds, labels the shortened processing wait, and identifies the sample uploads. Video-editing assets remain outside the public source repository.

## Remaining steps

Public preview mode is ready for Render (`AI_PROVIDER=disabled`) without an inference key. The UI explains the local Gemma setup, keeps live observation requests disabled, and links to the labelled example. An optional `DEMO_VIDEO_URL` adds the walkthrough link. Seventeen tests and the production build pass, including a disabled-mode API check. No public service has been provisioned yet.

1. Local Gemma installation is complete. A public Render deployment still requires a verified hosted open-weight vision endpoint in its Render environment.
2. Live inference is connected and its first pipeline response is recorded in ignored `artifacts/instruct-smoke-test.json`. Test real distinct subject/drawing images next, improve role grounding, and record exact model identity, speed, and errors.
3. Evaluate actual subject photos and paper sketches in all six categories using `npm run evaluate -- evaluation/your-pairs.json`.
4. Conduct and document a genuine outdoor trial.
5. Configure the hosted endpoint and publish the repository/app to Render. No Render account access or inference credentials have been provided, and no paid resources were provisioned.
6. Upload the finished demo and write the DEV submission using the actual results.

Local preview: http://127.0.0.1:5173. Run `npm run dev` if it is stopped. Model setup, privacy details, and deployment instructions are in README.md.

## Copilot review follow-up — October 10, 2026

The user supplied a GitHub Copilot review of preview mode, accessibility, and draft handling. Two findings were checked against the source and addressed: the preview banner now says live feedback is off, and each modal uses a unique heading ID with `aria-labelledby`. The review also confirmed the disabled inference guard and available journal saving/export paths.

The review's pending-write/tab-close concern remains a test gap; these changes do not establish guaranteed persistence on immediate tab closure. Browser lifecycle and screen-reader coverage are not part of the 17 existing automated tests.

## Pencil shortcut completed — October 9, 2026

The header pencil is now a keyboard-accessible Start a new sketch button. It opens a subject picker with six categories and an outdoor missions shortcut. Choosing a category starts the existing draft flow; closing or pressing Escape keeps the current session intact. Verified in the browser at desktop and 390px mobile widths: picker opens, Leaves starts an exercise, Escape returns to the same draft, and Browse outdoor missions opens Missions. The mobile picker has no horizontal overflow. Production build passes. Screenshot: artifacts/new-sketch-picker.png.
