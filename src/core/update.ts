import path from 'path';
import { FileSystemUtils } from '../utils/file-system.js';
import { ToolRegistry } from './configurators/registry.js';
import { SlashCommandRegistry } from './configurators/slash/registry.js';
import { agentsTemplate } from './templates/agents-template.js';
import { getSpoolPath, getSpoolDirName } from './project-config.js';

export type UpdateSummary = {
  instructionFiles: string[];
  aiToolFiles: string[];
  slashCommands: string[];
  failed: string[];
};

export class UpdateCommand {
  async execute(projectPath: string, options?: { json?: boolean }): Promise<void> {
    const resolvedProjectPath = path.resolve(projectPath);
    const spoolDirName = getSpoolDirName(resolvedProjectPath);
    const spoolPath = getSpoolPath(resolvedProjectPath);

    // 1. Check spool directory exists
    if (!await FileSystemUtils.directoryExists(spoolPath)) {
      throw new Error(`No Spool directory found. Run 'spool init' first.`);
    }

    // 2. Update AGENTS.md (full replacement)
    const agentsPath = path.join(spoolPath, 'AGENTS.md');

    await FileSystemUtils.writeFile(agentsPath, agentsTemplate({ spoolDir: spoolDirName }));

    // 3. Update existing AI tool configuration files only
    const configurators = ToolRegistry.getAll();
    const slashConfigurators = SlashCommandRegistry.getAll();
    const updatedFiles: string[] = [];
    const createdFiles: string[] = [];
    const failedFiles: string[] = [];
    const updatedSlashFiles: string[] = [];
    const failedSlashTools: string[] = [];

    for (const configurator of configurators) {
      const configFilePath = path.join(
        resolvedProjectPath,
        configurator.configFileName
      );
      const fileExists = await FileSystemUtils.fileExists(configFilePath);
      const shouldConfigure =
        fileExists || configurator.configFileName === 'AGENTS.md';

      if (!shouldConfigure) {
        continue;
      }

      try {
        if (fileExists && !await FileSystemUtils.canWriteFile(configFilePath)) {
          throw new Error(
            `Insufficient permissions to modify ${configurator.configFileName}`
          );
        }

        await configurator.configure(resolvedProjectPath, spoolPath);
        updatedFiles.push(configurator.configFileName);

        if (!fileExists) {
          createdFiles.push(configurator.configFileName);
        }
      } catch (error) {
        failedFiles.push(configurator.configFileName);
        console.error(
          `Failed to update ${configurator.configFileName}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    for (const slashConfigurator of slashConfigurators) {
      if (!slashConfigurator.isAvailable) {
        continue;
      }

      try {
        const updated = await slashConfigurator.updateExisting(
          resolvedProjectPath,
          spoolPath
        );
        updatedSlashFiles.push(...updated);
      } catch (error) {
        failedSlashTools.push(slashConfigurator.toolId);
        console.error(
          `Failed to update slash commands for ${slashConfigurator.toolId}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    const instructionFiles: string[] = [`${spoolDirName}/AGENTS.md`];

    if (updatedFiles.includes('AGENTS.md')) {
      instructionFiles.push(
        createdFiles.includes('AGENTS.md') ? 'AGENTS.md (created)' : 'AGENTS.md'
      );
    }

    const aiToolFiles = updatedFiles.filter((file) => file !== 'AGENTS.md');

    // Normalize to forward slashes for cross-platform log consistency
    const slashCommands = updatedSlashFiles.map((p) => FileSystemUtils.toPosixPath(p));

    const failed = [
      ...failedFiles,
      ...failedSlashTools.map((toolId) => `slash command refresh (${toolId})`),
    ];

    const summary: UpdateSummary = {
      instructionFiles,
      aiToolFiles,
      slashCommands,
      failed,
    };

    if (options?.json) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    const lines: string[] = [];
    lines.push('Spool update complete');
    lines.push('');

    if (summary.instructionFiles.length > 0) {
      lines.push(`Instructions (${summary.instructionFiles.length})`);
      for (const file of summary.instructionFiles) {
        lines.push(`- ${file}`);
      }
      lines.push('');
    }

    if (summary.aiToolFiles.length > 0) {
      lines.push(`AI tool files (${summary.aiToolFiles.length})`);
      for (const file of summary.aiToolFiles) {
        lines.push(`- ${file}`);
      }
      lines.push('');
    }

    if (summary.slashCommands.length > 0) {
      lines.push(`Slash commands (${summary.slashCommands.length})`);
      for (const file of summary.slashCommands) {
        lines.push(`- ${file}`);
      }
      lines.push('');
    }

    if (summary.failed.length > 0) {
      lines.push(`Failed (${summary.failed.length})`);
      for (const item of summary.failed) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }

    process.stdout.write(lines.join('\n'));

    // No additional notes
  }
}
