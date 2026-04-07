# Product Owner Research

Date: 2026-04-08
Repository: `bilingual-interlinear-learning-app`
Reviewer: Codex + parallel review agents

## Scope

Review product readiness of BILA from product owner perspective, based on current repository state and PRD alignment.

## Current Product Shape

BILA already supports core demo flow:

1. Import JSON into editor
2. Edit interlinear pairs
3. Save content
4. View saved content in library
5. Read lesson in reader

Current implementation still behaves like a functional demo, not a full product workspace.

## Evidence Base

- `docs/PRD.md`
- `src/components/Editor.tsx`
- `src/store/useEditorStore.ts`
- `src/app/api/content/route.ts`
- `src/app/api/content/[id]/route.ts`
- `src/app/library/page.tsx`
- `src/app/reader/[id]/page.tsx`
- `prisma/schema.prisma`
- `README.md`

## Prioritized Findings

### P0

#### 1. Validation before save is insufficient

Problem:
- Invalid or empty metadata/pairs can still be saved.
- Import failure is not surfaced clearly to user.

Why this matters:
- Product promise is high-quality human-validated content.
- Weak validation breaks trust in saved lessons.

Repo evidence:
- `src/app/api/content/route.ts` only checks presence of `metadata` and `data`
- `src/store/useEditorStore.ts` parses JSON but only logs parse failure
- `src/components/Editor.tsx` closes import flow without robust validation state

Smallest practical next action:
- Add shared validation for `title`, `source_lang`, `target_lang`, and non-empty pairs
- Show inline validation errors
- Disable save until content is valid

#### 2. Content lifecycle is incomplete

Problem:
- User can create and read content, but cannot edit saved lessons or delete them.

Why this matters:
- PRD explicitly requires stored content to be editable and removable.
- Human-in-the-loop flow is incomplete without post-save correction.

Repo evidence:
- `docs/PRD.md`
- `src/app/api/content/route.ts`
- `src/app/api/content/[id]/route.ts`
- `src/app/library/page.tsx`

Smallest practical next action:
- Add `PATCH` and `DELETE` content APIs
- Add library actions for `Edit` and `Delete`
- Support loading existing lesson into editor

#### 3. No editorial workflow state

Problem:
- Saved content has no `draft` vs `published` status.
- Schema lacks editorial metadata for governance and curation.

Why this matters:
- AI-generated content needs review stage before publication.
- No clean distinction between work-in-progress and publish-ready lessons.

Repo evidence:
- `prisma/schema.prisma`
- `src/components/Editor.tsx`
- `docs/PRD.md`

Smallest practical next action:
- Add `status` field first
- Follow with `category`, `tags`, `difficulty`, `reviewedAt`, `sourceReference`

### P1

#### 4. Editor does not fully match PRD

Problem:
- `splitPair` exists in state but is not available in UI.
- Metadata editing is weak inside editor flow.

Why this matters:
- Validator workflow is slower than intended.
- Product requirement for split/merge is only partially delivered.

Repo evidence:
- `docs/PRD.md`
- `src/store/useEditorStore.ts`
- `src/components/Editor.tsx`

Smallest practical next action:
- Add split action in editor
- Add metadata form fields and pair-level validation indicators

#### 5. Reader lacks learning controls

Problem:
- Reader mainly renders text plus font/theme settings.
- No hide/show translation, progress, bookmarks, or TTS.

Why this matters:
- Product has weak retention and low learning depth.
- Roadmap already identifies hide/show and TTS as next-value features.

Repo evidence:
- `docs/PRD.md`
- `src/app/reader/[id]/page.tsx`
- `src/store/useSettingsStore.ts`

Smallest practical next action:
- Ship hide/show translation first
- Then add progress and `lastOpenedAt`
- Add TTS after that

#### 6. Library lacks discovery and organization

Problem:
- No search, filter, sort, category, or continue-reading behavior.

Why this matters:
- Flat library breaks down as lesson count grows.
- Product does not help user return to or find useful lessons.

Repo evidence:
- `docs/PRD.md`
- `src/app/library/page.tsx`
- `prisma/schema.prisma`

Smallest practical next action:
- Add `category`
- Add title search
- Add language filter and recent sorting

#### 7. Product readiness artifacts are weak

Problem:
- README still template
- No visible smoke tests for core user flow
- No basic analytics hooks for key actions

