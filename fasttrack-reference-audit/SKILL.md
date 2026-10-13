---
name: fasttrack-reference-audit
description: Audit every reference in a manuscript or bibliography against live scholarly records — checking that each identifier is registered, that the stated authors, year, journal, volume, pages, title and document type match the real record, that in-text markers line up with list entries, and that claims attributed to a source are supported by that source's abstract. Runs on the FastTrack literature connector alone, in any discipline. Use whenever someone shares a reference list, bibliography or manuscript and asks to check, verify or audit the references or citations; asks whether any citations are fabricated, hallucinated or AI-generated; asks to check DOIs; or asks whether a draft is safe to submit on citation grounds. Raises flags for a human to check. Never certifies a reference as sound and never declares one fake. Does not review methods, statistics, structure or argument — other skills do that.
---

# Reference audit

Every claim this skill makes must be traceable to a tool call made in **this
conversation**. That is the whole point of it.

An AI that vouches for a citation from memory is worse than no check at all:
it takes a fabricated reference and gives it a verification stamp. If the tool
was not called, the verdict is **UNCHECKED** — not "passed".

## Quote, never reconstruct

- Report what the tool returned, verbatim. Do not paraphrase a title, do not
  tidy an author name, do not infer a year.
- When the reference and the record disagree, print **both**, labelled. Never
  silently correct the reference to match the record.
- Never fill a missing field from memory. Missing is a finding.
- If you did not call a tool for a reference, say so in the output.

## Scope: references only

This skill checks **references and the citations that point at them**. Nothing
else.

Do not assess methods, statistics, study design, PRISMA arithmetic, internal
contradictions between sections, structure, framing or argument. Other
FastTrack skills do that, and mixing them dilutes both.

### Report the mismatch. Stop before the consequence.

This is the boundary, and it is easy to cross without noticing. Comparing the
manuscript against a source is this skill's job. Judging what the mismatch
means for the review's design is not.

| In scope | Out of scope |
|---|---|
| "Appendix C says the study was in the UAE; the abstract says Southern China" | "So the regional counts in 4.1 need recalculating" |
| "Appendix C codes this mixed methods; the abstract calls it a qualitative case study" | "So recount the 16 / 5 / 4 method totals" |
| "The table says 15 students; the abstract reports no participants" | "So this study may not meet your 'original empirical research' criterion" |
| "This study's participants are teachers" | "Your PICOT excludes teachers, so it shouldn't be included" |
| "No record found by the routes attempted" | A verdict on whether the journal is predatory |

Everything in the right-hand column is screening, synthesis or journal
selection. Other FastTrack skills own those, they do it properly, and an
audit that wanders into them produces a worse version of both.

**A next step may fix the reference, or fix the sentence that describes the
source. It may not redesign the review.** "Correct the location to China" is
in scope. "Recount your method totals" is not, even though it follows.

### Outside this audit

Noticing something out of scope is useful, and this section is where it goes.
It is not a loophole for doing the work anyway.

Note it in **one line** under **Outside this audit** at the very end, and move
on. A brief pointer is welcome — "worth a legitimacy check before it stays an
included study" tells the reader what kind of problem it is and who should
look. What is not welcome is working the problem: no paragraph, no
sub-analysis, no detail block, no recalculated totals, no verdict.

Two lines of the right shape:

> Arifani et al. and Bara & Dou include teacher participants, while the PICOT
> framework excludes teachers.
>
> Aceron et al.'s journal uses supplement issue numbering and may warrant a
> legitimacy check before it stays an included study.

**The creep to watch for is not in this section.** In testing it arrived
inside the audit proper: a detail block asking whether a study met the
"original empirical research" inclusion criterion, and two next-steps telling
the author to recount the method totals in section 4.1. Those are screening
and synthesis decisions wearing the clothes of a reference finding. Report the
mismatch that produced them, then stop.

## Four verdicts, and none of them is "fake"

| Verdict | Means | Confidence |
|---|---|---|
| 🔴 **DISCREPANCY** | The manuscript and the source demonstrably disagree, and you can quote both sides | Highest — it is shown, not suspected |
| 🟡 **CHECK** | Something may be wrong and this audit cannot settle it. A human opens the paper | Middling — a lead, not a finding |
| ✅ **VERIFIED** | Record matches, the manuscript cites it, and its claim was checked and supported | **Lowest** — see below |
| ❓ **NO RECORD** | Nothing came back after every route below was attempted | Not a judgement at all |

