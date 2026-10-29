# Project Brief

## One-line pitch
A searchable, personalized opportunity hub that helps students find scholarships, internships, hackathons, and competitions before their deadlines pass.

## Problem
Opportunity information is scattered across institutional portals, company career pages, social posts, newsletters, and event websites. Students can miss relevant opportunities because they do not know where to look, cannot easily compare eligibility requirements, or forget application deadlines.

## Proposed solution
Provide a curated, searchable directory of opportunities with structured eligibility criteria, original application/source links, deadlines, saves, deadline reminders, and application tracking.

## Target users
- **Student:** wants relevant opportunities and a simple way to keep track of them.
- **Administrator/curator:** verifies and maintains listing quality.
- **Institutional partner (future):** may curate opportunities for a college, department, placement cell, or student club.

## Value proposition
- One place to search across opportunity types.
- A checklist that turns written criteria into reviewable items.
- A dashboard that brings saved opportunities, deadlines, and application states together.
- Provenance and verification timestamps to help students assess listing reliability.

## Product boundaries
The product is a discovery and tracking tool. It does not award scholarships, make hiring decisions, submit applications on a student's behalf, or officially determine eligibility. For MVP, opportunity records are entered and maintained by authorized curators; automated web scraping and AI-based definitive eligibility judgments are excluded.

## Initial delivery approach
Build a responsive web app with a React client, Express API, Node.js runtime, and MongoDB database. Start with one student role and one admin role. Prioritize correctness, data transparency, and the end-to-end student journey over a large catalogue.
