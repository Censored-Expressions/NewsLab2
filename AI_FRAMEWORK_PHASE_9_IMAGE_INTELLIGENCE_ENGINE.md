# AI Framework Phase 9 - Image Intelligence Engine

## Mission

Build the Image Intelligence Engine: a governed system that discovers, evaluates, licenses, ranks, selects, verifies, documents, and learns from images for every story, article, social post, newsletter, Creator Desk post, and multimedia product produced by the Framework OS.

The system must optimize for:

- Editorial relevance.
- Visual quality.
- Legal usability.
- Source credibility.
- Accurate context.
- Diversity of image options.
- Reliable attribution.
- Automated decision-making.
- Human review for elevated-risk uses.

Image Intelligence does not merely find pictures. It makes defensible visual-publishing decisions and preserves the evidence behind each decision.

## Project Objective

Create a complete image-intelligence pipeline that can:

- Understand the visual requirements of a story.
- Search approved commercial, editorial, public, partner, internal, and AI-generated image sources.
- Verify that each candidate image matches the story.
- Identify licensing, attribution, geographic, temporal, channel, and usage restrictions.
- Detect misleading, manipulated, duplicated, outdated, or contextually incorrect images.
- Rank all viable candidates.
- Select the strongest legally usable image.
- Create a permanent Image Dossier documenting the decision.
- Monitor image performance after publication.
- Learn which image characteristics improve engagement without sacrificing accuracy, fairness, legality, or editorial standards.

## Source Ecosystem

The Image Intelligence Engine supports modular source adapters.

### Commercial And Royalty-Free Sources

- Pexels.
- Pixabay.
- Unsplash or other approved royalty-free providers.
- Internal licensed image collections.
- Organization-owned photography.
- User-uploaded media after verification.

### Editorial And News Sources

- Getty Images.
- Associated Press.
- Reuters.
- Other contracted editorial image providers.
- Government and public-agency media libraries.
- Official press kits.
- Sports league, team, company, and institutional media resources.

### Artificial Intelligence Sources

- Framework-generated illustrations.
- Editorial concept art.
- Data-driven graphics.
- Background images.
- Generic explanatory visuals.
- Branded social graphics.
- Non-photorealistic representations of abstract events or topics.

AI-generated media must never be represented as documentary photography.

## Core Image Pipeline

```text
Story Dossier
  -> Visual Intent Extraction
  -> Image Search Brief
  -> Source Routing
  -> Candidate Retrieval
  -> Candidate Normalization
  -> Image Understanding
  -> Context Verification
  -> Licensing and Rights Verification
  -> Risk Screening
  -> Ranking
  -> Approval Gate when required
  -> Attribution and Accessibility
  -> Publication
  -> Image Dossier
  -> Performance Learning
```

## Stage 1 - Visual Intent Extraction

The engine analyzes the Story Dossier and determines:

- Primary subject.
- Supporting subjects.
- Event.
- Location.
- Date or time period.
- Emotional tone.
- Editorial category.
- Required orientation.
- Required dimensions.
- Documentary versus illustrative need.
- Sensitivity level.
- Publication channels.
- Licensing budget.
- Geographic restrictions.
- Expected shelf life.

The result becomes an Image Search Brief.

## Stage 2 - Source Routing

The source router determines which providers should be searched.

### Example Routing

| Story Type | Preferred Source Routing |
| --- | --- |
| Breaking world event | AP, Reuters, Getty, official sources. |
| Local community story | Local government, organization, photographer, public records. |
| Evergreen lifestyle article | Pexels, Pixabay, Unsplash, owned library. |
| Abstract technology story | Licensed stock or clearly labeled AI illustration. |
| Sports event | Authorized editorial provider, league, team, photographer. |
| Historical story | Archives, government repositories, licensed historical collections. |
| Company or market story | Company press kit, exchange imagery, licensed stock, charts. |

Source routing should be driven by visual intent and risk, not by whichever provider responds first.

## Stage 3 - Candidate Retrieval

Each source adapter returns normalized metadata:

- Image ID.
- Provider.
- Preview URL.
- Original asset location.
- Caption.
- Photographer or creator.
- Creation date.
- Publication date.
- Event date.
- Location.
- People depicted.
- Keywords.
- Orientation.
- Resolution.
- File type.
- License category.
- Attribution requirements.
- Usage restrictions.
- Territory restrictions.
- Expiration date.
- Estimated cost.
- Source confidence.

## Stage 4 - Candidate Normalization

The engine converts provider-specific results into a shared internal image format.

Normalization prevents the ranking system from favoring a provider only because it supplies more detailed metadata.

## Stage 5 - Image Understanding

Computer vision and metadata analysis identify:

- People.
- Objects.
- Logos.
- Locations.
- Text appearing inside the image.
- Facial expressions.
- Crowd size.
- Weather.
- Indoor or outdoor setting.
- Political symbols.
- Sports uniforms.
- Violence.
- Weapons.
- Medical content.
- Nudity.
- Sensitive personal information.
- Possible synthetic or manipulated content.

## Stage 6 - Context Verification

The system checks whether the image accurately represents:

- The correct person.
- The correct event.
- The correct location.
- The correct date or time period.
- The correct organization.
- The correct political office or role.
- The correct sports team or competition.
- The claims made in the article.
- The intended emotional framing.

An image can be visually attractive and still be rejected for contextual inaccuracy.

## Stage 7 - Licensing And Rights Verification

Every candidate receives a licensing determination:

- Approved.
- Approved with attribution.
- Approved for editorial use only.
- Approved for limited channels.
- Approved for limited duration.
- Requires purchase.
- Requires manual confirmation.
- Prohibited.
- Unknown rights.

Unknown rights default to non-publication until resolved.

No image should reach publication without a machine-readable rights status.

## Stage 8 - Risk Screening

The system evaluates:

- Misidentification risk.
- Defamation risk.
- Privacy risk.
- Copyright risk.
- Trademark risk.
- Manipulation risk.
- Political framing risk.
- Graphic-content risk.
- Minor protection risk.
- Publicity-rights risk.
- Misleading-crop risk.
- AI-disclosure risk.
- Outdated-image risk.

## Stage 9 - Image Ranking

Approved images are ranked using a weighted scoring model.

### Ranking Components

| Component | Weight |
| --- | --- |
| Story relevance | 22% |
| Identity and event accuracy | 18% |
| Licensing confidence | 15% |
| Source credibility | 10% |
| Visual quality | 10% |
| Recency | 7% |
| Editorial usefulness | 6% |
| Composition and crop suitability | 5% |
| Channel compatibility | 4% |
| Historical performance | 3% |

Risk penalties are applied after the base score.

### Penalties And Automatic Blocks

| Issue | Action |
| --- | --- |
| Unverified licensing | Automatic rejection. |
| Incorrect date or event | Automatic rejection. |
| Suspected manipulation | Severe penalty or manual review. |
| Weak subject match | Ranking reduction. |
| Excessive branding or watermark | Rejection. |
| Misleading emotional framing | Severe penalty. |
| Duplicate image already overused | Diversity penalty. |
| Low resolution | Quality penalty. |
| Missing attribution information | Licensing penalty or hold. |

## Confidence Scoring

The engine maintains separate confidence values rather than relying on one generalized score.

### Required Confidence Scores

- Subject identity confidence.
- Event match confidence.
- Location confidence.
- Date confidence.
- Caption confidence.
- License confidence.
- Source confidence.
- Manipulation detection confidence.
- Editorial relevance confidence.
- Overall publication confidence.

A high visual ranking score cannot override low licensing or identity confidence.

### Decision Thresholds

| Score | Decision |
| --- | --- |
| 90-100 | Eligible for automated publication. |
| 75-89 | Eligible with policy-dependent review. |
| 50-74 | Manual review required. |
| Below 50 | Reject. |
| Unknown license | Reject regardless of score. |
| Identity conflict | Reject or escalate regardless of score. |

Thresholds should be configurable by publication type and risk category.

## Image Dossier

Every selected image receives an auditable dossier.

### Dossier Contents