**These are not a severity scale, they are a confidence scale, and it runs
backwards from what people expect.**

🔴 is the most reliable verdict this skill issues. The manuscript says the
study was run in the UAE, the abstract says Southern China; both are quoted,
and no further work is needed to establish that they disagree. State it
plainly and let the author reconcile it.

✅ is the **least** reliable. It means no problem surfaced in the narrow slice
that was checked: a registry record and, at most, an abstract. The full text
was never read. Never write ✅ in language that implies the reference is
sound — it means "nothing found here", not "nothing wrong".

**Separate "I can show this" from "someone should look".** Putting them in one
bucket buries the demonstrated errors among the maybes, which is the failure
this distinction exists to prevent.

- 🔴 — a claim the abstract contradicts; a page range the record has
  superseded; an author count that disagrees; an entry the manuscript cites
  nowhere. Facts.
- 🟡 — a surname whose ordering needs the byline checked; a near-identical
  paper by the same author; a source cited for something its abstract does not
  address; an entry appearing only in an appendix. Leads.

Where a disagreement could be the **registry's** fault rather than the
manuscript's, say so, and keep it 🔴 anyway: it still has to be reconciled
before submission.

**An omitted field is not a discrepancy.** 🔴 requires two statements that
conflict. A reference that simply does not print a volume, a page range or a
DOI states nothing to conflict with, so it belongs in the housekeeping line
with the missing DOIs. In testing, a missing volume number was scored 🔴 and
sat in the headline count beside a single-group study described as
controlled — which devalues the number a supervisor reads first.

**Apply one colour to one kind of finding.** Where the manuscript asserts a
study characteristic and the source's abstract asserts a different one, that
is 🔴 whichever field it is: location, sample size, design, method, tools or
participant level. In testing the same class of mismatch came back 🔴 for a
method label and a participant count, but 🟡 for a participant level. Decide
by the shape of the finding, never by how important the field feels.

**❓ NO RECORD never becomes 🔴.** Not finding something is not the same as
showing something is wrong, and this is the line that stops the audit turning
into an accusation. A missing record stays ❓ no matter how many routes failed.

**The verdict is the worst finding on the row**, across the record, the
metadata, Pass 1 and the claim together.

### ✅ requires a settled claim

A row earns ✅ only when **all four** hold: a record came back, the metadata
matches, the manuscript cites it, and the claim made from it **was checked and
supported**.

If the claim was not settled, the row is 🟡 — whatever the reason:

| Claim state | Verdict | Because |
|---|---|---|
| supported | ✅ | Checked, and it holds |
| **partially supported** | 🟡 | Part of what was attributed to it holds, part does not |
| **contradicted** | 🔴 | Shown to disagree |
| **not addressed** | 🟡 | The abstract neither confirms nor denies. Open the paper |
| **needs full text** | 🟡 | No abstract exists, so it can never be settled here |
| **not checked** | 🟡 | Nobody looked. An honest gap, not a pass |

Green says a reader can move on. A claim resting on a paper nobody has opened
is the opposite of that, and this section previously let those rows render ✅
while the Pass 5 text called "not addressed" a yellow flag meaning *open the
paper*. The table cannot contradict the prose.

**This will produce more yellow than you expect, and that is the correct
answer.** In testing, a 46-reference review had 8 references with no abstract
available and 8 more whose abstracts did not address the claim. Sixteen papers
someone has to open is the single most useful thing that audit can tell an
author before submission. Hiding it behind a green tick to keep the column
tidy is the failure, not the count.

The Claim column always states *which* of the five it is, so a reader can tell
a real lead from an unavailable abstract at a glance, and the counts line
breaks the same thing down numerically.

**NO RECORD is not an accusation.** Legitimate causes: a DOI registered at
acceptance that is not yet live; a repository or preprint deposit ahead of the
journal version; a book, thesis, report, standard or conference paper with no
DOI; a very recent paper not yet indexed; a typo.

Never write "fabricated", "fake", "hallucinated" or "does not exist". Write
"no record found by the routes attempted" and list the routes.

Telling a researcher their real citation is fabricated destroys trust in the
audit permanently. Missing one fake does not.

