# REALM

> A community platform where AI makes communities smarter and creators can turn communities into businesses.

REALM is an actively developed web application exploring how community platforms can combine social spaces, user-generated content, discovery, and context-aware AI.

This repository contains the current development version of REALM.

## 🚧 Project Status

**Active Development**

REALM is currently in the early development stage. The current version focuses on establishing the core frontend architecture, community structure, discovery system, and AI context architecture.

The AI interface currently uses a local demonstration response system while the real AI backend is being developed.

## ✨ Current Features

### Worlds

Communities are organized into different Worlds based on shared interests and activities.

Current Worlds include:

- Technology
- Creative
- Build
- Gaming
- Learning

Each World has its own:

- Description
- Category
- Member count
- Creation count
- Public/private visibility
- Dynamic World page
- World-specific AI context

### Creations

Users can create and explore content inside Worlds.

Creations currently support:

- Titles
- Excerpts
- Full content
- Creator information
- Likes
- Comments
- Featured status
- Public/private visibility
- Dynamic Creation pages
- Creation-specific AI context

### Discovery

REALM includes a discovery system that ranks public Creations using deterministic signals such as:

- Engagement
- Recency
- Featured status

Private content is excluded from discovery.

### Context-Aware AI

REALM has an AI architecture designed around different contexts:

- Global AI
- World AI
- Creation AI
- Discovery AI

The AI context system determines what information should be available to the assistant depending on where the user is interacting with REALM.

### AI Governance

The project includes an initial AI governance layer designed to reduce hallucination and prevent the AI from claiming information that is not available in its supplied context.

The current rules include:

- Do not invent platform information.
- Do not claim unavailable Worlds, Creations, members, statistics, or features exist.
- Treat private content as inaccessible.
- Prioritize the active context.
- Clearly identify unavailable information.
- Do not claim actions were performed when they were not.
- Distinguish REALM platform information from general knowledge.

## 🧠 AI Architecture

The current architecture separates context, platform knowledge, governance, and the AI interface.

```text
User
 ↓
AI Interface
 ↓
AI Context
 ↓
REALM Prompt
 ├── Platform Knowledge
 ├── Governance Rules
 ├── World Context
 ├── Creation Context
 └── Discovery Context
 ↓
AI Provider
 ↓
Response