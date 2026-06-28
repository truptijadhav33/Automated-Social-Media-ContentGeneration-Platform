# Automated Social Media Content Generation Platform

An end-to-end platform that automatically generates, schedules, and publishes social media content using LLMs and scheduled pipelines. Built to streamline content creation across multiple channels.

## Quick Start

```bash
# Clone the repo
git clone https://github.com/truptijadhav33/Automated-Social-Media-ContentGeneration-Platform.git
cd Automated-Social-Media-ContentGeneration-Platform

# Backend setup
cd backend
npm install        # Node.js services
pip install -r requirements.txt  # Python services

# Frontend setup
cd ../frontend
npm install
npm start
```

## Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React                          |
| Backend  | Node.js, Python FastAPI        |
| Database | MongoDB                        |
| AI       | OpenAI (GPT models)            |

## Folder Structure

```
├── backend/          # Node.js services + Python FastAPI microservices
│   ├── node/         #   Node.js services (auth, scheduling, APIs)
│   └── python/       #   Python services (LLM integration, content gen)
├── frontend/         # React application (UI shell, dashboards)
├── shared/           # Shared constants, types, docs
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

## How to Contribute

We follow a **5-day incremental build plan**. Each day focuses on a specific module (e.g., LLM integration, content pipeline, UI shell). Check the project board for the current sprint.

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch naming, PR workflow, and commit conventions.

## Team

- **Trupti Jadhav**
- **Vrushali Sathe**