## Check every reference

Audit **all** of them, in list order — not a sample, not only the ones that
look suspicious, not only the studies included in a review. Uncited and
unglamorous entries are where errors hide.

A reference with no identifier still gets Pass 2. "No DOI" is not a reason to
skip it; it is a reason to work harder on it.

## Budget and sequencing — read before the first tool call

A long reference list will exhaust a turn if you let it. Plan for that at the
start instead of discovering it two thirds of the way down.

**Count the references first and say the number out loud.** Then:

- **Up to 30 references** — run straight through, Pass 0 to Pass 5, one turn.
- **30 to 45** — expect two turns.
- **Over 45** — expect three. A 46-reference systematic review took three in
  testing, because carrying DOIs forward made roughly twice as many claims
  checkable as before.

Above 30, announce the plan *before the first tool call*, with the number of
turns you expect, so nobody reads a clean stop as a failure:

- **Phase A** — Passes 0, 1, 2, 3 across every reference.
- **Phase B** — Pass 4 escalation, then Pass 5 claim fidelity.

**One call per reference is the baseline.** `verify_reference` returns
registration status, the full author list, volume, issue, pages, both dates
and any retraction relation in a single call. Do not also call `get_paper` for
the same metadata — that doubles the cost of the audit and buys nothing.
`get_paper` is for **abstracts**, in Pass 5, and nothing else.

**Protect Pass 5.** Claim fidelity is the highest-value pass in this skill and
it runs last, so it is the one that gets starved. Reserve room for it. If you
must choose, a complete Pass 5 on the studies a review actually relies on
beats a fourth escalation attempt on an uncited background reference.

**Stop at a clean boundary, never mid-reference.** If you are running low,
finish the reference you are on, emit the **complete** summary table for
everything checked so far, give the counts with an accurate `N unchecked`,
and list by name exactly which references remain and which passes they still
need. Then offer to continue.

## The passes

Cheap text checks first. They need no tools, catch real problems, and let the
reader see progress before any waiting.

### Pass 0 — Provenance scan (no tools)

Scan every URL and note for chat-tool fingerprints:

- `utm_source=chatgpt.com`, `utm_source=claude_desktop`, `utm_source=perplexity`
  and similar tracking parameters
- links to `chat.openai.com`, `poe.com`, or any chat transcript
- "Retrieved from [chat tool]", or an access date with no URL

**Read the link target, not just the visible text.** A reference can print a
clean DOI while the hyperlink underneath carries the tracking parameter. In
testing that is exactly where the only fingerprint in a 46-reference list was
hiding, invisible on the page and live in the submitted file.

### Where a Pass 0 hit goes

**A fingerprint is a finding about the manuscript, not a defect in the
reference.** It gets its own short section immediately after the opening
statement, **before the summary table**.

**Never file it under housekeeping.** In testing it was buried at 90% depth
beside "DOIs omitted that Crossref holds", which is a formatting nit. A chat
tracking parameter inside a DOI link is the most direct evidence this audit
can produce about how a reference list was assembled, and it is the first
thing a supervisor or PI wants to see.

Report it in three parts, and keep all three:

1. **What was found, and where.** Quote the parameter and name the reference.
2. **What it does not mean.** A real paper reached through a chat tool carries
   the same tag. If the record matched, say so: the reference itself is sound.
   Never present a fingerprint as evidence of fabrication or of AI authorship.
3. **What to do.** Strip the parameter before submission — a published paper
   carrying `utm_source=chatgpt.com` in a reference is a needless
   embarrassment.

**Do not change the reference's own verdict because of a fingerprint.** If the
record matched, it stays ✅. The finding lives at the manuscript level.

**Let it steer Pass 5.** A fingerprint shows part of the list was assembled in
a chat window, and that is where to look hardest. Name those references and
check their claims first.

Add the count to the counts line: `N with chat-tool fingerprints`.

If there are none, say so in one line and move on.

### Pass 1 — Marker and entry integrity (no tools)

Strictly the correspondence between text and list:

- Every in-text marker has a matching list entry
- Every list entry is cited at least once in the text
- Numbering is continuous, with no duplicates and no gaps
- References are numbered in order of first appearance, if the style is numeric
- No two entries describe the same work

An introduction that was rewritten leaves exactly this trace: uncited entries
and a first citation that is not `[1]`.

