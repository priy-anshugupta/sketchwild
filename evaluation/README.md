# Real-pair evaluation

No completed field study is claimed. Collect permissioned photos and pencil sketches, not generated test images, for the quality evaluation.

Copy `pairs.example.json`, replace the example paths with your own images (paths are relative to the manifest), and start the app server. Then run `npm run evaluate -- evaluation/your-pairs.json`. Submit at most six pairs per batch and allow the ten-minute request window to reset between batches. The runner writes raw response records and blank human-review fields to ignored `artifacts/`. It stops on rate limits and never calls HTTP success an accuracy score. It sends images to the app server using the currently configured local or hosted provider, so use the intended processing mode.

Record per pair: category, file paths, intent, clear/unclear status, observable reference features, sketch features, model ID/digest, prompt version, response, inference time, reviewer judgment, and mistakes. Keep twelve development pairs separate from the 24 held-out pairs.

Each category requires three clear held-out pairs producing supported useful invitations plus one unclear/unrelated case avoiding confident invention before it is described as validated. This small preliminary gate is not a reliability guarantee.

For the outdoor pilot record actual participants/session count, consent, first sketch, card, second detail, phone interaction time, waiting time, subjective feedback, and whether they would use it again. Do not infer outdoors or screen-free time from a hidden tab.
