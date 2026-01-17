/**
 * Workflow CLI Command
 *
 * Manage and execute multi-agent workflows
 */

import path from 'path';
import { promises as fs } from 'fs';
import { FileSystemUtils } from '../utils/file-system.js';
import { getOpenSpecDirName } from '../core/project-config.js';
import {
  workflowParser,
  workflowOrchestrator,
  Tool,
  WorkflowDefinition,
} from '../core/workflow/index.js';

export class WorkflowCommand {
  /**
   * Initialize workflows directory with example workflows
   */
  async init(projectPath: string = '.'): Promise<void> {
    const openspecDir = getOpenSpecDirName(projectPath);
    const workflowsDir = path.join(projectPath, openspecDir, 'workflows');
    const commandsDir = path.join(projectPath, openspecDir, 'commands');

    // Create directories
    await FileSystemUtils.createDirectory(workflowsDir);
    await FileSystemUtils.createDirectory(path.join(workflowsDir, '.state'));
    await FileSystemUtils.createDirectory(commandsDir);

    // Create example research workflow
    const researchWorkflow = this.getResearchWorkflowTemplate();
    await FileSystemUtils.writeFile(
      path.join(workflowsDir, 'research.yaml'),
      researchWorkflow
    );

    // Create example execute workflow
    const executeWorkflow = this.getExecuteWorkflowTemplate();
    await FileSystemUtils.writeFile(
      path.join(workflowsDir, 'execute.yaml'),
      executeWorkflow
    );

    // Create example review workflow
    const reviewWorkflow = this.getReviewWorkflowTemplate();
    await FileSystemUtils.writeFile(
      path.join(workflowsDir, 'review.yaml'),
      reviewWorkflow
    );

    console.log('Created workflows directory with example workflows:');
    console.log('  - research.yaml  (domain investigation)');
    console.log('  - execute.yaml   (task execution)');
    console.log('  - review.yaml    (adversarial review)');
    console.log('');
    console.log('Run `openspec workflow prompts` to generate prompt templates.');
  }

  /**
   * List available workflows
   */
  async list(projectPath: string = '.'): Promise<void> {
    const workflows = await workflowParser.listWorkflows(projectPath);

    if (workflows.length === 0) {
      console.log('No workflows found. Run `openspec workflow init` to create examples.');
      return;
    }

    console.log('Available workflows:\n');

    for (const name of workflows) {
      try {
        const workflow = await workflowParser.parseByName(name, projectPath);
        console.log(`  ${name}`);
        console.log(`    ${workflow.description || 'No description'}`);
        console.log(`    Waves: ${workflow.waves.length}, Tasks: ${this.countTasks(workflow)}`);
        console.log('');
      } catch (error) {
        console.log(`  ${name} (invalid: ${(error as Error).message})`);
      }
    }
  }

  /**
   * Show workflow details
   */
  async show(workflowName: string, projectPath: string = '.'): Promise<void> {
    const workflow = await workflowParser.parseByName(workflowName, projectPath);

    console.log(`# Workflow: ${workflow.name}`);
    console.log(`ID: ${workflow.id}`);
    console.log(`Description: ${workflow.description || 'None'}`);
    console.log('');

    if (workflow.requires) {
      console.log('## Requirements');
      if (workflow.requires.files?.length) {
        console.log(`Files: ${workflow.requires.files.join(', ')}`);
      }
      if (workflow.requires.variables?.length) {
        console.log(`Variables: ${workflow.requires.variables.join(', ')}`);
      }
      console.log('');
    }

    console.log('## Waves');
    console.log('');

    for (let i = 0; i < workflow.waves.length; i++) {
      const wave = workflow.waves[i];
      console.log(`### Wave ${i + 1}: ${wave.id}${wave.checkpoint ? ' (checkpoint)' : ''}`);
      console.log('');

      for (const task of wave.tasks) {
        console.log(`  - [${task.agent}] ${task.name}`);
        console.log(`    Prompt: ${task.prompt}`);
        if (task.output) {
          console.log(`    Output: ${task.output}`);
        }
      }
      console.log('');
    }
  }

  /**
   * Generate execution instructions for a tool
   */
  async run(
    workflowName: string,
    tool: Tool,
    projectPath: string = '.',
    variables: Record<string, string> = {}
  ): Promise<void> {
    const instructions = await workflowOrchestrator.generateInstructions(
      workflowName,
      tool,
      projectPath,
      variables
    );

    console.log(instructions);
  }

