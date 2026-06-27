# Contributing

## Branch Naming

All development must happen on feature branches. Use the `feature/` prefix:

```
feature/llm-module
feature/ui-shell
feature/content-pipeline
feature/auth-service
feature/scheduling
```

**Do not commit directly to `main`.**

## Workflow

1. Create a feature branch off `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit (see commit style below).
3. Push the branch and open a Pull Request against `main`.
4. Request a review and squash-merge once approved.

## Commit Message Style

Use descriptive, lowercase messages. Start with `add`, `fix`, `refactor`, or `docs`.

```
add auth service
fix token expiry bug
refactor content pipeline
docs update API endpoints
```

Avoid vague messages like `asdf`, `update`, or `fix`.
