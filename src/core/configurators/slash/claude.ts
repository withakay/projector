import { SlashCommandConfigurator, EXTENDED_COMMANDS } from './base.js';
import { SlashCommandId } from '../../templates/index.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.claude/commands/projector/proposal.md',
  apply: '.claude/commands/projector/apply.md',
  archive: '.claude/commands/projector/archive.md',
  research: '.claude/commands/projector/research.md',
  review: '.claude/commands/projector/review.md',
};

const FRONTMATTER: Record<SlashCommandId, string> = {
  proposal: `---
name: Projector: Proposal
description: Scaffold a new Projector change and validate strictly.
category: Projector
tags: [projector, change]
---`,
  apply: `---
name: Projector: Apply
description: Implement an approved Projector change and keep tasks in sync.
category: Projector
tags: [projector, apply]
---`,
  archive: `---
name: Projector: Archive
description: Archive a deployed Projector change and update specs.
category: Projector
tags: [projector, archive]
---`,
  research: `---
name: Projector: Research
description: Conduct research via Projector skills (stack, architecture, features, pitfalls).
category: Projector
tags: [projector, research]
---`,
  review: `---
name: Projector: Review
description: Conduct adversarial review via Projector review skill.
category: Projector
tags: [projector, review]
---`,
};

export class ClaudeSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'claude';
  readonly isAvailable = true;

  protected getSupportedCommands(): SlashCommandId[] {
    return EXTENDED_COMMANDS;
  }

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string {
    return FRONTMATTER[id];
  }
}
