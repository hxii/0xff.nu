---
title: mkcv
type: project
modified_timestamp: 2025-07-27T12:20:37+03:00
created_timestamp: 2025-07-27T11:45:05+03:00
date: 2025-07-27
---
## What is this?
`mkcv` is a small and quick project designed to generate a resume from a YAML definition.

## Why?
Seeing as quite a lot of people are being laid off recently, and in an effort to keep my own resume up to date, I wanted to try and minimize the effort it takes to keep multiple outputs up to date.

The idea is to generate an HTML file that can be used for a webpage, and a PDF that can be either downloaded or sent out.

!!! important "Important"
    The PDF part is not working well at the moment, as I'm still figuring out how to get `weasyprint` to behave.

## Installation
### Local
`mkcv` can be installed as a tool locally with `uv` by running `uv tool install git+https://git.sr.ht/~hxii/mkcv`.

### GitHub Workflow
You can use `mkcv` to automatically keep your GitHub Pages resume up to date with GitHub Workflows.

Here's an example workflow:
```YAML
name: Generate and Deploy CV

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout data and template from GitHub
        uses: actions/checkout@v4
      - name: Install the latest version of uv
        uses: astral-sh/setup-uv@v6
        with:
          version: "latest"
      - name: Install mkcv dependencies with uv tool install
        run: |
          uv tool install git+https://git.sr.ht/~hxii/mkcv
      - name: Generate CV HTML
        run: uvx mkcv -vvv -o ./_site
      - name: Rename index
        run: mv ./_site/cv.html ./_site/index.html
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Usage
All paths are relative to where the command is being run. `mkcv` will by default look for `./data/cv.yaml` and `./data/template/cv.jinja` files for your resume and template respectively.

These can be changed with the `-f ~/my_cv.yaml` and `-t ~/my_cv_template/` flags.

The output by default will go to `./output` which can also be changed with the `-o ~/my_cv_html/` flag.
### CV Example
Your resume should be defined as a YAML file, which to me is quite humanly readable:
```YAML
personal_information: # Personal info
  full_name: John Doe
  email: john@doe.net
  phone: "555-1234"
  title: CEO
  website: https://sample.com
companies: # A list of companies
  - name: MegaCorp
    url: https://megacorp.com
  - name: SmallCorp
experience: # A list of positions
  - title: CEO
    company: MegaCorp
    start_date: "2020-01-01"
    description: |
      Just the CEO. I compulsively, extensively observe things.
    icon: pikachu
  - title: Not CEO
    company: SmallCorp
    start_date: "1990-01-01"
    end_date: "2020-01-01"
    description: "I wasn't the CEO, if that's what you're asking!"
skills: # A list of skills that can be tied to a company
  - title: Management
    company: megacorp
  - title: C++
  - title: Coffee making
links: # A list of links, e.g. github, your website
  - url: https://sample.com
    title: Personal Website
    class: link--highlight
  - url: https://google.com
    title: My least favorite search engine
    style: |
      font-weight: bold
  - title: Where I look for praises
    url: https://www.linkedin.com/
    icon: linkedin
projects: # A list of projects that can be tied to company
  - title: Boku
    url: https://sample.com
    description: I designed my website!
    start_date: "2024-01-01"
    icon: briefcase
showcase: # Basically the same as projects, but anything you want to showcase
  - title: Sample Project
    url: https://example.com
    icon: submarine
extra: # Any extra sections
  interests:
    title: Extra Section
    content: Extra section you can use in your template
```