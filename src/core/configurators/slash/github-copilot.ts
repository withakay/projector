import { SlashCommandConfigurator } from './base.js';
import { SlashCommandId } from '../../templates/index.js';
import { EXTENDED_COMMANDS } from './base.js';

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: '.github/prompts/projector-proposal.prompt.md',
  apply: '.github/prompts/projector-apply.prompt.md',
  archive: '.github/prompts/projector-archive.prompt.md',
  research: '.github/prompts/projector-research.prompt.md',
  review: '.github/prompts/projector-review.prompt.md'
};

const FRONTMATTER: Record<SlashCommandId, string> = {
  proposal: `---
 description: Scaffold a new Projector change and validate strictly.
 ---
 
 $ARGUMENTS`,
  apply: `---
 description: Implement an approved Projector change and keep tasks in sync.
 ---
 
 $ARGUMENTS`,
  archive: `---
 description: Archive a deployed Projector change and update specs.
 ---
 
 $ARGUMENTS`,
  research: `---
 description: Conduct Projector research via skills (stack, architecture, features, pitfalls).
 ---
 
 $ARGUMENTS`,
  review: `---
 description: Conduct adversarial review via Projector review skill.
 ---
 
 $ARGUMENTS`
};


export class GitHubCopilotSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = 'github-copilot';
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