  /**
   * Generate execution plan (JSON)
   */
  async plan(
    workflowName: string,
    tool: Tool,
    projectPath: string = '.',
    variables: Record<string, string> = {}
  ): Promise<void> {
    const plan = await workflowOrchestrator.generatePlan(
      workflowName,
      tool,
      projectPath,
      variables
    );

    console.log(JSON.stringify(plan, null, 2));
  }

  /**
   * Check workflow execution status
   */
  async status(workflowName: string, projectPath: string = '.'): Promise<void> {
    const execution = await workflowOrchestrator.loadExecutionState(workflowName, projectPath);

    if (!execution) {
      console.log(`No execution state found for workflow: ${workflowName}`);
      return;
    }

    console.log(`# Workflow Status: ${execution.workflow.name}`);
    console.log(`Status: ${execution.status}`);
    console.log(`Started: ${execution.started_at}`);
    if (execution.completed_at) {
      console.log(`Completed: ${execution.completed_at}`);
    }
    console.log(`Current Wave: ${execution.current_wave_index + 1} of ${execution.waves.length}`);
    console.log('');

    for (const wave of execution.waves) {
      const completedTasks = wave.tasks.filter((t) => t.status === 'complete').length;
      console.log(`Wave ${wave.wave.id}: ${wave.status} (${completedTasks}/${wave.tasks.length} tasks)`);

      for (const task of wave.tasks) {
        const icon = task.status === 'complete' ? '✓' : task.status === 'running' ? '→' : '○';
        console.log(`  ${icon} ${task.task.name}: ${task.status}`);
      }
    }
  }

