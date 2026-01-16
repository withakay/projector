# OpenSpec Agent Architecture Proposal

> Extending OpenSpec with specialized agents, subagents, and skills for enhanced AI-assisted development

## Overview

This proposal defines an agent architecture for OpenSpec that enables:
- **Specialized agents** for different workflow stages
- **Subagent orchestration** for parallel processing
- **Skills** as reusable, composable capabilities
- **Context isolation** to prevent quality degradation

## Agent Taxonomy

### 1. Orchestrator Agents (Primary)

Top-level agents that coordinate workflows and spawn subagents.

| Agent | Role | Spawns |
|-------|------|--------|
| `openspec-orchestrator` | Main workflow coordinator | All subagent types |
| `research-orchestrator` | Research phase coordinator | Research agents |
| `planning-orchestrator` | Roadmap/phase coordinator | Planning agents |
| `execution-orchestrator` | Task execution coordinator | Executor agents |
| `review-orchestrator` | Adversarial review coordinator | Review agents |

### 2. Research Agents (Subagents)

Specialized agents for domain investigation.

```yaml
research-agents:
  stack-researcher:
    focus: Technology evaluation
    inputs: [domain, constraints, existing-stack]
    outputs: [stack-analysis.md]
    tools: [WebSearch, WebFetch, Read, Grep]

  feature-researcher:
    focus: Capability landscape
    inputs: [domain, competitors, user-needs]
    outputs: [feature-landscape.md]
    tools: [WebSearch, WebFetch, Read]

  architecture-researcher:
    focus: System design patterns
    inputs: [domain, scale-requirements, constraints]
    outputs: [architecture.md]
    tools: [WebSearch, Read, Grep, Glob]

  pitfall-researcher:
    focus: Risk identification
    inputs: [domain, technology-choices]
    outputs: [pitfalls.md]
    tools: [WebSearch, WebFetch, Read]

  research-synthesizer:
    focus: Combine findings
    inputs: [all-research-outputs]
    outputs: [SUMMARY.md]
    tools: [Read, Write]
```

### 3. Planning Agents (Subagents)

Agents for roadmap and phase planning.

```yaml
planning-agents:
  requirements-extractor:
    focus: Derive requirements from research
    inputs: [research-summary, user-goals]
    outputs: [REQUIREMENTS.md]
    tools: [Read, Write]

  roadmapper:
    focus: Phase and milestone planning
    inputs: [requirements, constraints]
    outputs: [ROADMAP.md]
    tools: [Read, Write]

  phase-planner:
    focus: Detailed phase planning
    inputs: [roadmap, phase-number, research]
    outputs: [phase/PLAN.md]
    tools: [Read, Write, Grep, Glob]

  plan-checker:
    focus: Validate and refine plans
    inputs: [plan, requirements, specs]
    outputs: [plan-feedback.md]
    tools: [Read, Grep]
```

### 4. Executor Agents (Subagents)

Agents for task implementation.

```yaml
executor-agents:
  task-executor:
    focus: Implement single task
    inputs: [task-definition, context-files]
    outputs: [code-changes, SUMMARY.md]
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    context: fresh  # Always spawns with clean context

  test-executor:
    focus: Run and verify tests
    inputs: [test-command, expected-outcomes]
    outputs: [test-results.md]
    tools: [Bash, Read]

  commit-executor:
    focus: Create atomic commits
    inputs: [changes, commit-message]
    outputs: [commit-hash]
    tools: [Bash]
```

### 5. Review Agents (Adversaries)

Agents for systematic challenge and review.

