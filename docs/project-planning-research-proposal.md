# OpenSpec Project Planning & Research Extension

> Synthesized from analysis of GSD (Get Shit Done) and OpenSpec capabilities

## Executive Summary

This proposal extends OpenSpec with structured project planning, research capabilities, and parallel execution patterns to address context degradation, improve planning quality, and enable more sophisticated AI-assisted development workflows.

## Problem Statement

Current OpenSpec workflow gaps:

1. **No Research Phase**: Proposals jump directly to specs without investigating the domain, existing solutions, or potential pitfalls
2. **No Project-Level Roadmapping**: Changes are isolated; no way to plan multi-phase features or track milestone progress
3. **No State Persistence**: Session context is lost; decisions, blockers, and rationale don't survive restarts
4. **Limited Task Structure**: Checklists lack verification criteria, file targets, and completion definitions
5. **No Parallel Execution Model**: Tasks execute sequentially without wave-based parallelization
6. **No Adversarial Review**: Plans aren't stress-tested against edge cases or challenged systematically

## Proposed Extensions

### 1. Research Phase (Pre-Proposal)

Add a research stage that runs **before** proposal creation for complex changes.

#### Structure

```
openspec/
├── research/                    # NEW: Domain research artifacts
│   ├── SUMMARY.md              # Synthesized findings with roadmap implications
│   └── investigations/
│       ├── stack-analysis.md   # Technology choices evaluation
│       ├── feature-landscape.md # Table stakes vs differentiators
│       ├── architecture.md     # System design considerations
│       └── pitfalls.md         # Common mistakes and mitigations
```

#### Workflow

```
┌─────────────────────┐
│ User describes goal │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│ Research Phase (parallel agents)                │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│ │ Stack     │ │ Features  │ │ Pitfalls  │ ...  │
│ │ Researcher│ │ Researcher│ │ Researcher│      │
│ └───────────┘ └───────────┘ └───────────┘      │
└──────────┬──────────────────────────────────────┘
           │ synthesize
           ▼
┌─────────────────────┐
│ SUMMARY.md with     │
│ roadmap implications│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Standard OpenSpec   │
│ proposal workflow   │
└─────────────────────┘
```

#### Research Agent Types

| Agent | Focus Area | Key Questions |
|-------|------------|---------------|
| **Stack Researcher** | Technology choices | Current best practices? Library ecosystem? Trade-offs? |
| **Feature Researcher** | Capability landscape | Table stakes? Differentiators? What competitors do? |
| **Architecture Researcher** | System design | Component boundaries? Data flow? Integration points? |
| **Pitfall Researcher** | Risk mitigation | Common mistakes? Security concerns? Performance traps? |

#### Research Output Template

```markdown
# Research Summary: [Topic]

## Key Findings
- [Bullet points of critical discoveries]

## Stack Recommendations
- **Recommended**: [Choice] - [Rationale]
- **Alternatives**: [Options with trade-offs]

## Feature Prioritization
### Table Stakes (Must Have)
- [Features that are expected by users]

### Differentiators (Could Win)
- [Features that set the project apart]

## Architecture Considerations
- [Key design decisions and their implications]

## Pitfalls to Avoid
- [Risk] → [Mitigation strategy]

## Implications for Roadmap
- Phase 1 should focus on: [...]
- Consider ordering: [...]
- Requires investigation before: [...]
```

---

### 2. Roadmap & Milestone Tracking

Add project-level planning above individual changes.

#### Structure

```
openspec/
├── planning/                    # NEW: Project planning artifacts
│   ├── PROJECT.md              # Vision, constraints, stakeholders
│   ├── ROADMAP.md              # Phased milestone plan
│   ├── STATE.md                # Current decisions, blockers, context
│   └── milestones/
│       ├── v1-core/
│       │   ├── milestone.md    # Milestone definition
│       │   └── phases/
│       │       ├── phase-1/    # Database & models
│       │       └── phase-2/    # API endpoints
│       └── v2-advanced/
│           └── milestone.md
```

#### PROJECT.md Template

```markdown
# Project: [Name]

## Vision
[1-2 sentence description of what we're building and why]

## Core Value Proposition
[What makes this valuable to users]

## Constraints
- Technical: [stack, compatibility requirements]
- Timeline: [deadlines, dependencies]
- Resources: [team size, expertise gaps]

## Stakeholders
- [Role]: [Concerns and success criteria]

## Out of Scope
- [Explicitly excluded features/concerns]
```

#### ROADMAP.md Template

```markdown
# Roadmap

## Current Milestone: v1-core
- Status: In Progress
- Phase: 2 of 4

## Milestones

### v1-core (Current)
Target: Production-ready core functionality

| Phase | Name | Status | Changes |
|-------|------|--------|---------|
| 1 | Database Setup | Complete | add-user-schema |
| 2 | API Layer | In Progress | add-auth-api, add-user-api |
| 3 | Frontend | Pending | - |
| 4 | Integration | Pending | - |

### v2-advanced
Target: Advanced features and optimizations

| Phase | Name | Status | Changes |
|-------|------|--------|---------|
| 1 | Analytics | Pending | - |
| 2 | Caching | Pending | - |
```