  /**
   * Generate prompt template files
   */
  async generatePrompts(projectPath: string = '.'): Promise<void> {
    const openspecDir = getOpenSpecDirName(projectPath);
    const commandsDir = path.join(projectPath, openspecDir, 'commands');

    await FileSystemUtils.createDirectory(commandsDir);

    // Research prompts
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'research-stack.md'),
      this.getStackResearchPrompt()
    );
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'research-features.md'),
      this.getFeaturesResearchPrompt()
    );
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'research-architecture.md'),
      this.getArchitectureResearchPrompt()
    );
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'research-pitfalls.md'),
      this.getPitfallsResearchPrompt()
    );
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'research-synthesize.md'),
      this.getSynthesizePrompt()
    );

    // Review prompts
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'review-security.md'),
      this.getSecurityReviewPrompt()
    );
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'review-scale.md'),
      this.getScaleReviewPrompt()
    );
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'review-edge.md'),
      this.getEdgeCaseReviewPrompt()
    );

    // Execution prompt
    await FileSystemUtils.writeFile(
      path.join(commandsDir, 'execute-task.md'),
      this.getExecuteTaskPrompt()
    );

    console.log('Generated prompt templates in commands/:');
    console.log('  Research: research-stack.md, research-features.md, research-architecture.md,');
    console.log('            research-pitfalls.md, research-synthesize.md');
    console.log('  Review:   review-security.md, review-scale.md, review-edge.md');
    console.log('  Execute:  execute-task.md');
  }

  private countTasks(workflow: WorkflowDefinition): number {
    return workflow.waves.reduce((sum, wave) => sum + wave.tasks.length, 0);
  }

  // ============ Workflow Templates ============

  private getResearchWorkflowTemplate(): string {
    return `# Research Workflow
# Parallel domain investigation before proposal creation

version: "1.0"
id: research
name: Domain Research
description: Investigate domain knowledge, stack options, architecture patterns, and pitfalls before creating a proposal.

requires:
  variables:
    - topic

context_files:
  - planning/PROJECT.md
  - planning/STATE.md

waves:
  - id: investigate
    name: Parallel Investigation
    tasks:
      - id: stack-analysis
        name: Stack Analysis
        agent: research
        prompt: commands/research-stack.md
        output: research/investigations/stack-analysis.md
        context:
          topic: "{{topic}}"

      - id: feature-landscape
        name: Feature Landscape
        agent: research
        prompt: commands/research-features.md
        output: research/investigations/feature-landscape.md
        context:
          topic: "{{topic}}"

      - id: architecture
        name: Architecture Patterns
        agent: research
        prompt: commands/research-architecture.md
        output: research/investigations/architecture.md
        context:
          topic: "{{topic}}"

      - id: pitfalls
        name: Pitfall Research
        agent: research
        prompt: commands/research-pitfalls.md
        output: research/investigations/pitfalls.md
        context:
          topic: "{{topic}}"

  - id: synthesize
    name: Synthesize Findings
    tasks:
      - id: summary
        name: Create Research Summary
        agent: planning
        prompt: commands/research-synthesize.md
        inputs:
          - research/investigations/stack-analysis.md
          - research/investigations/feature-landscape.md
          - research/investigations/architecture.md
          - research/investigations/pitfalls.md
        output: research/SUMMARY.md

on_complete:
  update_state: true
`;
  }

  private getExecuteWorkflowTemplate(): string {
    return `# Execute Workflow
# Execute tasks from a change proposal

version: "1.0"
id: execute
name: Task Execution
description: Execute tasks from an OpenSpec change proposal, wave by wave.

requires:
  variables:
    - change_id
  files:
    - changes/{{change_id}}/tasks.md

context_files:
  - planning/STATE.md
  - planning/PROJECT.md

waves:
  - id: execute-tasks
    name: Execute Change Tasks
    tasks:
      - id: executor
        name: Task Executor
        agent: execution
        prompt: commands/execute-task.md
        inputs:
          - changes/{{change_id}}/tasks.md
          - changes/{{change_id}}/proposal.md
        context:
          change_id: "{{change_id}}"

on_complete:
  update_state: true
  update_roadmap: true
`;
  }

  private getReviewWorkflowTemplate(): string {
    return `# Review Workflow
# Adversarial review of a change proposal

version: "1.0"
id: review
name: Adversarial Review
description: Stress-test a proposal from security, scale, and edge case perspectives.

requires:
  variables:
    - change_id
  files:
    - changes/{{change_id}}/proposal.md

context_files:
  - planning/PROJECT.md

waves:
  - id: parallel-review
    name: Parallel Reviews
    tasks:
      - id: security-review
        name: Security Review
        agent: review
        prompt: commands/review-security.md
        inputs:
          - changes/{{change_id}}/proposal.md
          - changes/{{change_id}}/spec.md
        output: changes/{{change_id}}/reviews/security.md
        context:
          change_id: "{{change_id}}"

      - id: scale-review
        name: Scale Review
        agent: review
        prompt: commands/review-scale.md
        inputs:
          - changes/{{change_id}}/proposal.md
          - changes/{{change_id}}/spec.md
        output: changes/{{change_id}}/reviews/scale.md
        context:
          change_id: "{{change_id}}"

      - id: edge-review
        name: Edge Case Review
        agent: review
        prompt: commands/review-edge.md
        inputs:
          - changes/{{change_id}}/proposal.md
          - changes/{{change_id}}/spec.md
        output: changes/{{change_id}}/reviews/edge-cases.md
        context:
          change_id: "{{change_id}}"

  - id: review-checkpoint
    name: Review Checkpoint
    checkpoint: true
    tasks:
      - id: compile-review
        name: Compile Review Summary
        agent: planning
        prompt: commands/review-compile.md
        inputs:
          - changes/{{change_id}}/reviews/security.md
          - changes/{{change_id}}/reviews/scale.md
          - changes/{{change_id}}/reviews/edge-cases.md
        output: changes/{{change_id}}/REVIEW.md

on_complete:
  update_state: true
`;
  }

  // ============ Prompt Templates ============

  private getStackResearchPrompt(): string {
    return `# Stack Analysis Research

## Objective
Evaluate technology choices and stack options for: **{{topic}}**

## Process
1. Identify the domain and key technical requirements
2. Research current best practices and industry standards
3. Evaluate library/framework ecosystem and maturity
4. Document trade-offs between options
5. Consider long-term maintenance and community support

## Output Format
Write your findings as markdown. Include:

### Requirements
- List key technical requirements for this domain

### Options Evaluated
| Option | Pros | Cons | Maturity | Community |
|--------|------|------|----------|-----------|
| ... | ... | ... | ... | ... |

### Recommendation
State your recommended choice with clear rationale.

### Alternatives
List alternatives and when they might be preferred.

### References
Include links to documentation, benchmarks, or comparisons consulted.
`;
  }

  private getFeaturesResearchPrompt(): string {
    return `# Feature Landscape Research

## Objective
Map the feature landscape for: **{{topic}}**

## Process
1. Research what competitors/similar projects offer
2. Identify table-stakes features (must have)
3. Identify differentiators (competitive advantage)
4. Prioritize based on user value and effort

## Output Format

### Market Analysis
Brief overview of the competitive landscape.

### Table Stakes (Must Have)
Features users expect as baseline:
- [ ] Feature 1 - Why it's expected
- [ ] Feature 2 - Why it's expected

### Differentiators
Features that provide competitive advantage:
- [ ] Feature A - Value proposition
- [ ] Feature B - Value proposition

### Nice to Have
Lower priority features:
- [ ] Feature X
- [ ] Feature Y

### Feature Prioritization Matrix
| Feature | User Value | Effort | Priority |
|---------|-----------|--------|----------|
| ... | High/Med/Low | High/Med/Low | P0/P1/P2 |
`;
  }

  private getArchitectureResearchPrompt(): string {
    return `# Architecture Research

## Objective
Research architecture patterns and design considerations for: **{{topic}}**

## Process
1. Identify architectural requirements (scale, latency, consistency)
2. Research relevant architecture patterns
3. Evaluate trade-offs for this specific use case
4. Document key design decisions

## Output Format

### Requirements
- Scale: Expected load and growth
- Latency: Response time requirements
- Consistency: Data consistency needs
- Other constraints

### Architecture Patterns Considered
For each relevant pattern:
- **Pattern Name**
  - Description
  - When to use
  - Trade-offs
  - Relevance to this project

### Recommended Architecture
Describe the recommended approach with diagram (ASCII or description).

### Key Design Decisions
| Decision | Options | Choice | Rationale |
|----------|---------|--------|-----------|
| ... | ... | ... | ... |

### Integration Points
List external systems and how to integrate.
`;
  }

  private getPitfallsResearchPrompt(): string {
    return `# Pitfalls Research

## Objective
Identify common mistakes and pitfalls for: **{{topic}}**

## Process
1. Research common failures in this domain
2. Look for post-mortems and lessons learned
3. Identify anti-patterns to avoid
4. Document mitigation strategies

## Output Format

### Common Pitfalls

For each pitfall:

#### Pitfall: [Name]
- **What goes wrong**: Description
- **Why it happens**: Root cause
- **Impact**: Consequences
- **Mitigation**: How to avoid
- **Detection**: How to know if you're falling into this

### Anti-Patterns to Avoid
- Anti-pattern 1: Why it's bad
- Anti-pattern 2: Why it's bad

### Success Patterns
Patterns that successful projects follow:
- Pattern 1: Description
- Pattern 2: Description

### Monitoring & Early Warning
Signs that something is going wrong:
- Signal 1
- Signal 2
`;
  }

  private getSynthesizePrompt(): string {
    return `# Synthesize Research Findings

## Objective
Combine all research findings into actionable recommendations.

## Inputs
Read all investigation files and synthesize:
- Stack analysis
- Feature landscape
- Architecture patterns
- Pitfalls research

## Output Format

# Research Summary: {{topic}}

## Executive Summary
2-3 sentence overview of key findings and recommendations.

## Stack Recommendation
- **Recommended**: [Choice]
- **Rationale**: [Why]
- **Alternatives**: [When to choose differently]

## Feature Prioritization
### Phase 1 (MVP)
- Feature list for initial release

### Phase 2
- Features for next iteration

### Future
- Long-term features

## Architecture Decision
- Recommended pattern
- Key trade-offs accepted
- Critical integration points

## Risk Mitigation
Top pitfalls and how we'll avoid them:
1. Risk → Mitigation
2. Risk → Mitigation

## Implications for Roadmap
- Suggested phasing
- Dependencies to consider
- Skills/resources needed

## Open Questions
Questions requiring further investigation or stakeholder input.
`;
  }

  private getSecurityReviewPrompt(): string {
    return `# Security Review

## Objective
Find security vulnerabilities in the proposed changes for: **{{change_id}}**

## Perspective
You are a security researcher. Assume attackers are sophisticated and motivated.
Find ways to exploit, bypass, or abuse the proposed system.

## Process
1. Read the proposal and affected specs
2. Map the attack surface
3. Identify vulnerabilities by category:
   - Authentication/authorization bypasses
   - Injection points (SQL, XSS, command, template)
   - Data exposure risks
   - CSRF/SSRF vulnerabilities
   - Cryptographic weaknesses
   - Race conditions
   - Supply chain risks

## Output Format

# Security Review: {{change_id}}

## Attack Surface
List entry points and trust boundaries.

## Findings

### [CRITICAL/HIGH/MEDIUM/LOW]: Finding Title
- **Location**: File/component affected
- **Attack Vector**: How an attacker could exploit this
- **Impact**: What damage could be done
- **Proof of Concept**: Example attack (if applicable)
- **Mitigation**: Required fix
- **Status**: [ ] Not addressed

## Recommendations
Proactive security improvements beyond specific findings.

## Verdict
- [ ] Approved for implementation
- [ ] Requires changes before implementation
- [ ] Needs significant redesign
`;
  }

  private getScaleReviewPrompt(): string {
    return `# Scale Review

## Objective
Identify performance bottlenecks and scaling issues in: **{{change_id}}**

## Perspective
What breaks at 10x, 100x, 1000x scale? Think about:
- Request volume
- Data volume
- User concurrency
- Geographic distribution

## Process
1. Review data access patterns
2. Identify N+1 query problems
3. Check for missing indexes
4. Find memory-intensive operations
5. Look for blocking calls in hot paths
6. Evaluate caching opportunities
7. Consider horizontal scaling implications

## Output Format

# Scale Review: {{change_id}}

## Current Design Analysis
Brief summary of the proposed architecture from a scaling perspective.

## Findings

### [HIGH/MEDIUM/LOW]: Finding Title
- **Component**: What's affected
- **Current Behavior**: What happens now
- **At Scale**: What breaks and when
- **Impact**: Performance/cost/reliability effect
- **Mitigation**: Optimization strategy
- **Status**: [ ] Not addressed

## Scaling Recommendations
- Caching strategy
- Database optimization
- Async processing opportunities
- CDN/edge considerations

## Load Estimates
| Scenario | Requests/sec | Data Size | Expected Latency |
|----------|-------------|-----------|------------------|
| Current | ... | ... | ... |
| 10x | ... | ... | ... |
| 100x | ... | ... | ... |

## Verdict
- [ ] Scales adequately for expected load
- [ ] Needs optimization before launch
- [ ] Requires architectural changes
`;
  }

  private getEdgeCaseReviewPrompt(): string {
    return `# Edge Case Review

## Objective
Find edge cases and unexpected behaviors in: **{{change_id}}**

## Perspective
Think like a chaos monkey. What happens when:
- Inputs are at boundaries (empty, null, huge, unicode)
- Operations fail partway through
- Timing is unexpected (slow, fast, concurrent)
- Users do unexpected things

## Process
1. Map all inputs and their valid ranges
2. Test boundary conditions
3. Consider partial failures
4. Think about concurrency
5. Check error handling paths

## Output Format

# Edge Case Review: {{change_id}}

## Input Boundaries
| Input | Valid Range | Edge Cases to Test |
|-------|-------------|-------------------|
| ... | ... | empty, max, special chars |

## Findings

### [HIGH/MEDIUM/LOW]: Edge Case Title
- **Trigger**: How to reproduce
- **Current Behavior**: What happens
- **Expected Behavior**: What should happen
- **Impact**: User experience / data integrity effect
- **Fix**: How to handle properly
- **Status**: [ ] Not addressed

## Concurrency Scenarios
- Race condition 1: Description and mitigation
- Race condition 2: Description and mitigation

## Failure Modes
| Operation | Failure Mode | Current Handling | Recommended |
|-----------|-------------|------------------|-------------|
| ... | ... | ... | ... |

## Verdict
- [ ] Edge cases adequately handled
- [ ] Minor edge case improvements needed
- [ ] Significant gaps in error handling
`;
  }

  private getExecuteTaskPrompt(): string {
    return `# Task Executor

## Objective
Execute the next pending task from the change proposal: **{{change_id}}**

## Process
1. Read the tasks.md file for this change
2. Find the first task with status \`pending\`
3. Read any files listed in the task's "Files" field
4. Perform the action described
5. Run the verification command if specified
6. If verification passes:
   - Mark the task as \`complete\` in tasks.md
   - Commit with message: \`feat({{change_id}}): [task name]\`
7. If verification fails:
   - Report the failure
   - Do not mark complete
8. Update STATE.md with progress notes

## Important
- Only execute ONE task per invocation
- Always verify before marking complete
- Commit after each successful task
- Stop if verification fails

## Output
Report what was done:
- Task executed
- Files modified
- Verification result
- Commit created (or why not)
`;
  }
}