```yaml
review-agents:
  security-adversary:
    focus: Attack vector identification
    inputs: [specs, code-changes]
    outputs: [security-review.md]
    tools: [Read, Grep, Glob]
    perspective: "Find ways to exploit this"

  scale-adversary:
    focus: Performance bottlenecks
    inputs: [specs, code-changes, architecture]
    outputs: [scale-review.md]
    tools: [Read, Grep]
    perspective: "What breaks at 10x, 100x, 1000x scale?"

  edge-case-adversary:
    focus: Unusual inputs and states
    inputs: [specs, scenarios]
    outputs: [edge-case-review.md]
    tools: [Read]
    perspective: "What weird inputs cause problems?"

  ux-adversary:
    focus: User experience issues
    inputs: [specs, ui-code]
    outputs: [ux-review.md]
    tools: [Read, Grep]
    perspective: "How will users get confused?"

  maintenance-adversary:
    focus: Long-term code health
    inputs: [code-changes, test-coverage]
    outputs: [maintenance-review.md]
    tools: [Read, Grep, Glob, Bash]
    perspective: "What will be painful to maintain?"

  review-synthesizer:
    focus: Combine review findings
    inputs: [all-review-outputs]
    outputs: [REVIEW.md]
    tools: [Read, Write]
```

---

## Skill System

Skills are reusable capabilities that agents can invoke. They encapsulate common operations with consistent interfaces.

### Skill Categories

#### Research Skills
```yaml
skills:
  web-research:
    description: Search and synthesize web information
    inputs:
      query: string
      depth: quick | standard | comprehensive
    outputs:
      findings: markdown
      sources: url[]

  codebase-analysis:
    description: Analyze existing codebase structure
    inputs:
      path: string
      focus: architecture | patterns | dependencies | all
    outputs:
      analysis: markdown
      key-files: path[]

  competitor-analysis:
    description: Research competitor solutions
    inputs:
      domain: string
      competitors: string[]
    outputs:
      comparison: markdown
      differentiators: string[]
```

#### Planning Skills
```yaml
skills:
  requirement-derivation:
    description: Extract requirements from context
    inputs:
      research: markdown
      user-goals: string[]
    outputs:
      requirements:
        v1: requirement[]
        v2: requirement[]
        out-of-scope: string[]

  task-breakdown:
    description: Break work into atomic tasks
    inputs:
      requirement: requirement
      constraints: string[]
    outputs:
      tasks: task[]
      waves: wave[]
      dependencies: dependency[]

  risk-assessment:
    description: Identify and prioritize risks
    inputs:
      plan: markdown
      context: markdown
    outputs:
      risks: risk[]
      mitigations: mitigation[]
```

#### Implementation Skills
```yaml
skills:
  code-generation:
    description: Generate code from specification
    inputs:
      spec: spec
      target-files: path[]
      conventions: markdown
    outputs:
      code-changes: change[]

  test-generation:
    description: Generate tests from scenarios
    inputs:
      scenarios: scenario[]
      test-framework: string
    outputs:
      test-code: change[]

  migration-generation:
    description: Generate database migrations
    inputs:
      schema-changes: change[]
      db-type: string
    outputs:
      migration-files: change[]
```

#### Review Skills
```yaml
skills:
  security-audit:
    description: Check for security vulnerabilities
    inputs:
      code-paths: path[]
      threat-model: markdown
    outputs:
      vulnerabilities: vulnerability[]
      recommendations: string[]

  performance-analysis:
    description: Identify performance issues
    inputs:
      code-paths: path[]
      scale-requirements: markdown
    outputs:
      bottlenecks: bottleneck[]
      optimizations: string[]

  test-coverage-analysis:
    description: Analyze test coverage gaps
    inputs:
      specs: spec[]
      test-paths: path[]
    outputs:
      coverage: percentage
      gaps: gap[]
```

---

## Agent Context Management

### Context Isolation Strategy