#### STATE.md Template

```markdown
# Project State

Last Updated: [timestamp]

## Current Focus
[What we're working on right now]

## Recent Decisions
- [Date]: [Decision] - [Rationale]

## Open Questions
- [ ] [Question needing resolution]

## Blockers
- [Blocker]: [Impact] - [Owner]

## Session Notes
### [Date] Session
- Completed: [...]
- Next: [...]
- Issues encountered: [...]
```

---

### 3. Enhanced Task Structure

Replace simple checklists with structured, verifiable tasks.

#### Current Format (tasks.md)
```markdown
## 1. Implementation
- [ ] 1.1 Create database schema
- [ ] 1.2 Implement API endpoint
```

#### Proposed Format (tasks.md)

```markdown
# Tasks for: [change-id]

## Wave 1 (Parallel)

### Task 1.1: Create User Schema
- **Type**: auto
- **Files**: `src/db/schema/user.ts`, `src/db/migrations/001_users.sql`
- **Dependencies**: None
- **Action**:
  Create TypeScript schema definition and SQL migration for users table.
  Include fields: id (uuid), email (unique), created_at, updated_at.
- **Verify**: `pnpm db:migrate && pnpm test:schema`
- **Done**: Migration runs successfully, schema types export correctly
- **Status**: pending

### Task 1.2: Create Auth Schema
- **Type**: auto
- **Files**: `src/db/schema/auth.ts`, `src/db/migrations/002_auth.sql`
- **Dependencies**: None
- **Action**:
  Create sessions and tokens tables for authentication.
- **Verify**: `pnpm db:migrate`
- **Done**: Tables created with foreign key to users
- **Status**: pending

## Wave 2 (After Wave 1)

### Task 2.1: Implement Auth Service
- **Type**: auto
- **Files**: `src/services/auth.ts`, `src/services/auth.test.ts`
- **Dependencies**: Task 1.1, Task 1.2
- **Action**:
  Create authentication service with login, logout, session management.
- **Verify**: `pnpm test src/services/auth.test.ts`
- **Done**: All tests pass, service exports AuthService class
- **Status**: pending

## Wave 3 (Checkpoint)

### Task 3.1: Review Authentication Flow
- **Type**: checkpoint:human-verify
- **Files**: `src/services/auth.ts`, `docs/auth-flow.md`
- **Dependencies**: Task 2.1
- **Action**:
  Generate authentication flow diagram and request human review.
- **Verify**: User confirms flow is correct
- **Done**: Approval received
- **Status**: pending
```

#### Task Types

| Type | Behavior |
|------|----------|
| `auto` | Execute autonomously, verify automatically |
| `checkpoint:human-verify` | Pause for human review before proceeding |
| `checkpoint:decision` | Present options, wait for user choice |
| `research` | Investigate and report, don't implement |

---

### 4. Parallel Execution Model

Enable wave-based parallel task execution.

#### Execution Flow

```
Wave 1 (parallel)
├── Task 1.1 ──┐
├── Task 1.2 ──┼── All complete? ──→ Wave 2
└── Task 1.3 ──┘
                    │
Wave 2 (parallel)   │
├── Task 2.1 ──┐    │
└── Task 2.2 ──┼── All complete? ──→ Wave 3
               │
Wave 3 (checkpoint)
└── Task 3.1 (human review) ──→ Continue or Revise
```

#### Subagent Isolation Pattern

Each task executes in a fresh context to prevent quality degradation:

```
Orchestrator (lean context ~15%)
├── Spawns: Executor for Task 1.1 (fresh 100% context)
├── Spawns: Executor for Task 1.2 (fresh 100% context)
└── Spawns: Executor for Task 1.3 (fresh 100% context)
    │
    ▼ (all complete)
    │
├── Spawns: Executor for Task 2.1 (fresh 100% context)
└── Spawns: Executor for Task 2.2 (fresh 100% context)
```

#### Orchestrator Responsibilities

1. Load roadmap, state, and current phase
2. Parse tasks.md to identify waves and dependencies
3. Spawn parallel executors for each wave
4. Collect results and update STATE.md
5. Handle failures (retry, escalate, or skip)
6. Commit atomically per task

---

### 5. Adversarial Planning (Red Team Review)

Add systematic challenge phase to stress-test proposals before implementation.

#### Adversarial Agents

| Agent | Challenge Focus |
|-------|----------------|
| **Security Adversary** | Attack vectors, auth bypasses, injection points |
| **Scale Adversary** | Performance bottlenecks, N+1 queries, memory leaks |
| **Edge Case Adversary** | Unusual inputs, race conditions, failure modes |
| **UX Adversary** | Confusing flows, accessibility issues, error states |
| **Maintenance Adversary** | Technical debt, testing gaps, documentation holes |

