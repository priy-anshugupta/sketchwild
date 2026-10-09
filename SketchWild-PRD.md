# SketchWild — Product Requirements Document

**Version:** 1.2 · **Research date:** 9 October 2026 · **Status:** build specification; implementation progress documented in BUILD-STATUS.md

**Accepted product expansion:** Outdoor Missions and Field Passport are now in scope. Six designed exercises form a flexible series, filtered by place and time. Users may print their exercise and complete missions in any order. Milestones recognize a first outdoor sketch, three subject categories, five recorded second looks, and completion of all six missions. Eligibility requires a completed session, both photos, and explicit self-reported outdoor completion; mission stamps are unique per mission. Rewards are computed from saved entries, including after deletion. No art score or location-verification claim. The next unfinished mission is selected by ordinary code; AI-generated next-mission personalization remains unimplemented. This accepted scope supersedes earlier deferral of simple participation rewards and printable exercises.

**Product:** A mobile-friendly web app that helps beginners observe and draw outdoor subjects on paper, using short feedback from an open vision model and a personal sketch journal.

**Promise:** Draw what you see. Get one thing to notice. Look again.

**Recommended release:** A complete experience covering leaves, flowers, whole trees, bark, rocks, and outdoor scenes; a public Render demo; a reproducible local inference mode; and evidence from a small real outdoor trial. Each category has its own observation guidance and accuracy checks. Coverage is a product requirement, not a claim that every possible outdoor subject can be analyzed reliably.

## 1. Decision and executive brief

SketchWild should be an observation coach with a personal journal and subject library. The main screen should guide a session rather than present analytics. A beginner takes paper and a pencil outside, chooses a subject, sketches it, and photographs both the subject and the drawing. An open vision model identifies a visible feature worth examining again. The user reads one short card, puts the phone away, and revisits the real subject. They can add a second sketch or annotated detail and save a before-and-after journal entry.

The distinctive experience is a **second look prompted by the user's own drawing**. The product should avoid art grades, compulsory realism, and generated replacement drawings. A rough sketch can be an excellent record of observation. Feedback should invite attention rather than judge talent.

The commercial opportunity and repeat demand remain unvalidated. The immediate aim is a useful, testable challenge entry. A polished website alone will not establish utility; a convincing result is a person following an accurate prompt, noticing something new, and asking to use the app again.

**Critical decision:** Test the two-image model task before investing heavily in the interface. Public benchmarks and model cards establish general image capabilities, not reliable criticism of pencil drawings. If pair comparison fails, simplify honestly to subject-photo-based observation prompts, and revise the product's claims.

## 2. Challenge fit and delivery boundary