```
┌─────────────────────────────────────────────────────────┐
│ Orchestrator Context (~15% budget)                      │
│ - Roadmap, current phase, wave status                   │
│ - Task dependency graph                                 │
│ - Result summaries from subagents                       │
└─────────────────────────────────────────────────────────┘
           │
           │ spawns with fresh context
           ▼
┌─────────────────────────────────────────────────────────┐
│ Subagent Context (~100% budget each)                    │
│ - Specific task definition                              │
│ - Required files only                                   │
│ - Relevant specs/research                               │
│ - No accumulated history                                │
└─────────────────────────────────────────────────────────┘
```

### Context Loading Strategy

```yaml
context-loading:
  always-load:
    - openspec/planning/STATE.md       # Current project state
    - openspec/planning/PROJECT.md     # Project vision

  load-for-planning:
    - openspec/planning/ROADMAP.md     # Phase structure
    - openspec/planning/REQUIREMENTS.md
    - openspec/research/SUMMARY.md     # If exists

  load-for-execution:
    - Current task definition only
    - Target files specified in task
    - Relevant spec (single capability)

  load-for-review:
    - Changed files only
    - Affected specs
    - Original requirements
```

### Result Handoff Pattern

```
Subagent completes task
        │
        ▼
┌─────────────────────┐
│ Write SUMMARY.md    │  (structured output)
│ - What was done     │
│ - Files changed     │
│ - Verification      │
│ - Issues found      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Orchestrator reads  │  (minimal context transfer)
│ SUMMARY.md only     │
└─────────────────────┘
```

---

## Orchestration Patterns

### Pattern 1: Parallel Research

```python
# Pseudo-code for parallel research orchestration

def research_phase(domain: str, constraints: dict):
    # Spawn all researchers in parallel
    tasks = [
        spawn_agent("stack-researcher", domain=domain),
        spawn_agent("feature-researcher", domain=domain),
        spawn_agent("architecture-researcher", domain=domain),
        spawn_agent("pitfall-researcher", domain=domain),
    ]

    # Wait for all to complete (blocks, no polling)
    results = await_all(tasks)

    # Synthesize results
    summary = spawn_agent("research-synthesizer",
                          inputs=results)

    return summary
```

### Pattern 2: Wave-Based Execution

```python
def execute_phase(phase: Phase):
    waves = parse_waves(phase.tasks)

    for wave in waves:
        # All tasks in wave run in parallel
        parallel_tasks = [
            spawn_agent("task-executor",
                        task=task,
                        context=get_task_context(task))
            for task in wave.tasks
        ]

        results = await_all(parallel_tasks)

        # Check all succeeded
        if any(r.failed for r in results):
            handle_failures(results)
            break

        # Commit atomically per task
        for result in results:
            spawn_agent("commit-executor",
                        changes=result.changes)

        # Update state
        update_state(wave, results)
```

### Pattern 3: Adversarial Review

```python
def adversarial_review(change_id: str, agents: list = None):
    agents = agents or [
        "security-adversary",
        "scale-adversary",
        "edge-case-adversary"
    ]

    # Load change context
    change = load_change(change_id)

    # Run all adversaries in parallel
    reviews = [
        spawn_agent(agent,
                    specs=change.specs,
                    code=change.code)
        for agent in agents
    ]

    results = await_all(reviews)

    # Synthesize into REVIEW.md
    review = spawn_agent("review-synthesizer",
                         findings=results)

    return review
```

---

## Skill Composition

Skills can be composed to create higher-level capabilities.

### Example: Full Feature Implementation

```yaml
workflow: implement-feature
skills:
  1. web-research:
      query: "{feature} implementation best practices"
      depth: quick

  2. codebase-analysis:
      focus: patterns

  3. requirement-derivation:
      inputs: [step-1.findings, step-2.analysis]

  4. task-breakdown:
      inputs: [step-3.requirements]

  5. for-each task in step-4.tasks:
      code-generation:
        spec: task.spec

  6. test-generation:
      scenarios: [all task scenarios]

  7. security-audit:
      code-paths: [all generated files]
```

### Example: Quick Bug Fix