- Story ID.
- Image ID.
- Provider.
- Original source.
- Creator or photographer.
- Caption.
- Alt text.
- Image description.
- Subjects identified.
- Event represented.
- Location.
- Relevant dates.
- Search terms used.
- Candidate ranking.
- Final ranking score.
- Confidence scores.
- License type.
- License evidence.
- Purchase or contract reference.
- Attribution instructions.
- Usage limitations.
- Approved channels.
- Geographic restrictions.
- Expiration date.
- AI-generation disclosure.
- Editing history.
- Crop history.
- Reviewer decisions.
- Rejected alternatives.
- Rejection reasons.
- Publication locations.
- Performance results.
- Renewal or removal requirements.

The Image Dossier is the legal, editorial, operational, and learning record for the image.

## Licensing Intelligence Layer

The licensing layer will:

- Normalize provider license terms.
- Store evidence of permitted use.
- Track attribution language.
- Distinguish commercial, editorial, personal, promotional, and internal use.
- Prevent use outside authorized channels.
- Detect expiring licenses.
- Prevent reuse when a license is story-specific.
- Track purchase costs.
- Associate contracts with individual assets.
- Generate attribution automatically.
- Create removal alerts.
- Maintain a rights audit trail.

## AI Image Governance

AI-generated images require a separate policy path.

### Permitted Uses

- Abstract concepts.
- Editorial illustrations.
- Generic backgrounds.
- Branded graphics.
- Data visualization.
- Fictional scenarios.
- Clearly labeled reenactments.
- Conceptual depictions where documentary photography is unavailable or inappropriate.

### Restricted Uses

- Images that imply a real event occurred.
- Fabricated documentary photography.
- False depictions of identifiable people.
- Fake crime-scene imagery.
- Fake election activity.
- Fabricated war or disaster photography.
- Deceptive medical imagery.
- Images likely to be mistaken for authentic evidence.

### Required AI Metadata

- Generation model.
- Generation date.
- Prompt or generation brief.
- Editing history.
- Human reviewer when required.
- Disclosure requirement.
- Synthetic-media label.
- Restricted-use flags.
- Provenance information.

## Editorial Image Policies

The engine must distinguish between:

- Documentary image.
- File photo.
- Archival image.
- Illustration.
- AI-generated illustration.
- Composite image.
- Screenshot.
- Chart.
- Map.
- User-generated content.
- Promotional image.
- Handout image.
- Public-domain image.

The displayed caption must make the category clear whenever ambiguity could mislead the audience.

## Human Approval Gate

Manual approval is required for:

- Breaking news involving uncertain identities.
- Crime suspects or victims.
- Minors.
- Graphic violence.
- War and terrorism.
- Elections.
- Medical content.
- Private individuals.
- User-generated media.
- Unverified social-media images.
- AI depictions of real people.
- Disputed licensing.
- Manipulation alerts.
- Images with conflicting metadata.
- High-cost licensed assets.

The Approval Gate records:

- Reviewer.
- Decision.
- Rationale.
- Conditions.
- Expiration.
- Required follow-up.

## Post-Publication Image Repair

Image quality should not block otherwise publishable articles when the article meets editorial standards.

If a suitable image is not available before publication:

```text
Publish article with approved fallback
  -> Create image-repair task tied to Story ID
  -> Continue provider search or generated-image workflow
  -> Verify image relevance and rights
  -> Replace image in place
  -> Preserve article publish date
  -> Record updated image dossier
```

Minor image improvements should not remove articles from public view.

## Image Performance Learning

After publication, the engine measures:

- Click-through rate.
- Article-open rate.
- Scroll depth.
- Reading completion.
- Social engagement.
- Newsletter interaction.
- Thumbnail performance.
- Image replacement rate.
- Complaints.
- Corrections.
- Licensing incidents.
- Accessibility performance.
- Performance by image style.
- Performance by source.
- Performance by editorial category.

The system should learn visual patterns without optimizing toward sensationalism, stereotyping, or misleading imagery.

## Accessibility Requirements

Every published image must include:

