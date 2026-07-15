# Submission showcase

A single screen a reviewer uses to reach a confident advance-or-not on one
engineer's take-home, in about five minutes, without opening a pile of external
links. It is a high-fidelity prototype: the data is fixtures, but every state a
real reviewer hits is built and demoable.

## Run

```
npm install
npm run dev
```

Open the printed local URL. Use the "Demo states" control in the top corner to
switch between the five sample submissions, force any evidence block into a
loading / populated / empty / error state, move a submission through its
lifecycle, and toggle light and dark.

`npm run build` type-checks and produces a production bundle.

## Design

The interface adopts the "Frosted Glass" design system (cool-neutral,
near-monochrome, one desaturated slate accent, frosted glass as the recurring
signature) and integrates it into the existing multi-state architecture rather
than replacing it. The choices live in a comment at the top of
`src/components/PageShell.tsx` and in `src/index.css`.

- **Type.** TWK Lausanne (a neutral grotesque) for everything readable. Mono
  (IBM Plex Mono) is reserved for code only, which here is the README preview.
  Labels, eyebrows, badges, timestamps, and data readouts are all sans. Two
  weights, regular and medium; hierarchy comes from size and color.
- **Palette.** A cool ground, near-black ink, and one slate accent (`#5a7183`)
  reserved for the decision surface and primary actions. Everything else is
  neutral. The primary action is solid ink, not the accent, so the accent stays
  quiet. Link-health hues stay small and functional. Every text and surface pair
  passes WCAG AA in both themes.
- **Glass, used with restraint.** Frosted glass appears only on chrome that
  floats over the gradient ground: the evaluation dock, the mobile sheet, the
  header, overlays, and the dev control. Evidence blocks stay opaque white cards,
  per the system's own rule that glass over plain white reads as a normal card.
- **Layout.** One primitive, repeated: a split. A full-width context header,
  then a two-column body. Evidence is a fluid column; the evaluation dock is a
  fixed 360px so the decision surface never reflows, which is why it sticks
  cleanly.
- **Spacing.** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64, and nothing off it.

### The spectrum scorecard

The system's flagship data component is the `SpectrumScore`: each rubric
criterion plotted on a "needs work → exceptional" spectrum with a labelled
marker. It renders as the read-only representation of a **decided** submission,
a dark dotted-grid panel inside the glass dock, so the recorded profile reads at
a glance. While a submission is still open, the scorecard is the interactive
segmented 1–4 scale; the spectrum is display-only, which is where it belongs.

## Two independent state axes

The credit is in the states, and there are two axes that are easy to conflate.

**Lifecycle** is one status per submission and drives the queue:
`needs-review → in-review → { advanced | rejected | awaiting-candidate }`, with
`awaiting-candidate` returning to `in-review`. Requesting a missing artifact
parks the submission instead of penalizing the gap. `advanced` and `rejected`
are terminal: viewing one is read-only, the scorecard is locked, and the
decision is stamped with who and when.

**Evidence-block state** is per block and many at once: `loading → populated |
empty | error`. The load-bearing rule is that empty is not error. Empty means
the candidate did not include it (neutral, with a request action). Error means
they included it and it broke (a health indicator and a re-request). The only
two blocks where empty reflects on the candidate are the written approach and
the repository; everywhere else empty is neutral.

## What this deliberately does not build

- **No code editor or diff viewer.** Engineers read code in their own tools. The
  repo block surfaces signal (README, language mix, commit count, link health),
  not an in-browser IDE.
- **No multi-reviewer collaboration or score aggregation.** That belongs to the
  pipeline layer. The scorecard leaves a seam for it and stops there.
- **No candidate submission flow, auth, settings, or billing.** Out of scope for
  a reviewer's decision screen.

## Structure

```
src/
  data/submissions.ts        types + five fixtures covering every state
  lib/                       time formatting, lifecycle + health metadata
  components/
    PageShell, ContextHeader, QueueTable, StateSwitcher
    primitives/              StatusBadge, Chip, SectionCard, RatingControl,
                             EmptyState, LinkHealthIndicator, Skeleton, Toast
    evidence/                CandidateApproach, MediaShowcase (+ Demo, Gallery,
                             Loom children), RepoSummary, TechStack, EvidencePane
    evaluation/              Scorecard, ReviewerNotes, DecisionActions,
                             EvaluationPanel, MobileEvaluationDrawer
```

`MediaShowcase` is a switcher, not a stack: it mounts the best available
evidence (a live demo, else screenshots, else a walkthrough, else a neutral
empty) and each child owns its own loading, error, and empty rendering.

## Responsive

Desktop first. Below about 900px the grid collapses to one column and the
evaluation panel detaches into a bottom sheet with a persistent "Score" trigger.
Mobile is framed as triage (skim, decide, request more), not deep evaluation.