```yaml
workflow: quick-fix
skills:
  1. codebase-analysis:
      focus: patterns
      path: "{affected-area}"

  2. code-generation:
      spec: "{fix-description}"

  3. test-generation:
      scenarios: [regression scenario]
```

---

## Configuration

### Agent Configuration File

```yaml
# openspec/agents.yaml

defaults:
  context-budget: 100000  # tokens
  timeout: 300            # seconds
  retry: 2

orchestrators:
  execution-orchestrator:
    context-budget: 20000  # lean orchestrator

subagents:
  task-executor:
    context-budget: 200000  # full context
    tools:
      - Read
      - Write
      - Edit
      - Bash
      - Grep
      - Glob

  security-adversary:
    context-budget: 100000
    tools:
      - Read
      - Grep
      - Glob
    system-prompt: |
      You are a security researcher. Your job is to find
      vulnerabilities in the proposed changes. Be thorough
      and adversarial. Assume attackers are sophisticated.

skills:
  web-research:
    enabled: true
    cache-duration: 3600  # seconds

  code-generation:
    enabled: true
    require-tests: true
```

### Workflow Configuration

```yaml
# openspec/workflows.yaml

proposal:
  research:
    enabled: true
    depth: standard  # quick | standard | comprehensive
    agents:
      - stack-researcher
      - feature-researcher
      - pitfall-researcher

  adversarial-review:
    enabled: true
    required-for-merge: true
    agents:
      - security-adversary
      - scale-adversary

execution:
  parallel-waves: true
  atomic-commits: true
  verification-required: true

review:
  auto-trigger: on-completion
  block-on-high-severity: true
```

---

## CLI Integration

### New Commands

```bash
# Agent management
openspec agent list                    # List available agents
openspec agent run <agent> [inputs]    # Run specific agent
openspec agent config                  # Edit agent configuration

# Skill management
openspec skill list                    # List available skills
openspec skill run <skill> [inputs]    # Run specific skill
openspec skill compose [workflow]      # Run skill workflow

# Orchestration
openspec orchestrate research [topic]  # Run research orchestration
openspec orchestrate execute [change]  # Run execution orchestration
openspec orchestrate review [change]   # Run review orchestration

# Parallel execution
openspec execute --parallel            # Enable wave parallelism
openspec execute --wave 2              # Run specific wave
openspec execute --dry-run             # Preview execution plan
```

### Slash Command Integration

```markdown
# Claude Code slash commands

/openspec:research [topic]
  - Spawns parallel research agents
  - Generates SUMMARY.md with findings

/openspec:plan [milestone]
  - Extracts requirements
  - Creates phased roadmap
  - Generates PLAN.md files

/openspec:execute [change-id]
  - Runs tasks in waves
  - Atomic commits per task
  - Updates STATE.md

/openspec:review [change-id]
  - Runs adversarial agents
  - Generates REVIEW.md
  - Gates implementation
```

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Context Preservation** | Subagent isolation prevents quality degradation |
| **Parallel Speed** | Wave execution reduces total time |
| **Specialized Focus** | Each agent optimized for its domain |
| **Reusable Skills** | Common operations encapsulated |
| **Systematic Review** | Adversarial agents catch issues early |
| **Clear Handoffs** | Structured summaries enable coordination |
| **Configurable** | Adjust agents/skills per project needs |

---

## Implementation Priority

1. **Phase 1**: Core agent definitions and context isolation
2. **Phase 2**: Research agents and orchestration
3. **Phase 3**: Executor agents with wave parallelism
4. **Phase 4**: Review agents (adversaries)
5. **Phase 5**: Skill system and composition
6. **Phase 6**: CLI commands and slash integration

---

## References

- [GSD Subagent Architecture](https://github.com/glittercowboy/get-shit-done)
- [OpenSpec Project Planning Proposal](./project-planning-research-proposal.md)
- [Claude Code Task Tool Documentation](https://docs.anthropic.com/claude-code)