Check the appendices too, and say where a reference appears. An entry cited
only in a data-extraction table and never in the narrative is a real finding
in a systematic review, and a different finding from one cited nowhere at all.

**A list entry cited nowhere in the manuscript is 🔴, whatever the record
says.** You have read the whole text and it is not there: that is shown, not
suspected. A perfectly registered reference the paper never cites still has to
be cited or cut, so it must not carry a ✅ reading "nothing to do here". Write
the metadata cell as "record matches; **not cited in text**".

**An entry cited only in an appendix is 🟡**, not 🔴. It is cited, so nothing
is demonstrably wrong; whether a study belongs in the narrative is the
author's call. Write "appendix only".

### Pass 2 — Registration and record retrieval

**Call `verify_reference` with the whole reference string, exactly as the
author wrote it.** Authors, year, journal, volume, pages and title together.
Do this for every reference, whether or not it carries a DOI.

The tool routes itself:

- **Reference carries a DOI** → registry lookup. You get `registered: true`
  or `false`, plus the full record.
- **No DOI** → bibliographic match against the whole string, returning
  candidates with a `match_score`.

This is a Crossref lookup. Crossref is the agency that issues most scholarly
DOIs, so it answers what an index cannot: whether a DOI was ever **registered**
at all, which is a stronger negative than "not indexed".

`registered: false` means "not registered with Crossref". Report it in those
words. DataCite and a few other agencies issue DOIs Crossref never sees, and a
DOI assigned at acceptance can be deposited late.

**On candidates from a bibliographic match:** `match_score` is a sort order,
not a verdict. Confirm a candidate the same way as any other record — does the
title, journal, volume and page range agree with what the author wrote? In
testing, every true match agreed on all four; every false candidate disagreed
on journal or pages and scored lower. **Field agreement is the test. Never
accept on score alone.**

`verify_reference` is available on both the **free** connector
(`FastTrack_Literature_Open`) and the member one. Say which you used.

If it is not in the tool list, say "not available", tell the reader they can
enable it from Settings → Connectors → Refresh tools, and fall back to
`get_paper` for DOI-bearing references — noting that authors beyond the third,
and all pagination, then cannot be checked.

**Write down the DOI the tool returns, and carry it forward.** Most references
do not print their own DOI — in testing, 26 of 46 omitted one that Crossref
holds. `verify_reference` hands you that DOI in the record (or in the
confirmed candidate). Keep it against the reference number. Pass 5 needs it,
and a reference whose DOI you have already resolved must never be treated as
unidentifiable later in the audit.

This matters more than it sounds. In testing, Pass 5 skipped a reference and
went hunting in another connector for its abstract, when `get_paper` on the
DOI that Pass 2 had resolved two minutes earlier returned a full abstract
immediately. Carrying the DOI forward roughly doubled how many claims could
be checked.

- Record or confirmed candidate → Pass 3
- Nothing, or only candidates that disagree on the fields → Pass 4

### Pass 3 — Metadata match

Compare the record against the reference exactly as written. Check each field
separately and flag each separately:

- **Authors** — `verify_reference` returns the **complete** list, so a wrong
  seventh author is now catchable, not just a wrong first. Check the count
  first, then the spellings, then the order. A missing middle author and a
  misspelled surname are both findings.
- **Surname order** — for names where the family name may not sit where the
  reference puts it, say so rather than guessing. A Crossref author of
  "Le Quang Dung" cited as "Dung, L. Q." is worth a flag asking the author to
  confirm the byline.
- **Year** — compare the reference against **both** `issue_year` and
  `first_appeared_year`. If it matches either, it is correct: that is the
  **online-first pattern**, where a paper appears online in one year and is
  assigned to an issue in the next. `online_first: true` confirms it as fact
  rather than inference. Say "online-first versus issue date, not an error"
  and move on. Flag only a year that matches neither.
- **Volume, issue and pages** — now checkable. A reference citing "1–22"
  against a record carrying "1231–1252" is an **ahead-of-print citation that
  needs its final pagination**, and this is one of the most common real
  findings in a recent bibliography. Article numbers (e.g. `e0126843`,
  `105224`, `em0251`) are pagination too; a reference giving one is correct,
  not missing a page range.
