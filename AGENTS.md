<!-- PROJECTOR:START -->
# Projector Instructions

These instructions are for AI assistants working in this project.

Always open `@/.projector/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/.projector/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'projector update' can refresh the instructions.

<!-- PROJECTOR:END -->

## Development Commands

Use the Makefile for common development tasks:

```bash
# Build the project
make build

# Run tests
make test

# Run tests in watch mode
make test-watch

# Run tests with coverage
make test-coverage

# Run linter
make lint

# Clean build artifacts
make clean

# Show all available targets
make help
```

All Makefile commands use pnpm internally.
