import path from "path";
import os from "os";
import { SlashCommandConfigurator, EXTENDED_COMMANDS } from "./base.js";
import { SlashCommandId, TemplateManager } from "../../templates/index.js";
import { FileSystemUtils } from "../../../utils/file-system.js";
import { PROJECTOR_MARKERS } from "../../config.js";

// Use POSIX-style paths for consistent logging across platforms.
const FILE_PATHS: Record<SlashCommandId, string> = {
  proposal: ".codex/prompts/projector-proposal.md",
  apply: ".codex/prompts/projector-apply.md",
  archive: ".codex/prompts/projector-archive.md",
  research: ".codex/prompts/projector-research.md",
  review: ".codex/prompts/projector-review.md",
};

export class CodexSlashCommandConfigurator extends SlashCommandConfigurator {
  readonly toolId = "codex";
  readonly isAvailable = true;

  protected getSupportedCommands(): SlashCommandId[] {
    return EXTENDED_COMMANDS;
  }

  protected getRelativePath(id: SlashCommandId): string {
    return FILE_PATHS[id];
  }

  protected getFrontmatter(id: SlashCommandId): string | undefined {
    // Codex supports YAML frontmatter with description and argument-hint fields,
    // plus $ARGUMENTS to capture all arguments as a single string.
    const frontmatter: Record<SlashCommandId, string> = {
      proposal: `---
 description: Scaffold a new Projector change and validate strictly.
 argument-hint: request or feature description
 ---
 
 $ARGUMENTS`,
      apply: `---
 description: Implement an approved Projector change and keep tasks in sync.
 argument-hint: change-id
 ---
 
 $ARGUMENTS`,
      archive: `---
 description: Archive a deployed Projector change and update specs.
 argument-hint: change-id
 ---
 
 $ARGUMENTS`,
      research: `---
 description: Conduct Projector research via skills (stack, architecture, features, pitfalls).
 argument-hint: topic to research
 ---
 
 $ARGUMENTS`,
      review: `---
 description: Conduct adversarial review via Projector review skill.
 argument-hint: change-id
 ---
 
 $ARGUMENTS`,
    };

    return frontmatter[id];
  }

  private getGlobalPromptsDir(): string {
    const home = (process.env.CODEX_HOME && process.env.CODEX_HOME.trim())
      ? process.env.CODEX_HOME.trim()
      : FileSystemUtils.joinPath(os.homedir(), ".codex");
    return FileSystemUtils.joinPath(home, "prompts");
  }

  // Codex discovers prompts globally. Generate directly in the global directory
  // and wrap shared body with markers.
  async generateAll(projectPath: string, _projectorDir: string): Promise<string[]> {
    const createdOrUpdated: string[] = [];
    for (const target of this.getTargets()) {
      const body = TemplateManager.getSlashCommandBody(target.id).trim();
      const promptsDir = this.getGlobalPromptsDir();
      const filePath = FileSystemUtils.joinPath(
        promptsDir,
        path.basename(target.path)
      );

      await FileSystemUtils.createDirectory(path.dirname(filePath));

      if (await FileSystemUtils.fileExists(filePath)) {
        await this.updateFullFile(filePath, target.id, body);
      } else {
        const frontmatter = this.getFrontmatter(target.id);
        const sections: string[] = [];
        if (frontmatter) sections.push(frontmatter.trim());
        sections.push(`${PROJECTOR_MARKERS.start}\n${body}\n${PROJECTOR_MARKERS.end}`);
        await FileSystemUtils.writeFile(filePath, sections.join("\n") + "\n");
      }

      createdOrUpdated.push(target.path);
    }
    return createdOrUpdated;
  }

  async updateExisting(projectPath: string, _projectorDir: string): Promise<string[]> {
    const updated: string[] = [];
    for (const target of this.getTargets()) {
      const promptsDir = this.getGlobalPromptsDir();
      const filePath = FileSystemUtils.joinPath(
        promptsDir,
        path.basename(target.path)
      );
      if (await FileSystemUtils.fileExists(filePath)) {
        const body = TemplateManager.getSlashCommandBody(target.id).trim();
        await this.updateFullFile(filePath, target.id, body);
        updated.push(target.path);
      }
    }
    return updated;
  }

  // Update both frontmatter and body in an existing file
  private async updateFullFile(filePath: string, id: SlashCommandId, body: string): Promise<void> {
    const content = await FileSystemUtils.readFile(filePath);
    const startIndex = content.indexOf(PROJECTOR_MARKERS.start);

    if (startIndex === -1) {
      throw new Error(`Missing Projector start marker in ${filePath}`);
    }

    // Replace everything before the start marker with the new frontmatter
    const frontmatter = this.getFrontmatter(id);
    const sections: string[] = [];
    if (frontmatter) sections.push(frontmatter.trim());
    sections.push(`${PROJECTOR_MARKERS.start}\n${body}\n${PROJECTOR_MARKERS.end}`);

    await FileSystemUtils.writeFile(filePath, sections.join("\n") + "\n");
  }

  // Resolve to the global prompts location for configuration detection
  resolveAbsolutePath(_projectPath: string, id: SlashCommandId): string {
    const promptsDir = this.getGlobalPromptsDir();
    const fileName = path.basename(FILE_PATHS[id]);
    return FileSystemUtils.joinPath(promptsDir, fileName);
  }
}