- **Journal / venue name**
- **Title** — compare on content words. Abbreviated or subtitle-trimmed titles
  are normal and are not a flag.
- **Document type** — `registered_type`. This catches a conference abstract
  cited as a cohort study, an editorial cited as a trial, a preprint cited as
  published. Read it every time. If a review states inclusion criteria, check
  the type of every included study against them **and report that you did**,
  even when everything passes.
- **Retraction** — `retraction_flagged`. Report it if present. Its absence is
  not clearance; see Limits.

**Whether the reference prints its own DOI is housekeeping, not a finding.**
Most styles do not require one. Collect the numbers into a single line at the
end — "references omitting a DOI that Crossref holds: 2, 3, 7 …" — and keep it
out of the table and out of the running lines entirely.

**Never use the word "cited" for this.** In testing it produced a table whose
Identifier column said "DOI registered (not cited)", meaning the author didn't
print the DOI, in the same row whose Metadata column said "cited nowhere",
meaning the reference appears nowhere in the paper. One word, two unrelated
meanings, one row. "Cited" always refers to the manuscript citing the work,
and nothing else.

### Pass 4 — Escalation ladder

Only for references Pass 2 could not resolve. Run these **in order** and
record which were attempted. A reference is only **NO RECORD** after every
available step has failed.

**Step 1 — Exact title.** `search_papers` with the title as written. Catches a
reference whose title is right and whose author, journal or year is wrong. If
a record comes back with a *different* DOI from the one stated, that is 🔴
(wrong identifier — the stated DOI points elsewhere, and you can show both),
not a NO RECORD.

**Step 2 — First author surname plus three to five distinctive topic words.**
`search_papers` with e.g. `Peng tuberculosis dementia Taiwan cohort`.

This is the step that catches a reference whose **title is wrong**, where a
title search cannot work. It succeeds because the underlying engine is
lexical: it is strong on proper nouns and author names and weak on paraphrase.
A fabricated title defeats step 1; a real author's surname still finds the
paper. **Do not skip this step** — in testing it was the only search route
that recovered a real paper cited under an invented title.

