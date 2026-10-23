# Editorial and comparison UI update

Implemented nine individually composed vehicle story sections: cinema (DeLorean), expedition (GMC), wedge (Countach), field (Thar), concept (Furai), technical (R34), heritage (Hemi Cuda), open-air (992 Cabriolet), archive (930). Each uses existing sourced summaries and specification links, original headlines, distinct image/text placement, and responsive single-column arrangements.

Comparison now includes a common-scale SVG dimension view with side/footprint switching, a one-metre ruler, source links and explicit exclusions for missing dimensions. An opt-in WebGL mode projects supplied models orthographically, normalizing their longest horizontal extent to the recorded length. Geometry is loaded only on request; rendering uses a demand loop.

These are length-normalized **reference** silhouettes, not certified factory outlines. Model height, wheels, accessories and body proportions remain those of the supplied asset. Longitudinal-axis selection uses the longer horizontal bounding-box dimension; front/rear orientation is not asserted. The UI does not invent dimensions or mark existing GLBs as reviewed calibrated assets. Currently the R34 is the only catalogue record with the complete combined dimension field used by this view. Broader comparisons require sourced dimensions for the remaining records and model-specific review.

Verification: production build and 34 automated tests pass; browser regression passes across 25 routes and all 15 tools. Added checks exercise all nine unique layout classes, mobile overflow and dimension-view switching.

The focused software-WebGL check also passes. The loaded R34 silhouette and heritage layout were visually inspected; the rendering check waits for model loading to finish before capturing evidence. Story anchors include clearance beneath the sticky navigation.

Recommended next visual work:

- Replace repeated perspective posters with art-directed, consistent camera captures for each composition.
- Improve showroom lighting and horizon treatment across all models, judging dark paint separately from dark backgrounds.
- Add source-backed engineering callouts to selected visible parts after hotspot review.
- Add a restrained page-reading progress indicator and sticky chapter navigation on long vehicle stories.
- Capture visual-regression baselines for all nine stories in both themes and on tablet/mobile.

No deployment or new source verification dates were fabricated for this update.