Why this matters:
- Hard to verify release readiness
- Hard to measure adoption of key workflows

Repo evidence:
- `README.md`
- `.github/workflows/docker-build.yml`

Smallest practical next action:
- Replace README with product/dev guide
- Add smoke coverage for import-save-read
- Track `lesson_created` and `lesson_opened`

### P2

#### 8. Product packaging still feels like demo

Problem:
- Route and copy still use `demo`.
- Onboarding assumes user already knows external JSON workflow.

Why this matters:
- Weak first-use activation
- Lower trust and clarity

Repo evidence:
- `src/app/page.tsx`
- `src/app/demo/page.tsx`
- `README.md`

Smallest practical next action:
- Rename `/demo` to `/editor`
- Update copy to real workflow
- Add sample JSON and onboarding checklist

## Recommended Execution Order

### Sprint 1

1. Shared content validation and better error states
2. Content lifecycle: edit, delete, load existing content
3. Basic editorial status: `draft` and `published`

### Sprint 2

1. Reader hide/show translation
2. Library search/filter/sort
3. Editor split action and metadata editing

### Sprint 3

1. Progress and continue reading
2. TTS
3. README rewrite and smoke tests

## Delegated Work Status

This section must stay updated as implementation progresses.

### Execution Log

#### Update 1

Observed progress:
- Track A has started landing changes in repo.
- New validation helper created at `src/lib/contentValidation.ts`.
- `src/store/useEditorStore.ts` now uses parsed import helper and returns structured import result.
- Track B and Track C have been delegated but had not yet landed visible file changes at this update.

Risks to watch:
- `src/lib/prisma.ts` already had unrelated local modifications before this work.
- Untracked migration files already existed before delegation and should be treated carefully.

#### Update 2

Observed progress:
- Track A is now effectively landed in working tree.
- Editor now has metadata validation, inline pair validation, import error feedback, and save gating.
- Track B landed through central integration to keep momentum after delegated work stalled.
- Track C has been completed in working tree.
- Reader now supports persisted hide/show translation through settings.
- Library now exposes lifecycle actions for publish/draft state and delete.
- Full `npm run lint` passed after integration.

Open blocker:
- Prisma schema changed, but migration/database alignment still needs explicit follow-up.
- Existing lesson preload into editor is still not wired.

#### Update 3

Observed progress:
- Existing lesson preload is now wired through `/editor?id=<contentId>`.
- Editor now distinguishes create vs update flow and uses `PATCH` for existing lessons.
- Library `Edit` action now opens real editor flow for saved lessons.
- `/editor` is now primary route; `/demo` remains only as redirect for compatibility.
- Full `npm run lint` still passes after follow-up work.

Open blocker:
- Prisma schema changed, but migration/database alignment still needs explicit follow-up.
- Product copy/readme cleanup is still incomplete outside core routes.

### Track A: Validation and Editor Quality

Status: completed
Owner: Dirac (`019d6a35-4af5-7f72-8acf-4ae4433cfa76`)
Scope:
- Shared validation utilities
- Editor validation UI
- Save gating
- Import error visibility
Delivered:
- `src/lib/contentValidation.ts`
- metadata validation in editor
- inline pair-level validation feedback
- structured import result and import error handling
- save button disabled until content is valid

### Track B: Content Lifecycle and Editorial Workflow

Status: completed with documented follow-up
Owner: central integration after delegation
Scope:
- Content update/delete APIs
- Edit existing lesson flow
- Draft/published status
Delivered:
- `ContentStatus` added to Prisma schema
- `status` metadata added to app types
- POST route now validates content and accepts status
- detail route now exposes PATCH and DELETE
- library now shows status badge, publish/draft action, and delete action
- existing lesson can now be reopened in editor and updated in place
Remaining:
- migration/database verification
- richer editor workflow for split/merge and status editing

### Track C: Reader Learning Controls

Status: completed
Owner: Feynman (`019d6a35-4b69-7fb3-a2dc-f167d0a507c0`) plus central integration review
Scope:
- Hide/show translation control
- Reader settings/state updates
- Reader UI integration
Delivered:
- persisted `showTranslation` reader setting
- toggle control added to reader settings menu
- reader badge when translation is hidden
- interlinear renderer now supports translation visibility control

## Notes

- Existing unrelated worktree changes detected in `src/lib/prisma.ts` and untracked migration files.
- New work should avoid reverting or overwriting user changes.