The official contest requires a new project and repository created and completed within the entry period, a published DEV submission using its template/tag, a code link, a deployed or video demo, and an explanation of open innovation. Writing quality carries the most weight; relevance, creativity, execution, and meaningful partner use also matter. One participant may submit one entry and win one prize. [Official contest rules](https://dev.to/page/hacktoberfest-week1-2026-10-05-contest-rules)

**Deadline:** 11 October 2026, 11:59 PM PDT, equivalent to **12 October 2026, 12:29 PM IST**. Target publication by 11 October evening IST to leave a buffer. A live site is useful for easy access but is not mandatory because a video demo also qualifies. [Challenge page](https://dev.to/challenges/hacktoberfest-week1-2026-10-05?bb=264591)

| Judging consideration | Product evidence to produce |
|---|---|
| Writing quality | Explain a real user's difficulty, the design choice, an actual trial, one failure, and the resulting change |
| Theme relevance | Paper sketching outside, a brief feedback stop, and another period of outdoor observation |
| Creativity | Tailored second-look feedback connected to the user's own drawing |
| Technical execution | Working two-image inference, validated output, recoverable errors, durable journal, reproducible setup |
| Open innovation | Exact open model/weight identity, swappable adapter, and a demonstrated local run if shipped |
| Render category | Working hosted app/API and deployment explanation |
| Gemma category | Actual Gemma-powered feedback, with model identity and output evidence, if selected |

There is no evidence supporting numerical odds of winning. Hosting, extra integrations, and this PRD do not guarantee a prize.

## 3. Research, prior art, and responsible adaptation

### 3.1 What already exists

| Reference | Evidence | Lesson for SketchWild | Differentiation hypothesis |
|---|---|---|---|
| Bio Sketchbook, IDC 2021 | AI-assisted biodiversity drawing prototype; preliminary study with six children; plant information, contours, repeated observation | AI-supported nature drawing has substantial prior art; credit it | Paper-first adult beginner flow, short feedback, openly reproducible inference |
| Bio Sketchbook, IDC 2023 follow-up | Research on scaffolding children's plant observation through an interactive drawing tool | Observation is the goal, and drawing support should be carefully designed | One small feedback intervention followed by renewed attention to the real subject |
| John Muir Laws' nature journaling resources | Concrete observation and inquiry practices, including combining pictures, words, and questions | Support curiosity and details; avoid treating a pretty picture as the only outcome | AI personalizes one invitation using the user's two images |
| B.L.O.O.M. challenge-labelled post | Field notes, birdsong, and generated field sketches on an Arduino cyberdeck | Nature sketches are already adjacent to current challenge entries | User makes the drawing; AI gives feedback rather than making the finished sketch |
| GrassMate Week 1 post | Model-generated outdoor missions, including sketching activities | Generic outdoor task generation is crowded | Feedback depends on the particular subject and drawing |

Sources: [Bio Sketchbook 2021 paper](https://chaozhang.design/assets/biosketchbook_idc21.4a27be43.pdf), [2023 follow-up paper](https://lanjing.design/assets/biosketchbook_idc23.2a7999af.pdf), [nature journaling discussion](https://johnmuirlaws.com/in-discussion-anna-mason-and-john-muir-laws/), [teaching guide excerpt](https://johnmuirlaws.com/wp-content/uploads/2020/01/HTOT_blad.pdf), [B.L.O.O.M.](https://dev.to/cloudinary/building-an-offline-arduino-uno-q-cyberdeck-that-identifies-birdsong-and-draws-vintage-field-notes-1cjg/), [GrassMate](https://dev.to/bdhamithkumara/grassmate-the-ai-that-tells-you-to-stop-using-ai-3jhd).

Searches on 9 October for SketchWild, drawing coaches, sketching, and related challenge tags did not surface an exact match for the proposed workflow. This is a limited search result, not proof of uniqueness or an exhaustive inventory. Posts may be unindexed or published later. B.L.O.O.M.'s submission label is not verification of its eligibility or acceptance.

### 3.2 What we should borrow

Adapt the principles of short observation questions, recording pictures with notes, and repeated looking. Credit their educational inspirations. Implement our own session cards, prompts, and visual design. Public access to an article or PDF does not grant unrestricted reuse of its illustrations, worksheets, copy, or code. Reuse code only under its actual license, retaining required notices; create original sample photos and drawings for the demo.

**Do not copy another entrant's submission or present the broad AI nature-drawing idea as newly invented.** The new repository and implementation should make our contribution clear.

### 3.3 What the research does not establish

The small research studies do not validate this particular app, its chosen model, or its target adult users. Nature journaling practice supports the design direction but does not prove that AI outperforms a simple instruction card. Provider documentation does not prove the subject/sketch comparison will work. These gaps are addressed by the technical and user trials below.

## 4. Problem, audience, and jobs to be done

**Problem hypothesis:** Some beginners want an outdoor creative activity but struggle to choose what to look at or what to add after a basic outline. They may abandon the activity or search for drawing tutorials on their phone. A short, subject-specific prompt could help them resume observing.

**Primary audience:** Adult beginner sketchers and students who have a phone, paper, a pencil, and access to a garden, courtyard, balcony with plants, or park. The challenge version should prioritize users we can actually observe testing.

**Secondary audience:** Nature journaling groups and facilitators who want a brief exercise. Parent-led or classroom use is a later possibility; do not build a child-account or teacher-management platform for this release.

| Job | User's situation | Desired outcome |
|---|---|---|
| Start | “I want to do something creative outside, but I can't draw well.” | A friendly exercise matched to the chosen outdoor subject |
| Get unstuck | “I've drawn the outline. What should I notice next?” | One specific detail visible in this subject |
| Preserve learning | “I noticed something I missed the first time.” | First sketch, second detail, and a short personal note |
| Keep control of images | “I want my journal on my own device.” | Local journal storage and optional local inference |

**Demand questions to ask actual testers:** Would you do this without the competition? Was the feedback more useful than a generic prompt? Would you return next week? What would stop you? Treat polite enthusiasm as feedback, not proof of repeat use.

## 5. Goals and measures

All numbers below are **proposed acceptance targets**, not measured results.

| Goal | Initial measure | Release target |
|---|---|---|
| Complete the core task | First-time tester completes start, capture, feedback, revisit, save | At least 3 real sessions; report actual numerator/denominator |
| Deliver grounded help | Held-out image-pair output reviewed against visible evidence | Category-level checks on 24 pairs, with useful coaching on clear inputs and appropriate uncertainty on unclear inputs |
| Add value beyond a template | Small comparison with a generic observation prompt | Qualitative preference and visible examples; no statistical claim |
| Keep interaction brief | Observed active phone interaction, separately from inference wait | Target no more than 2 minutes per session; report observed timings |
| Promote renewed observation | Tester reports following the card and records a new detail | At least 2/3 trial users; include failures |
| Provide a fast cloud experience | Recorded warm inference on representative image pairs | Target median ≤20 seconds, p95 ≤45 seconds; publish sample size |
| Preserve drafts | Refresh/reload tests across key states | Recover every locally committed step |
| Make local use credible | Same task runs through local app/server and local weights | One documented run with internet disconnected after setup |

A timer or hidden browser tab cannot prove that the user was outdoors or screen-free. Use “session elapsed time,” “observed phone interaction,” or “self-reported outdoor time” accurately. Do not claim improved wellbeing, art skill, or long-term learning from a few demonstrations.

## 6. Scope and priorities

### P0 — required for the submission version

1. Subject library covering leaves, flowers, whole trees, bark, rocks, and outdoor scenes, with paper and pencil instructions tailored to each.
2. Two clearly labelled photo inputs: real subject and first drawing.
3. Rotate, replace, and preview images before analysis.
4. One short, evidence-grounded feedback card from an open vision model.
5. Explicit uncertain/retake responses and a route back to the session.
6. A second-look phase with optional new drawing/detail photo and reflection.
7. Local journal storage, category filters, revisit an earlier subject, deletion, and a simple export.
8. Public Render app/API using a confirmed hosted open model endpoint.
9. Local inference adapter and reproducible local setup, if it passes the feasibility gate.
10. Labelled example session for visitors, kept distinct from live analysis.
11. Mobile accessibility, rate limits, image constraints, and documented setup.
12. Real field trial, model evaluation notes, demo video, and submission draft.

### P1 — only after P0 is working and the trial is scheduled

- Basic photo crop; otherwise instruct users to frame the intended subject clearly.
- Printable journal page through the browser's print dialog.
- Export a composed PNG comparison card if implementation remains small.
- Hindi feedback, only after bilingual review verifies that details survive translation.
- Bird/animal sketch coaching and other moving subjects, only with separate test examples and revised prompts.

### Deferred

Accounts, public feeds, leaderboards, GPS trails, species identification, plant diagnosis, voice agents, notifications, subscriptions, fine-tuning, classroom dashboards, vector retrieval, and image generation. A text-only model cannot perform the two-image task. A numerical image-similarity score is not a valid measure of observational drawing quality.

**Cut order under time pressure:** remove localization, crop, printable/PNG polish, and decorative dashboard widgets. Preserve the six-category subject library, image-pair feedback quality, draft recovery, a real trial, and the submission write-up. If a category fails its AI checks, keep its guided drawing exercise available and mark personalized feedback unavailable for that category until fixed. Report the gap honestly rather than treating one successful leaf example as validation for the whole product. If hosting inference is blocked, retain a local working demo plus video and explain the deployment limitation.

### Subject coverage and coaching policy

| Category | Starter exercise | Relevant visible features | Example second-look invitation |
|---|---|---|---|
| Leaves | Draw overall shape, then one interior detail | Outline, edge, vein direction, tip/base, proportions | Look at where two veins branch and add a small detail sketch |
| Flowers | Draw the visible flower from one viewpoint | Visible petal arrangement, overlap, center, stem, silhouette | Notice which petals overlap and draw one overlapping pair |
| Whole trees | Sketch the trunk and large canopy masses | Trunk taper, branch direction, canopy silhouette, negative space | Look at a gap between two branches and sketch that empty shape |
| Bark | Choose a small patch and record its pattern | Ridges, cracks, spacing, texture, light/dark areas | Follow one visible crack and notice how it changes direction |
| Rocks | Draw one accessible rock from a fixed viewpoint | Contour, visible planes, cracks, texture, shadow | Compare the angles where two visible surfaces meet |
| Outdoor scenes | Frame a small park/garden scene and sketch major shapes | Foreground/background, relative scale, overlap, horizon if visible, negative space | Notice which object overlaps another and add that boundary |

All examples are authored possibilities, not promises about what appears in every photograph. The model must select features actually visible in the supplied image. Exact petal counts, hidden tree branches, geological identification, and precise distances should not be inferred from incomplete views. Landscape sketches may be expressive or abstract; feedback must respect the selected intent.

Offer simple session choices: subject category, 5/10/20-minute suggested exercise, and intent of observation, shapes, or texture. Defaults keep setup short. Users can replace the category after seeing a preview. Unclassified outdoor subjects can use the general guided exercise, with personalized feedback marked experimental rather than presented as validated coverage.

The journal supports category filters, opening earlier sessions, and “Sketch this again,” which creates a linked new entry without overwriting the original. Show the user's pictures and reflections rather than ranking skill or automatically claiming improvement.

## 7. Use cases and end-to-end experience

### UC1 — first leaf session

Maya, a beginner, opens SketchWild in a park. She reads a brief instruction: find one accessible leaf, look at its overall shape, and sketch for five minutes. She can leave the app and return without losing the session. She photographs the leaf while it remains on the plant, then photographs her paper drawing. The feedback points to a clearly visible feature and proposes a short observation. Maya adds a small detail drawing rather than redoing the entire page. She saves both attempts and one sentence about what she noticed.

### UC2 — useful sketch with no obvious omission

The sketch already records the major visible details. The app acknowledges a supported observation and asks a question about a subtle feature only if it can see one. It must not invent an error to justify its existence. The user may save immediately.

### UC3 — unclear photos or uncertain model

The leaf is distant or the pencil lines are washed out. The app explains which input needs replacing. If it cannot establish a meaningful comparison, it says so and offers a clearly labelled general observation exercise. That exercise is not recorded as personalized AI feedback.

### UC4 — local private session

The user runs the same app and API locally, with Ollama on the same computer. After downloading the app dependencies and weights, they process their own photos without an external inference call. A phone may use the app over a trusted home/local network, subject to tested connectivity. The local app server calls Ollama; the browser does not need to directly access its model API.

### UC5 — interrupted session

The user closes the page, loses signal, or switches to the camera. The journal draft retains uploaded pictures and completed steps. Analysis failures offer retry without uploading everything again. A second attempt is optional, and the entry can be saved as unfinished.

### UC6 — flower or tree observation

A beginner chooses flowers and sketches the flower visible from their seat. Feedback may invite a closer look at overlapping petals if the photographs support it. Another user chooses whole trees and receives guidance on canopy shapes or branch gaps. The app applies the correct category policy rather than giving both people leaf-vein advice.

### UC7 — texture or scene study

A user chooses bark or rocks for a small texture study; the coach focuses on visible pattern and shading. A user choosing an outdoor scene frames a limited view and sketches major shapes. The coach considers relative placement and overlap, avoiding invented measurements or rigid realism grades.

### UC8 — returning journal user

A user filters their journal to trees, opens last week's entry, and starts a linked new session. They compare their own attempts and notes. The app provides a useful record without scoring improvement or requiring a daily streak.

### Journey and screen specification

| View | Content | Main action | Required failure state |
|---|---|---|---|
| Home | Product promise, subject cards, supplies, Start, Try example, journal link | Choose a subject | Local storage unavailable notice |
| Session card | Category-specific task, optional duration/intent, “Draw on paper, then return” | I'm ready to upload | Resume existing draft |
| Photo review | Subject and drawing previews; clear labels; replace/rotate | Get one observation | Wrong format, missing image, oversize, decode failure |
| Analysis | Plain progress text, elapsed wait, cancel/back | Wait or cancel | Timeout, rate limit, provider unavailable |
| Second-look card | Supported observation, one invitation, uncertainty where needed | Go look again | Retake or general exercise |
| Reflection | Optional second sketch/detail, personal note, feedback usefulness | Save session | Storage quota/export recovery |
| Journal | Dated cards, subject filters, linked revisits, and side-by-side detail view | Open, revisit, export, delete | Empty state, missing local entry |

On desktop, use a two-column photo review and journal detail. On phones, stack pictures in a predictable order. Do not make the user understand model configuration to begin a hosted session.

## 8. Functional requirements and acceptance criteria

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR01 | Create/resume a local session | A draft ID and committed state survive refresh |
| FR02 | Provide six category-specific exercises | Each category has its own concise task, observation features, supplies, suggested time, and habitat-respect reminder |
| FR03 | Accept two images | JPEG/PNG/WebP; previews confirm labels; unsupported HEIC gets a specific conversion/reselection message |
| FR04 | Normalize images | Correct orientation, preserve aspect ratio, remove metadata by re-encoding; server also validates bytes and dimensions |
| FR05 | Analyze the actual pair | Both images reach the selected vision model with explicit roles; output records exact model and prompt version |
| FR06 | Display one grounded card | One visible reference detail, an appropriately qualified sketch observation, and one short action |
| FR07 | Handle uncertainty | Retake/uncertain states never display invented confident criticism |
| FR08 | Let user disagree | “Helpful / unclear / inaccurate” available; note remains associated with that card locally |
| FR09 | Enter second-look phase | User can leave/reopen app; no requirement to keep a countdown visible |
| FR10 | Finish or save partial entry | Second photo and reflection optional; completion status explicit |
| FR11 | Maintain journal | Multiple entries survive refresh and redeployment because they are stored in the browser |
| FR12 | Delete/export | Deletion removes local record and blobs; export includes notes, metadata, and images in a documented format |
| FR13 | Provide visitor example | Sample data and pre-recorded feedback labelled throughout; live requests never substitute canned output silently |
| FR14 | Recover analysis failure | Retry/back preserve draft; user-friendly error, no raw stack traces |
| FR15 | Show processing location | Hosted upload disclosure before request; local mode identifies local processing accurately |
| FR16 | Limit requests | Server enforces input limits, request frequency, concurrency, and a total AI budget guard |
| FR17 | Respect category and intent | Selected subject/intent reach the model; unsupported feature names are rejected; a leaf prompt cannot be silently reused for a scene |
| FR18 | Filter and revisit journal | All six categories filter correctly; a new revisit links to its parent without altering previous photos/notes |
| FR19 | Expose category readiness | Capabilities identify validated coaching, guided-only, or experimental status; UI accurately displays each category's availability |

Suggested copy for a supported result, **illustrative and not a tested model output**:

> “The photo shows small teeth along the leaf's edge. Those details are hard to make out in the drawing. Look at a short section of the real edge and sketch its pattern beside your first attempt.”

Prefer “hard to make out” over “you missed” when faint lines or image quality could explain the difference.

## 9. AI specification and feasibility gate

### 9.1 Model shortlist

| Candidate | Verified capability | Intended role | Unresolved issue |
|---|---|---|---|
| Gemma 4 E2B/E4B | Official card describes image/interleaved multimodal input; Apache 2.0 | First trial, because Gemma is a challenge partner | Real pair-feedback accuracy, runtime compatibility, hosted endpoint availability |
| Qwen3-VL-4B-Instruct | Upstream Apache 2.0 image-text model; multi-image usage discussed | Quality comparison and fallback model | Actual local speed and exact hosted model support |
| Qwen3-VL 2B via Ollama | Library lists smaller text/image variant | Low-memory feasibility experiment | Fine-detail accuracy may be inadequate |

Sources: [Gemma model card](https://ai.google.dev/gemma/docs/core/model_card_4), [Qwen upstream model card](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct), [Ollama Qwen library](https://ollama.com/library/qwen3-vl).

**Selection rule:** Choose the smallest model that passes the task evaluation with usable latency. Use Gemma only if it passes; the partner category is secondary to a working product. Record the exact weights, quantization, runtime version, image size, and prompt. Never infer the precise weight revision from a floating tag alone. Do not train a model for this deadline.

The previously inspected laptop has about 16 GB RAM, a Ryzen 5 7520U, and integrated graphics. A quantized small vision model is a plausible local experiment, not a guaranteed smooth experience. Ollama lists a roughly 3.3 GB Qwen3-VL 4B download; file size is not total runtime memory. Measure peak RAM, cold-start latency, and warm pair inference before committing to local performance claims.

### 9.2 First build gate — maximum four focused hours

1. Collect original subject photos and varied sketches spanning all six categories; use at least one clear pair per category for the first spike and two per category for development.
2. Run a minimal two-image request through two shortlisted models if available.
3. Inspect whether feedback depends on the supplied drawing and subject category, rather than a generic nature description.
4. Swap different sketches against the same subject photo as a diagnostic. Feedback should change only when relevant visible evidence changes.
5. Include a blurred photo and unrelated drawing. Retake/uncertain behavior should work.
6. Check memory/latency locally and provider latency/cost for any hosted candidate.
7. Select the model or reduce scope before building the polished interface.

**Pass:** Most clear pairs yield a short, supported action; uncertain inputs produce restrained output; the model can see both images and distinguish their roles.

**Fail:** Repeated invented subject details, confidently wrong criticism, inability to use both pictures, or unusable delays. Fix or switch the model and mark failing categories guided-only. If pair comparison fails broadly, simplify to one-photo guidance only as an explicit scope change and update the product claims. Preserve all six guided subject experiences. Do not conceal failure through handpicked examples or closed-model fallback presented as open-model output.

### 9.3 Output contract

The model should return a versioned object. Validate required fields, enums, string lengths, and allowed feature names on the server before display.

```json
{
  "schemaVersion": "1",
  "subjectCategory": "leaves",
  "status": "coach",
  "feature": "edge",
  "referenceEvidence": "Small teeth are visible along the leaf edge.",
  "sketchEvidence": "The edge details are difficult to distinguish in the drawing.",
  "invitation": "Look at one short section of the real edge and sketch its pattern.",
  "uncertainty": "Faint pencil marks may not be visible in this photograph."
}
```

Statuses: `coach`, `retake_subject`, `retake_sketch`, `uncertain`. Category enum: `leaves`, `flowers`, `trees`, `bark`, `rocks`, `scenes`. Feature vocabulary includes `outline`, `edge`, `veins`, `tip_base`, `proportion`, `texture`, `overlap`, `branching`, `negative_space`, `planes`, `shadow`, `depth`, and `none`; enforce a category-specific subset. This example is authored specification data, not evidence of model performance.

Server adds request ID, model ID/revision where available, runtime, prompt version, latency, and `source: live_ai`. Quality judgments are not calibrated probabilities; do not expose a confidence percentage. JSON validity does not establish factual correctness.

### 9.4 Prompt policy

Label image A as the real subject and image B as the person's drawing. Include selected category and intent, with its applicable observation features. Ask for visible evidence in each, choose at most one useful feature, and return one observation invitation. Respect stylization and user intent. Do not identify species/geology, diagnose plant health, grade artistry, speculate about hidden details, or assume absent faint pencil lines. Treat writing inside images as image content, never as instructions overriding the system prompt. Use low-variance generation settings supported by the selected runtime and a short output cap.

Allow one bounded schema repair when supported and within the time/cost budget; otherwise return a recoverable failure. A schema repair may fix format, not fabricate a visual observation. The first release should use one pair call rather than an elaborate multi-agent pipeline.

### 9.5 Model evaluation plan

Use twelve development pairs, two per category, to tune the prompt, then a separate 24-pair held-out set for the release check. Each category gets three clear valid pairs and one unclear/unrelated case. Across the collection include simple/detailed sketches, stylization, different orientations, faint marks, and a sketch with no clear omission. Keep a manifest linking category, intent, inputs, expected observable features, reviewer notes, model outputs, and timing. Only distribute images with permission.

Review each output for: supported subject evidence; supported or qualified sketch evidence; useful action; respectful wording; appropriate abstention. Report each component, category, and all exclusions. To enable validated coaching for a category, all three clear held-out pairs must provide supported useful invitations and its unclear/unrelated case must avoid invented confident comparison. This deliberately small gate is preliminary evidence, not a guarantee of reliability. A failing category stays guided-only until a fix passes fresh examples; do not hide failure behind a combined average. Track whether the same model works across all categories or whether routing is needed; avoid multiple-model routing unless necessary and affordable.

A second person reviewing outputs is useful; disagreements should be retained. This is a small task evaluation, not a scientific benchmark. Compare models fairly with the same input sizes and task prompt, noting unavoidable runtime differences.

## 10. Architecture, hosting, and data

### 10.1 Recommended stack

- React + TypeScript + Vite for the web interface.
- Small Node.js/TypeScript API using Express or Fastify, chosen once during setup.
- Zod for input/output contracts; an image decoder such as Sharp for bounded server validation and re-encoding.
- IndexedDB for local journal records and image blobs.
- A single Render web service serving the built frontend and API on the same origin.
- Hosted open-weight vision inference behind a provider adapter.
- Local adapter calling Ollama from the local application server.

No central database is necessary for the anonymous local journal release. Use a package lockfile and pin the runtime version after confirming compatibility. The app's inference interfaces should remain small enough to implement a second backend without rewriting the UI.

### 10.2 Cloud flow

`Phone → Render app/API → validation + metadata stripping → hosted open vision endpoint → schema validation → short card → browser journal`

A hosted open model still receives uploaded images. Openness does not automatically make cloud use private, offline, or free. Confirm the selected provider's retention policy and describe it accurately before launch. Our server should not intentionally persist uploaded photos or include them in logs; that does not control provider storage.

Hugging Face documents image-text inference through providers, but a model's downloadable weights do not guarantee that a compatible live endpoint is available. Before choosing a provider, verify its exact model identity, support for two images/data URLs, output control, authentication, retention terms, actual request price, and a successful test request. [Image-text inference documentation](https://huggingface.co/docs/inference-providers/tasks/image-text-to-text)

### 10.3 Local flow

`Local browser or phone on trusted LAN → local SketchWild server → Ollama on that computer → browser journal`

Default local app and Ollama binding should be loopback. Phone access requires explicitly configuring the app for the trusted LAN and testing camera/upload behavior; mobile browser permissions differ between local HTTP and HTTPS. File upload must remain usable even if direct camera capture is unavailable. Do not expose Ollama publicly just to make the demo accessible. A public Render site does not automatically connect to the developer's laptop.

Ollama's chat API supports structured response formats; verify the selected model/runtime's image handling with the real pair test. [Ollama API](https://docs.ollama.com/api/chat)

Local mode needs installation and initial downloads. Claim offline inference only after demonstrating the cached app and model with internet disconnected. In the hosted version, losing internet may allow saved journal viewing or drawing steps after loading, but it does not make cloud inference work offline. Full installable offline PWA caching is P1.

### 10.4 Image and request constraints

Initial configurable limits: two JPEG/PNG/WebP files, each ≤8 MB, total ≤16 MB; cap decoded dimensions/pixel count before costly processing; re-encode to a longest edge around 1280 px as the initial experiment. Validate whether this preserves fine veins and pencil marks; raise resolution selectively if task quality requires it. Keep uploaded originals in the browser if storage permits, use reduced images for inference, and make image size visible in evaluation logs.

Reject malformed or excessive inputs server-side even if the browser already checked them. Avoid accepting arbitrary remote image URLs in the public API. Serve feedback as escaped plain text, not executable HTML/Markdown. Restrict inference destination URLs to configured server endpoints. Keep API keys in server environment variables.

### 10.5 Minimal endpoints

| Endpoint | Purpose | Notes |
|---|---|---|
| `GET /api/health` | App readiness | No secrets or provider credentials |
| `GET /api/capabilities` | Category readiness, processing mode, model display identity | Never expose internal endpoints |
| `POST /api/coach` | Two multipart images + category + bounded session intent | Validated result or typed error; no journal persistence |

Analysis timeout target: 45 seconds cloud, separately configurable local timeout up to 120 seconds for a measured CPU experiment. Enforce limited concurrency and return a retryable busy response rather than accumulating unlimited requests. Initial public limit: three analyses per short session window, supplemented by IP/server controls; the browser identifier alone is not an abuse barrier. A single-instance in-memory limiter is sufficient for the challenge prototype with its limitations documented. Set a global request/cost cap and a clear budget-exhausted response.

### 10.6 Local data model

`Session`: ID, optional parent-session ID for revisits, created/updated timestamps, schema version, lifecycle state, subject category, selected task, suggested duration, optional intent, subject blob reference, first-sketch blob reference, normalized inference sizes, feedback object, model/prompt metadata, optional second-sketch reference, optional reflection, usefulness rating, and self-reported timing.

Lifecycle: `draft → first_sketch → photos_ready → feedback_ready → second_look → completed`. Retake and failure states retain the latest committed draft. `analyzing` is transient; a refresh must not automatically resubmit a paid inference request. Store the completed response before transitioning to feedback-ready. Use IndexedDB transactions to avoid orphan records/blobs.

Store blobs in IndexedDB rather than base64 in localStorage. Explain that journals belong to this browser/device and may be lost when site data is cleared. Catch storage failures and offer an immediate export. Release export should be one downloadable archive containing a JSON manifest and associated pictures, or another explicitly documented self-contained format. Optional printable/PNG output can follow. “Delete all” removes all app-owned journal records and image blobs after a clear confirmation.

### 10.7 Render and budget

Use the smallest paid web service that survives actual upload/concurrency testing to keep the demo available without free-tier wake-up delay. Render's current published comparison lists Starter at $7/month for 512 MB/0.5 CPU and Standard at $25/month for 2 GB/1 CPU. Confirm the account checkout price and credit eligibility before provisioning. [Render's published comparison](https://render.com/articles/render-vs-railway)

The user's $50 Render credit is a hosting resource, not evidence of free external model inference. Establish a separate inference budget, suggested initial cap $10 if affordable. Avoid promising a per-session price until a real request is billed/measured. Cost model: hosting + inference calls including retries + any bandwidth/storage overage. Local processing avoids per-request provider charges but consumes device resources.

Render free services sleep after inactivity, and their local filesystem is ephemeral. Keeping the journal in IndexedDB avoids losing it on server redeploys. [Render free-service documentation](https://render.com/docs/free)

## 11. Experience, accessibility, and content design

Use a warm paper-like interface with forest green accents, readable dark text, original outdoor imagery, and generous spacing. Subject cards make the six supported choices obvious. Make the user's paper drawings the visual focus. Avoid decorative charts, streak pressure, notification loops, and long onboarding.

- Primary action visible without excessive scrolling at common phone widths.
- Minimum 44 px touch targets and clear keyboard focus.
- Adequate text contrast and readable type; never use color alone for state.
- Descriptive image labels and assistive-technology announcements for analysis/error state.
- Reduced-motion support and no essential animation.
- File selection alongside any camera affordance.
- No mandatory account, exact location, real name, or personal profile.
- One short feedback card, roughly 40–80 words total visible copy.
- Usefulness controls and an obvious back/replace route.

User copy should emphasize invitation: “Try looking at…” and “I can't make out…” rather than “Your drawing is wrong.” Ask users to observe accessible plants without plucking leaves or disturbing habitats. Do not add a lengthy warning flow.

## 12. Verification and field trial

### Engineering checks

Test behaviors that could undermine the core experience: two-image request roles; schema validation and repair limit; unsupported/oversized/malformed images; provider timeout; limiter/budget exhausted; refresh while analyzing; journal blob recovery; delete/export; storage quota failure; and mobile camera-to-browser return. Run type checking and a production build. Use a real phone for the photo flow and at least one desktop browser for journal/export checks.

Do not create tests that merely repeat static UI text. A successful deployment is not proof of AI quality; the held-out image checks are separate.

### Three-person outdoor trial

Recruit adults who can try the app with paper and pencil. Ask permission before using their images or quotes in the public submission. Identify pilot data as a small convenience sample.

For each person, record the subject, first sketch, feedback, any inaccurate claim, whether they followed it, second sketch/detail, what they noticed, active phone interaction, inference wait, and desire to return. Encourage an additional detail sketch rather than requiring a prettier complete redraw.

Distribute the three-person pilot across different subject categories rather than testing only leaves; this does not replace the six-category model check. To challenge the AI-value assumption, have testers try a brief generic prompt on another subject in the same category where practical, varying order. Ask which was useful and why. This small comparison is exploratory and subject/order effects remain; do not call it proof of superior learning. If generic prompts work as well, say so and explain whether personalized feedback earns its cost.

Reflection questions: What did you notice after the card? Was anything wrong? Did the upload interrupt the experience? Would you use it again without being asked? What one change would help?

Save all model mistakes and failed sessions. Publish raw counts, representative examples, and limitations. If only the creator tests the product, label it a creator trial rather than inventing participants or testimonials.

## 13. Execution plan for the remaining challenge window

Work estimates are planning assumptions. Arrange testers while the first technical experiment runs; outdoor evidence depends on daylight and availability.

| Date / order | Deliverable | Exit criterion |
|---|---|---|
| 9 Oct, first 4 focused hours | New repository; six-category photo/sketch fixtures; minimal model spike | Initial pair results across categories, hosted availability, and local feasibility decision recorded |
| 9 Oct, next 4–6 hours | Session/photo/feedback vertical slice | Real pair yields a valid card in the app |
| 10 Oct, first 4–6 hours | Subject policies, draft recovery, journal filters/revisits, export, error states, local adapter | Full session completes across categories and survives refresh |
| 10 Oct, daylight | Outdoor pilot with up to 3 people | Before/after evidence and candid feedback captured |
| 10 Oct, later | Render deployment and phone verification | Public link works; provider/cost disclosure accurate |
| 11 Oct, first 3–4 hours | Category-level held-out checks and fixes informed by pilot | Core release checklist passes; category readiness accurately reported |
| 11 Oct, afternoon/evening IST | Demo recording, README, DEV draft, publish with buffer | Post includes real evidence, demo, repository, and open innovation explanation |

If progress slips, protect the completed core flow and real demonstration. Video is the fallback demo when public inference cannot be made reliable within the budget. Never turn a canned sample into an apparently live success to meet the deadline.

## 14. Submission and evidence plan

Potential title: **“SketchWild: draw outside, get one observation, look again.”** Rewrite it around the actual trial rather than using a fabricated first-person story.

Suggested 90-second demo: show the subject library and a real outdoor subject with paper; upload the two pictures; show the exact feedback; return to the subject; show a new detail; open the saved entry and another category example. Include a quick view of an uncertain response so reliability is part of the demonstration. A prerecorded example may appear but must be identified.

| Template section | Required material |
|---|---|
| What I Built | Person/problem, short workflow, and how the app supports outdoor observation |
| Demo | Working URL and/or video; explain any sample mode |
| Code | New repository; install/run instructions; license; model/adapter information |
| How I Built It | Two-image pipeline, model choice, prompt/output contract, one bug and fix |
| Why Open Innovation Matters | Concrete model swap or local inference evidence; accurate cloud tradeoffs |
| My Agent Session | Optional real build-session link/export; do not invent one |
| Prize Categories | Render if meaningfully deployed; Gemma only if actually used; recheck official category wording |

Record exact model versions and representative outputs. Keep research sources in the README; a brief post citation is optional when research directly informs the story. Preserve any attribution required by material actually reused. README should distinguish development setup, hosted processing, local processing, tested hardware, and unimplemented future features. Choose a permissive license for original app code and preserve separate model/dependency notices.

Useful openness claims, conditional on implementation: “The inference adapter lets me compare two open models without changing the interface”; “The local setup processes my photos with downloaded weights”; “Users can inspect and change the feedback policy.” Demonstrate each claimed behavior. Hosted mode still needs internet and provider resources.

## 15. Risks and decisions

| Risk | Early signal | Response |
|---|---|---|
| Model invents drawing flaws | Unsupported observations on clear pairs | Revise prompt/input size; switch model; simplify claims if necessary |
| Feedback is generic | Sketch swaps produce equivalent advice | Prove pair dependence or use transparent subject-only product scope |
| Pencil marks are invisible | Frequent retake/uncertain outputs | Better capture instructions and tested resolution |
| Uploads dominate experience | Testers spend more time uploading than looking | Shorten flow; allow annotated second detail; remove optional fields |
| No improvement over a printed card | Testers prefer generic prompts | Report result and revise the value proposition |
| CPU too slow | Actual warm requests exceed acceptable wait | Use hosted inference for visitors and document local limitations |
| Hosted endpoint unavailable/costly | No successful two-image test | Select another verified open endpoint or use local video demo |
| Journal loss | Quota failure or cleared browser data | Clear storage explanation and export recovery |
| Deadline overload | Core slice unfinished on 10 Oct | Cut P1; reserve trial and writing time |
| Overclaimed novelty | Prior art substantially overlaps | Credit it and explain the specific implementation contribution |

**Settled product choices:** six outdoor subject categories; paper-first; category-specific guidance; one invitation; no art score; anonymous local journal with filters/revisits; same-origin hosted app/API; open vision model central; local/cloud distinction explicit. Research credits belong in supporting documentation/submission where useful; no website credits section is required, except any attribution required by actual reused material's license.

**Unresolved build choices:** selected exact model/revision, provider, latency/cost, local runtime RAM, photo resolution, tester availability, and credit eligibility. These require implementation/account evidence, not another broad feature brainstorm.

## 16. Definition of done

- A first-time user completes a real outdoor subject session on a phone.
- Leaves, flowers, whole trees, bark, rocks, and outdoor scenes each have a complete guided experience and correctly reported coaching readiness.
- The model's category-level evaluation is recorded; the full planned AI release requires all six categories to pass, and any guided-only gaps are explicitly documented as incomplete scope.
- Live open-model inference uses both actual photos and exposes correct model metadata.
- Held-out evaluation is recorded, with inaccurate and uncertain cases retained.
- Errors preserve drafts and lead to a usable recovery action.
- Journal records and images survive refresh; delete/export work.
- Hosted processing disclosure matches the implemented provider path.
- Any claimed local/offline mode has been demonstrated under those conditions.
- A genuine outdoor session is documented; sample images are clearly distinguished.
- New repository includes reproducible setup, original code license, credits, and limitations.
- Published submission includes the required tags/template, code, demo, and explanation of openness before the deadline.

**The strongest finished product is a small observation loop people can use and trust. Its competitive case should rest on evidence from that loop, a thoughtful explanation, and a reliable implementation.**