#### Workflow Integration

```
┌─────────────────────┐
│ Proposal Complete   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────┐
│ Adversarial Review (parallel)                   │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐      │
│ │ Security  │ │ Scale     │ │ Edge Case │ ...  │
│ │ Adversary │ │ Adversary │ │ Adversary │      │
│ └───────────┘ └───────────┘ └───────────┘      │
└──────────┬──────────────────────────────────────┘
           │ findings
           ▼
┌─────────────────────┐
│ REVIEW.md with      │──→ Revise proposal?
│ issues & mitigations│
└──────────┬──────────┘
           │ addressed
           ▼
┌─────────────────────┐
│ Implementation      │
└─────────────────────┘
```

#### REVIEW.md Template

```markdown
# Adversarial Review: [change-id]

## Security Review
### Issues Found
- **HIGH**: [Issue description]
  - Attack vector: [How it could be exploited]
  - Mitigation: [Required fix]
  - Status: [ ] Addressed

### Recommendations
- [Proactive security improvements]

## Scale Review
### Issues Found
- **MEDIUM**: [Performance concern]
  - Impact: [When it becomes a problem]
  - Mitigation: [Optimization approach]
  - Status: [ ] Addressed

## Edge Case Review
### Issues Found
- **LOW**: [Edge case scenario]
  - Trigger: [How to reproduce]
  - Handling: [Expected behavior]
  - Status: [ ] Addressed

## Summary
- Critical issues: [count]
- Must address before implementation: [list]
- Can defer: [list]
- Approved for implementation: [ ] Yes / [ ] No
```

---

### 6. New CLI Commands

```bash
# Research commands
openspec research [topic]              # Run parallel research agents
openspec research --synthesize         # Generate SUMMARY.md from investigations

# Planning commands
openspec plan init                     # Initialize planning/ directory
openspec plan milestone [name]         # Create new milestone
openspec plan phase [milestone] [name] # Add phase to milestone
openspec plan status                   # Show roadmap progress

# Execution commands
openspec execute [change-id]           # Execute tasks with wave parallelism
openspec execute --wave [n]            # Execute specific wave only
openspec execute --dry-run             # Show execution plan without running

# Review commands
openspec review [change-id]            # Run adversarial review
openspec review --agents [list]        # Run specific adversaries
openspec review --summary              # Show review status

# State commands
openspec state                         # Show current STATE.md
openspec state update                  # Update state interactively
openspec state decision [text]         # Record a decision
openspec state blocker [text]          # Record a blocker
```

---

## Implementation Phases

### Phase 1: Foundation
- Add `planning/` directory structure to `openspec init`
- Create PROJECT.md, STATE.md templates
- Add `openspec state` commands for state management
- Extend tasks.md parser to support structured format

### Phase 2: Research
- Implement research agent prompts
- Add `openspec research` command
- Create SUMMARY.md generation
- Integrate research into proposal workflow

### Phase 3: Roadmapping
- Add ROADMAP.md support
- Implement milestone and phase tracking
- Link changes to phases
- Add `openspec plan` commands

### Phase 4: Parallel Execution
- Implement wave-based task parsing
- Add subagent orchestration
- Create execution verification
- Add `openspec execute` command

### Phase 5: Adversarial Review
- Implement adversarial agent prompts
- Add REVIEW.md generation
- Create review gating workflow
- Add `openspec review` command

---

## Comparison: OpenSpec vs OpenSpec+Planning

| Capability | Current OpenSpec | With Planning Extension |
|------------|-----------------|------------------------|
| Research | None | Parallel domain investigation |
| Project vision | project.md (optional) | PROJECT.md (structured) |
| Roadmapping | None | Milestones, phases, progress tracking |
| State persistence | None | STATE.md with decisions/blockers |
| Task structure | Checklists | Structured with verify/done criteria |
| Execution | Sequential | Wave-based parallel |
| Review | Manual | Automated adversarial agents |
| Context management | N/A | Subagent isolation |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Complexity overhead | Make all features opt-in; keep simple path available |
| Research adds latency | Allow skipping research for small changes |
| State file conflicts | Use append-only patterns; timestamp entries |
| Subagent coordination | Clear dependency graphs; fail-fast on errors |
| Over-engineering | Default to minimal planning; expand as needed |

---

## Open Questions

1. Should research be mandatory for changes above a certain size?
2. How to handle cross-change dependencies in parallel execution?
3. What's the right granularity for adversarial review (per-change vs per-phase)?
4. Should STATE.md be version-controlled or gitignored?
5. How to integrate with existing CI/CD pipelines?

---

## References

- [GSD (Get Shit Done)](https://github.com/glittercowboy/get-shit-done) - Context engineering and subagent orchestration patterns
- [OpenSpec Current Workflow](./experimental-workflow.md) - Existing artifact-based workflow
- [AGENTS.md Convention](https://agents.md/) - Standard for AI agent instructions
