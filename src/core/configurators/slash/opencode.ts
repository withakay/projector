import { SlashCommandConfigurator, EXTENDED_COMMANDS } from "./base.js";
import { SlashCommandId } from "../../templates/index.js";
import { FileSystemUtils } from "../../../utils/file-system.js";
import { PROJECTOR_MARKERS } from "../../config.js";
import { replaceHardcodedProjectorPaths } from "../../../utils/path-normalization.js";

const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: ".opencode/command/projector-proposal.md",
  apply: ".opencode/command/projector-apply.md",
  archive: ".opencode/command/projector-archive.md",
  research: ".opencode/command/projector-research.md",
  review: ".opencode/command/projector-review.md",
};

const FRONTMATTER_TEMPLATES: Record<SlashCommandId, string> = {
  proposal: `---
 description: Scaffold a new Projector change and validate strictly.
 ---
 The user has requested the following change proposal. Use the Projector skill to create their proposal.
 <UserRequest>
   $ARGUMENTS
 </UserRequest>
 `,
  apply: `---
 description: Implement an approved Projector change and keep tasks in sync.
 ---
 The user has requested to implement the following change proposal. Follow the Projector skill instructions.
 <UserRequest>
   $ARGUMENTS
 </UserRequest>
 `,
  archive: `---
 description: Archive a deployed Projector change and update specs.
 ---
 <ChangeId>
   $ARGUMENTS
 </ChangeId>
 `,
  research: `---
 description: Conduct Projector research via skills (stack, architecture, features, pitfalls).
 ---
 Conduct Projector research for the following topic. The prompt may include a focus like stack, architecture, features, or pitfalls.
 Write findings under projector/research/investigations/ as directed by the skill.
 <Topic>
   $ARGUMENTS
 </Topic>
 `,
  review: `---
 description: Conduct adversarial review via Projector review skill.
 ---
 Review the following change or scope using the Projector review skill instructions.
 <ChangeId>
   $ARGUMENTS
 </ChangeId>
 `,
};


export class OpenCodeSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = "opencode";
  readonly isAvailable = true;

  protected getSupportedCommands(): SlashCommandId[] {
    return EXTENDED_COMMANDS;
  }

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId, projectorDir: string = '.projector'): string | undefined {
    const template = FRONTMATTER_TEMPLATES[id];
    if (!template) {
      return undefined;
    }
    
    // Replace hardcoded 'projector/' paths with the configured projectorDir
    return replaceHardcodedProjectorPaths(template, projectorDir);
  }

  async generateAll(projectPath: string, projectorDir: string): Promise<string[]> {
    const createdOrUpdated = await super.generateAll(projectPath, projectorDir);
    await this.rewriteArchiveFile(projectPath, projectorDir);
    return createdOrUpdated;
  }

  async updateExisting(projectPath: string, projectorDir: string): Promise<string[]> {
    const updated = await super.updateExisting(projectPath, projectorDir);
    const rewroteArchive = await this.rewriteArchiveFile(projectPath, projectorDir);
    if (rewroteArchive && !updated.includes(FILE_PATHS.archive)) {
      updated.push(FILE_PATHS.archive);
    }
    return updated;
  }

  private async rewriteArchiveFile(projectPath: string, projectorDir: string = '.projector'): Promise<boolean> {
    const archivePath = FileSystemUtils.joinPath(projectPath, FILE_PATHS.archive);
    if (!await FileSystemUtils.fileExists(archivePath)) {
      return false;
    }

    const body = this.getBody("archive", projectorDir);
    const frontmatter = this.getFrontmatter("archive", projectorDir);
    const sections: string[] = [];

    if (frontmatter) {
      sections.push(frontmatter.trim());
    }

    sections.push(`${PROJECTOR_MARKERS.start}\n${body}\n${PROJECTOR_MARKERS.end}`);
    await FileSystemUtils.writeFile(archivePath, sections.join("\n") + "\n");
    return true;
  }
}
