---
name: sync-fusion-tasks
description: Copy open Fusion Markets web tasks (children of fmgp FM-1401) into the NetDania WT active sprint via Claude in Chrome, including description, attachment links and comments. Use when Cosmin says 'sync Fusion tasks' or similar.
---

# Sync Fusion tasks → NetDania WT sprint

One-way, on-demand copy from the Fusion Jira (fmgp.atlassian.net) to the NetDania Jira (netdania-team.atlassian.net). There are no API tokens and no admin rights: everything runs through Claude in Chrome using Cosmin's logged-in browser sessions, with same-origin `fetch` calls to the Jira REST API inside each site's own tab. Data moves between the sites only through Claude: read it in the Fusion tab, then write it in the WT tab. Never try to pass data directly between tabs or windows (window.open, postMessage and similar). Files are therefore **linked, not copied**.

## Fixed values

- Fusion epic: `FM-1401` (https://fmgp.atlassian.net/browse/FM-1401)
- Cosmin Borsan accountId: `6347c103188e713215503432`. Dan Florin Boicea accountId: `712020:b4a91c0e-71c8-478c-84ad-838616191086`. These are the same on both sites.
- WT board id: `8`. Parent epic: `WT-240`.
- Sprint field: `customfield_10020` (look up the active sprint id on each run).
- Team field: `customfield_10001`. The "Web Department" team id is `f6bbd77a-e23a-47db-97af-b02f57996dd6`.
- Headers for all WT write calls: `Content-Type: application/json`, `Accept: application/json`, `X-Atlassian-Token: no-check`.
- Comment property key used for de-duplication: `fusion-sync`, with value `{"fusionKey":"FM-xxxx","fusionCommentId":"12345"}`.

## Content rules

**Cleaning Fusion content (ADF).** Apply these rules to descriptions and comments alike:

- `mention` becomes plain text `@Display Name`, because Fusion users don't exist in NetDania.
- `mediaSingle`, `mediaGroup`, `media` and `mediaInline` become a paragraph or text node `📎 <filename>`, linked to `https://fmgp.atlassian.net/secure/attachment/<attachmentId>/<filename>`. To match a media node to an attachment, compare the node's `attrs.alt` with the attachment's `filename`. If nothing matches, link to the Fusion ticket instead.
- `inlineCard`, `blockCard`, links, emoji, lists, code and tables stay as they are.
- If WT rejects the ADF (a 400 error mentioning the body or description), fall back to plain text paragraphs for that item and note it in the report.

Helper (run in the Fusion tab; `att` is the issue's `fields.attachment`, `KEY` is the Fusion key):

```js
const FUSION = "https://fmgp.atlassian.net";
const attUrl = (a) => `${FUSION}/secure/attachment/${a.id}/${encodeURIComponent(a.filename)}`;
const mediaLink = (m, att, KEY) => {
    const n = m.attrs?.alt || "";
    const a = att.find((x) => x.filename === n);
    return {
        type: "text",
        text: "📎 " + (a ? a.filename : n || "attachment"),
        marks: [{ type: "link", attrs: { href: a ? attUrl(a) : `${FUSION}/browse/${KEY}` } }],
    };
};
const clean = (node, att, KEY) => {
    if (!node || typeof node !== "object") return node;
    const t = node.type;
    if (t === "mention") return { type: "text", text: "@" + String(node.attrs?.text || "someone").replace(/^@/, "") };
    if (t === "mediaSingle" || t === "mediaGroup")
        return {
            type: "paragraph",
            content: (node.content || []).flatMap((m, i) =>
                i ? [{ type: "text", text: "  " }, mediaLink(m, att, KEY)] : [mediaLink(m, att, KEY)],
            ),
        };
    if (t === "media" || t === "mediaInline") return mediaLink(node, att, KEY);
    const o = { ...node };
    if (node.content) o.content = node.content.map((c) => clean(c, att, KEY)).filter(Boolean);
    return o;
};
```

**The "From Fusion" description section.** The sync owns this section and it is always the **last** part of the WT description:

1. Heading (level 3): `From Fusion · FM-xxxx`, where the key links to the Fusion ticket.
2. Italic paragraph: `Synced automatically from Fusion. Edits inside this section are overwritten on the next sync; write above it.`
3. The cleaned Fusion description, or `No description in Fusion.`
4. Heading (level 4): `Attachments (Fusion)`, followed by a bullet list of `📎 <filename> (<size> KB)` linked to `attUrl`, or `None`.

Writing the section:

- **New ticket**: the description is just this section.
- **Existing ticket without the section**: keep everything that's there, and append the section at the end.
- **Existing ticket with the section**: keep everything before the heading that starts with `From Fusion · FM-xxxx`, and replace from that heading to the end with a freshly built section. Only write if the result actually changed. Never touch content above the heading.

**Comments.** These are add-only and sorted oldest first. Each Fusion comment becomes one WT comment, posted by Cosmin (whoever is logged in):

- First paragraph, in bold: `<Fusion author display name> · <DD Mon YYYY, HH:mm> (Bucharest time) · from FM-xxxx`, with FM-xxxx linked to `https://fmgp.atlassian.net/browse/FM-xxxx?focusedCommentId=<id>`. Format the time with `new Date(created).toLocaleString('en-GB',{timeZone:'Europe/Bucharest',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})`.
- Then the cleaned comment body.
- Create it with `POST /rest/api/3/issue/{key}/comment` and body `{"body":<adf>,"properties":[{"key":"fusion-sync","value":{"fusionKey":"FM-xxxx","fusionCommentId":"<id>"}}]}`.
- To skip comments already copied, read `GET /rest/api/3/issue/{key}/comment?expand=properties&maxResults=100` and collect the `fusionCommentId`s from the `fusion-sync` properties. Never edit or delete comments that were already copied, even if they were edited or deleted in Fusion.

## Steps

1. **Read Fusion.** Use an open fmgp tab, or open a new tab on https://fmgp.atlassian.net/browse/FM-1401. Run:
   `GET /rest/api/3/search/jql?jql=<JQL>&fields=summary,issuetype,status,assignee,description,attachment,comment&maxResults=100`, where JQL is
   `parent = FM-1401 AND status in ("To Do","In Development","Ready For Testing (QA)") AND assignee in (6347c103188e713215503432, "712020:b4a91c0e-71c8-478c-84ad-838616191086")`
   If the call returns 401 or 403, or shows a login screen, stop and ask Cosmin to log into Fusion Jira. If an issue has more comments than were returned (`comment.total > comment.comments.length`), fetch the rest with `/rest/api/3/issue/{key}/comment?startAt=…`.
   In the same tab, build the cleaned payloads for each issue: the description section's content and each comment's ADF, plus its id and header. Return them with a standalone `javascript_tool` call (not `browser_batch`, whose output gets truncated), one or a few issues per call if they're large. Name output keys neutrally (`by`, `when`) rather than `author`, and never return URLs with query strings or cookies; the tool's output filter blocks those.

2. **Classify each candidate in WT.** Use a WT tab (or open https://netdania-team.atlassian.net/jira/software/c/projects/WT/boards/8).
    - **Existing**: `project = WT AND labels = "FM-xxxx"` returns an issue.
    - **Tag**: otherwise, if `project = WT AND summary ~ "\"<title>\""` returns an issue whose summary equals the Fusion title exactly (trimmed, case-insensitive). Escape any quotes in the title.
    - **Create**: everything else.
      For Existing and Tag issues, also read the current description (is the section there, would it change?) and the already-copied Fusion comment ids.

3. **Look up the context.**
    - Active sprint: `GET /rest/agile/1.0/board/8/sprint?state=active`. If there is none, create in the backlog (omit the sprint field).
    - Issue type: Fusion `Bug` → WT `Bug`; anything else → `Task`.
    - Assignee: the same as in Fusion (Cosmin → Cosmin, Dan → Dan).

4. **Preview.** Show Cosmin one table with a row per Fusion issue: Fusion key, title, Fusion status, assignee, WT key (or "new"), and the action (Create / Tag / Existing). Also show the description action (new / append / refresh / no change), the number of attachment links, and the number of new comments to copy. Give the target sprint name. If every row is Existing with no change and 0 new comments, say there is nothing to sync and stop. **Write nothing until he says yes.**

5. **Execute (in the WT tab) once he confirms.**
    - Create: `POST /rest/api/3/issue` with
        ```json
        {"fields":{"project":{"key":"WT"},"issuetype":{"name":"Bug|Task"},"summary":"<same title>","description":{"type":"doc","version":1,"content":[<From Fusion section>]},"assignee":{"id":"<same assignee as Fusion>"},"labels":["FusionMarkets","FM-xxxx"],"parent":{"key":"WT-240"},"customfield_10020":<activeSprintId>,"customfield_10001":"f6bbd77a-e23a-47db-97af-b02f57996dd6"}}
        ```
        Reporter defaults to Cosmin because he is the one creating the issue. If the Team or Sprint field is rejected on create, retry without it, then set it with `PUT /rest/api/3/issue/{key}`.
    - Tag: `PUT /rest/api/3/issue/{key}` with `{"update":{"labels":[{"add":"FM-xxxx"}]}}`. Change nothing else (status, sprint and assignee stay as they are).
    - Description (Tag and Existing): if the section is new or changed, `PUT /rest/api/3/issue/{key}` with `{"fields":{"description":<merged doc>}}`, following the rules for the "From Fusion" description section above.
    - Comments (all issues): post the Fusion comments not yet copied, oldest first.
    - Web link (all issues): add one unless it already points at the URL (check `GET /rest/api/3/issue/{key}/remotelink`):
      `POST /rest/api/3/issue/{key}/remotelink` with `{"object":{"url":"https://fmgp.atlassian.net/browse/FM-xxxx","title":"FM-xxxx: <title>"}}`

6. **Verify, report and clean up.** Re-read the touched WT issues and confirm the type, assignee, labels, parent, sprint, team, that the section is present and last in the description, and the number of copied comments. List what was created, tagged, updated and skipped (with comment counts), with WT keys linked as https://netdania-team.atlassian.net/browse/WT-xxxx. Note any failures or plain-text fallbacks. Close any tab you opened.

## Rules

- One-way only. Never write anything to the Fusion Jira.
- From Fusion, copy only the title, the description (into the managed section), attachment links and comments. Never copy story points, priority or other fields.
- Files are never copied, only linked. If Cosmin needs an actual file on a WT ticket, tell him which files to download from Fusion and drag in himself.
- Always preview and wait for an explicit yes before creating or editing anything.
- If the Fusion workflow or field ids change (a status rename, or an error mentioning a field), stop and tell Cosmin instead of guessing.
