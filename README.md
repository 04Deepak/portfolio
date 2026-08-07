# Portfolio — Deepak Bharate

Personal site: **https://04deepak.github.io/portfolio/**

Hand-written HTML and CSS. No framework, no build step — GitHub Pages serves `main`
directly, so a push is a deploy.

## Structure

```
index.html              Home — hero, selected work, stack, experience, about, contact
work.html               Full index, filterable by Development / DevOps / Security
projects/               One case study per production project
  ats.html              TumharaJob ATS
  learnhub.html         LearnHub multi-tenant LMS
  servingservers.html   ServingServers GPU marketplace
  ngo.html              NGO Platform & Community App
  apijay.html           Self-hosted platform operations
404.html                Custom not-found page
styles/main.css         The entire stylesheet — design tokens at the top
app.js                  Theme, mobile nav, scroll reveal, filters, contact form
scripts/check.py        CI checks (see below)
```

## Editing

Everything is plain HTML. To change wording, open the page and edit it.

Colours, spacing and type scale are CSS custom properties at the top of
`styles/main.css` — change a token there and it applies across every page.

Light and dark themes are both defined; the toggle stores the choice in
`localStorage` and a small inline script applies it before first paint so there's
no flash of the wrong theme.

## Running locally

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123.

## Checks

```bash
python3 scripts/check.py
```

Verifies that internal links resolve, each page has a title, a meta description and
exactly one `<h1>`, every image has alt text, and that no secret-shaped strings have
crept into the source. Runs on every push and pull request via
`.github/workflows/checks.yml`.

The secret scan exists for a reason: an earlier version of this site had a live SMTP
token committed in `index.html`. The contact form now builds a `mailto:` link instead,
so the page holds no credentials at all.
