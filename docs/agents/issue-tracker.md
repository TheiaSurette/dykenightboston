# Issue tracker: GitHub

Issues and specs live in TheiaSurette/dykenightboston on GitHub.
Use the gh CLI from this repo.

## Operations

- Create: gh issue create --title "..." --body-file <file>
- Read: gh issue view <number> --json number,title,body,labels,comments
- List: gh issue list --state open --json number,title,body,labels
- Comment: gh issue comment <number> --body-file <file>
- Label: gh issue edit <number> --add-label "..."
- Remove a label: gh issue edit <number> --remove-label "..."
- Close: gh issue close <number> --comment "..."

Use a body file for multiline content.

When a skill says "publish to the issue tracker", create a GitHub issue.
When it says "fetch the relevant ticket", read the GitHub issue.

## Pull requests as a triage surface

**PRs as a request surface: no.**