Drop generic scaffolding words ("association between", "a nationwide
population-based study") and keep the distinctive ones: the exposure, the
outcome, the country, the design.

**Step 3 — Vary the handle.** Try the journal name plus year plus first
author; or a distinctive phrase from the title; or the surname of a different
listed author.

Steps 1–3 need nothing but the FastTrack connector and work in every
discipline.

**Step 4 — Other connectors, only if present in this session.** Announce which
are available before relying on them, because the reader may not have them:

- **PubMed** — `lookup_article_by_citation` (journal, year, volume, first
  page, author) is purpose-built for this. `convert_article_ids` cross-checks
  a DOI against a PMID. Biomedical and life sciences only.
- **bioRxiv / medRxiv** — where a reference looks like a preprint, or a
  preprint year is attached to a published paper.
- **Consensus** — semantic search on the title, for works indexed there but
  not in OpenAlex.

If a connector is absent, say it was **not attempted**. Never imply it failed.

**Grey literature and web-only sources.** A government report, agency toolkit
or standard often has no scholarly record at all. Verdict is ❓ NO RECORD with
the reason given. If you confirm it by other means, say explicitly that the
confirmation came from outside the connector, and do not upgrade it to
RESOLVED on that basis.

### Pass 5 — Claim fidelity

**The highest-value pass in this skill. Budget for it before you start.**

For each claim in the text attached to a **resolved** reference, call
`get_paper` with the DOI you recorded in Pass 2 and compare the claim against
the record's `abstract_snippet`.

**Use the DOI from Pass 2.** If the reference didn't print one,
`verify_reference` already resolved it. Do not skip a reference for want of an
identifier you are holding, and do not reach for another connector before
trying `get_paper` on that DOI.

Six states, and you must say which:

- **supported** — the abstract states it
- **partially supported** — part of what the manuscript attributes to this
  source holds and part does not. The findings check out but the source is
  mis-sequenced ("expanded on" a paper published a year later), or described
  as recent when the record says 2002, or credited with an extra outcome the
  abstract does not carry. Say which part failed. One state, not two: never
  write "supported; contradicted".
- 🔴 **contradicted** — the abstract states something different. Quote both.
  This is the highest-value and most reliable finding the audit produces, and
  it turns the whole row 🔴 however cleanly the DOI resolved.
- **not addressed** — the abstract neither confirms nor denies. **This is the
  most common result and it is not a failure.** It means the claim needs the
  full text.
- **needs full text** — `get_paper` returned no abstract, so this can never be
  settled here. Common with Elsevier titles, which withhold abstracts from the
  index. Permanent: tell the reader to open the PDF.
- **not checked** — an abstract was available and you did not look. An honest
  gap, recoverable by running again. Never dress it up as anything else.

**Do not decide that a reference "has no claim to check".** A theory citation
can misrepresent the theory, and a methods citation can attribute something
the method never said. Judging which references deserve checking is a call you
will get wrong, and it quietly grants permission to skip. Every resolved
reference gets one of the six states above.

**Order of work, when you cannot do all of them:**

1. **Numeric claims** — effect sizes, confidence intervals, sample sizes,
   percentages, p-values. These are checkable and they are where errors bite.
2. **Study characteristics in a review** — country, design, sample, and
   whether a study had a comparison group. A single-group pre/post study
   described as "controlled" is a serious finding, and the abstract usually
   settles it.
3. **Framing references** — the handful of sources the whole argument rests
   on, typically those cited most often.
4. Everything else.

Where a manuscript tabulates data from several sources, check that each row's
numbers belong to that row's source — transposed rows are common and serious.
Copy-pasted rows, where two different studies carry identical descriptions,
are the same class of error.

**Say how much of Pass 5 you ran**, splitting the two reasons apart:

```
Claims: N checked · N need full text (no abstract) · N not checked
```

Name the "not checked" ones. A partial claim check reported as complete is the
one failure mode that would make this skill worse than useless, and lumping
"no abstract exists" together with "I ran out of room" hides which of the two
a human can do anything about.

State the ceiling plainly: this compares claims to abstracts, not to full
text. A figure in Table 3 cannot be checked here. Meta-analyses of citation
accuracy put the share of citations that do not support the claim attached to
them at roughly one in six to one in four, with no improvement over recent
decades (Baethge & Jergas 2025, *Research Integrity and Peer Review*; Smith &
Cumberledge 2020, *Proc. R. Soc. A*). So "not addressed" is a yellow flag
meaning *open the paper*, not a clean bill of health.

## Output

Work through references **one at a time**, printing each result as you go. Do
not go quiet and emit everything at the end — the reader needs to see the
work, and on a screen share the progression is the demonstration.

**Format each running result as its own markdown list item**, one per line,
starting with `- `. Never place two references on the same line, and never let
one reference's trailing comment run into the next reference's number. Under
output pressure this is the first thing to break, and a wall of run-together
entries is unreadable exactly when the list is long enough to matter.

```
- **3. Alasal (2026)** ✅ Author, title, journal, article number all match.
- **4. Al Hosni (2025)** ✅ DOI registered; 16(3), 244–258 all match.
- **7. Anwer (2026)** 🟡 A near-identical paper exists — see detail below.
- **22. Jiang et al. (2026)** 🔴 Location and pattern name disagree with the
  abstract — see detail below.
```

**Every reference gets a running line, including flagged ones.** A flagged
reference reads "🔴 or 🟡 <one clause> — see detail below" and the full account
goes in its detail block. In testing, nine references silently lost their running
line because the model deferred them to the detail blocks, and the six that
were flagged vanished from the sequence at exactly the point the reader was
most interested. Numbers must run unbroken from 1 to N.

Reserve detail blocks for flags. Keep the running line to one line.

Then **one** summary table covering every reference:

| # | Reference (short) | Identifier | Metadata | Claim | Verdict |
|---|---|---|---|---|---|

Column rules, so the cells stay readable at forty rows:

- **Identifier** — `registered`, `no record`, `book`, `grey literature`.
  Nothing else. Whether the reference printed its own DOI does **not** go here.
- **Metadata** — `match`, or the single field that disagrees. Add
  `not cited in text` or `appendix only` where Pass 1 found it.
- **Claim** — exactly one of the six Pass 5 states, in words only. **No
  emoji here.** A cell carrying its own colour beside a different verdict
  makes the table look like it is arguing with itself. Bold
  `**contradicted**` instead, and let the row's verdict turn 🔴 as the rule
  above requires.
- **Verdict** — 🔴 🟡 ✅ ❓ alone, and it is the worst finding on the row.

**Emit the full table only when it is complete.** A table half-filled with
"pending" and "not yet run" costs a page of output and tells the reader
nothing they can act on. While the audit is still running, see *Resuming an
audit* below.

Then a detail block for every 🔴, every 🟡 and every ❓, each showing:

- the reference exactly as the author wrote it
- the record exactly as the tool returned it
- which routes were attempted, in order
- what a human should do next

Close every run with the counts, including the honest one:

```
N references · N verified · N discrepancies · N to check · N no record · N unchecked
Claims: N checked (N supported · N contradicted · N not addressed) · N need full text · N not checkable
Provenance: N with chat-tool fingerprints
```

Print the provenance line even when it is zero. A reader checking whether a
list was assembled in a chat window needs to see that the question was asked
and answered, not infer it from silence.

Lead the report with the discrepancy count, not the verified count. It is the
number the author has to act on, and the one a supervisor or PI reads first.

**Check the arithmetic before emitting.** The verdict buckets must sum to the
reference total, and the claim states must sum to it too. In testing a counts
line went out wrong and had to be corrected a turn later, which costs more
trust than the error itself.

**Do not emit the final report until `not checked` is zero.** This is the
gate, and it is arithmetic rather than judgement. If any claim is still
unchecked, the turn is an intermediate one however finished the work feels —
emit the light status described below and keep going. In testing a full
report went out one turn early, complete with table, detail blocks and
closing counts, and the next turn had to reissue six rows and supersede it.

`N unchecked` must be zero for a completed audit. If it is not, name which
ones and why.

### Resuming an audit

**An intermediate turn stays light.** Emit only:

- the running lines for the references handled in this turn
- a two-line status: which passes are done, and what remains
- the counts

**No summary table, no Limits block, no Outside this audit, no opening
statement.** Those belong to the finished report and cost roughly two
thousand words each time they are repeated — output budget that should have
gone on checking more claims. In testing, a 46-reference audit printed all of
them three times over.

**The final turn carries the whole report, in this order**: the opening
statement, any Pass 0 provenance finding, the complete table for all
references, every detail block, the counts, the Limits block and Outside this
audit.

- Keep the same structure throughout. The reader should end with one report,
  not several stitched together.
- Do not reprint running lines for references already covered in an earlier
  turn.

## Limits — print these at the end of every audit

- Compares claims against **abstracts, not full text**
- Some publishers, Elsevier especially, withhold abstracts from the index. For
  those references the claim check is **impossible here, not merely skipped**,
  and the reader has to open the PDF
- **Retraction check is partial at best**: `verify_reference` reports a
  retraction only when the publisher deposited the relation on the article
  record, which many do not. Even the most famously retracted paper in
  medicine carries nothing on its own record. "No retraction flagged" is not
  "not retracted"
- Crossref covers journal articles well and books, theses and reports
  poorly; a monograph returning no candidate is expected
- "No record" means not found by the routes attempted, not that the work does
  not exist
- Books, theses, reports, standards and older papers often have no DOI and may
  be unrecoverable this way — their absence is expected, not suspicious
- Where Pass 5 was partial, say what fraction was checked

## What this skill does not do

Open every finished report with a statement of what was and was not
established. Claim the verification you actually did — understating it is as
inaccurate as overstating it, and it teaches the reader to ignore the result.
This wording, or your own words carrying the same three parts:

> Each reference here was checked against its live registry record,
> confirming authors, title, journal, volume, pages and dates. Where an
> abstract was available, the claims the manuscript makes from that source
> were checked against it. What an abstract cannot settle is marked as needing
> the full text, and nothing here establishes that a reference is fabricated.

The three parts, none of which may be dropped:

1. **The bibliographic record was verified.** Not "raises flags". For a
   reference that resolved and matched, the authors, journal, volume, pages
   and dates *are* confirmed against the registry. Say so.
2. **Checked claims were genuinely checked.** A claim the abstract states is
   supported, and that is the verification this skill exists to perform. It
   is bounded by the abstract, not by nothing.
3. **Two things remain open.** A claim resting on the full text was not
   settled here, and no result ever establishes that a reference is
   fabricated.

What this skill will not do is certify a list as sound, or call a reference
fake.
