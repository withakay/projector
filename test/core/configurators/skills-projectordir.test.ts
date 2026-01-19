import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkillsConfigurator } from '../../../src/core/configurators/skills.js';
import { FileSystemUtils } from '../../../src/utils/file-system.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

let tempDir: string;

beforeEach(async () => {
  tempDir = fs.mkdtempSync('projector-test-');
});

afterEach(async () => {
  if (tempDir && fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe('SkillsConfigurator with projectorDir', () => {
  let skillsConfigurator: SkillsConfigurator;

  beforeEach(async () => {
    skillsConfigurator = new SkillsConfigurator();
  });

  describe('getAvailableSkills with custom projectorDir', () => {
    it('should apply projectorDir to skill templates', () => {
      const customProjectorDir = '.my-projector';
      const skills = skillsConfigurator.getAvailableSkills(customProjectorDir);
      
      // Check that skills have the custom projector directory in their instructions
      const exploreSkill = skills.find(skill => skill.id === 'projector-explore');
      expect(exploreSkill).toBeDefined();
      expect(exploreSkill!.template.instructions).toContain('.my-projector/changes/<name>/proposal.md');
      
      const proposalSkill = skills.find(skill => skill.id === 'projector-proposal');
      expect(proposalSkill).toBeDefined();
      expect(proposalSkill!.template.instructions).toContain('.my-projector/');
    });

    it('should use default .projector when no projectorDir specified', () => {
      const skills = skillsConfigurator.getAvailableSkills();
      
      const exploreSkill = skills.find(skill => skill.id === 'projector-explore');
      expect(exploreSkill).toBeDefined();
      expect(exploreSkill!.template.instructions).toContain('.projector/changes/<name>/proposal.md');
    });
  });

  describe('installSkills with custom projectorDir', () => {
    it('should create skill files with custom projector directory', async () => {
      const customProjectorDir = '.test-projector';
      const projectPath = tempDir;
      
      await skillsConfigurator.installSkills(projectPath, customProjectorDir, ['projector-explore']);
      
      const skillsDir = path.join(projectPath, '.claude', 'skills', 'projector-explore');
      const skillFile = path.join(skillsDir, 'SKILL.md');
      
      expect(await FileSystemUtils.fileExists(skillFile)).toBe(true);
      
      const content = await FileSystemUtils.readFile(skillFile);
      expect(content).toContain('.test-projector/changes/<name>/proposal.md');
      expect(content).toContain('name: projector-explore');
    });
  });
});