- Accurate alternative text.
- A meaningful caption when required.
- Sufficient visual contrast for embedded text.
- Text-free alternatives for complex graphics.
- Descriptions of charts and diagrams.
- Identification of decorative images.
- Avoidance of text baked into images when possible.

AI may draft alternative text, but sensitive or complex images may require human review.

## Image Intelligence Components

```text
Image Intelligence Engine
  -> Visual Intent Analyzer
  -> Image Search Brief Generator
  -> Source Router
  -> Pexels Adapter
  -> Pixabay Adapter
  -> Unsplash Adapter
  -> Getty Adapter
  -> AP Adapter
  -> Reuters Adapter
  -> Government Media Adapter
  -> Internal Library Adapter
  -> AI Image Generator
  -> Metadata Normalizer
  -> Computer Vision Analyzer
  -> Identity Verification Engine
  -> Event and Context Matcher
  -> Duplicate Image Detector
  -> Manipulation and Synthetic Media Detector
  -> Licensing Intelligence Layer
  -> Image Risk Engine
  -> Confidence Scoring Engine
  -> Image Ranking Engine
  -> Approval Gate
  -> Crop and Format Optimizer
  -> Attribution Generator
  -> Accessibility Generator
  -> Image Dossier
  -> Publication Connector
  -> Performance Analytics
  -> Image Learning Loop
```

## Integration With Framework OS

| Framework Layer | Image Intelligence Role |
| --- | --- |
| Knowledge | Stores providers, licensing rules, visual history, source credibility, and performance evidence. |
| Reasoning | Determines visual intent, candidate suitability, contextual accuracy, and risk. |
| Execution | Searches providers, retrieves candidates, purchases or requests assets where authorized, formats images, generates captions, and attaches attribution. |
| Verification | Checks identity, event, context, licensing, file integrity, dimensions, and publication compatibility. |
| Optimization | Improves ranking, crops, file sizes, responsive formats, source routing, and cost efficiency. |
| Learning | Identifies which visual strategies work by channel and story type. |
| Governance | Enforces licensing, editorial standards, disclosure rules, safety policies, and approval requirements. |
| Applications | Provides images to News Lab, Current Website, newsletters, social media, video production, mobile applications, Creator Desk, and future products. |

## Minimum Viable Engine

The first operational version should include:

- Pexels and Pixabay integrations.
- Unsplash integration if terms remain compatible with the intended use.
- Internal image-library ingestion.
- Standardized image metadata.
- Story-to-image semantic matching.
- Basic license classification.
- Image ranking.
- Confidence scoring.
- Duplicate detection.
- Alt-text and caption generation.
- Image Dossier creation.
- Human approval workflow.
- Publication logging.
- Post-publication image repair queue.

Getty, AP, Reuters, advanced synthetic-media detection, automated purchasing, and enterprise contract management can be added through controlled expansion.

## Success Criteria

The engine is production-ready when it can demonstrate:

- Every published image has a traceable source.
- Every image has a documented rights determination.
- Incorrect-subject and incorrect-event images are reliably blocked.
- Unknown-license images cannot be published.
- AI-generated images are clearly classified.
- Image-selection decisions can be reconstructed from the dossier.
- Duplicate and overused imagery is reduced.
- Image search time is materially reduced.
- Human reviewers can override decisions with documented reasoning.
- Performance learning improves selection without weakening editorial integrity.
- The system can support additional providers without redesigning the core engine.

## Final Deliverable

The Image Intelligence Engine deliverable includes:

- Image Intelligence architecture.
- Provider-adapter framework.
- Image Search Brief schema.
- Normalized image-record schema.
- Image Dossier schema.
- Licensing decision engine.
- Ranking and confidence models.
- Editorial risk policies.
- AI-image governance rules.
- Human Approval Gate.
- Attribution and accessibility generators.
- Performance-learning system.
- Provider integration specifications.
- API design.
- Database design.
- Testing and verification standards.
- Deployment documentation.
- Governance documentation.
- Patent-candidate documentation.

Project 9 creates a governed visual-publishing system that can safely attach the best available image before publication or continue improving imagery after publication without removing otherwise valid articles from public view.
