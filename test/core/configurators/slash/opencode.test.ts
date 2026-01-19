import { describe, it, expect } from 'vitest';
import { OpenCodeSlashCommandConfigurator } from '/Users/jack/Code/withakay/projector/src/core/configurators/slash/opencode.js';
import { TemplateManager } from '/Users/jack/Code/withakay/projector/src/core/templates/index.js';

describe('slash command templates with projectorDir', () => {
  describe('default projectorDir (.projector)', () => {
    it('should use .projector when no projectorDir is specified', () => {
      const body = TemplateManager.getSlashCommandBody('research');

      expect(body).toContain('.projector/research/investigations/');
      expect(body).toMatch(/`[^`]*\.projector\/research\/investigations\/[^`]*`/);
    });

    it('should work with explicit .projector parameter', () => {
      const body = TemplateManager.getSlashCommandBody('research', '.projector');

      expect(body).toContain('.projector/research/investigations/');
      expect(body).toMatch(/`[^`]*\.projector\/research\/investigations\/[^`]*`/);
    });
  });

  describe('custom projectorDir', () => {
    it('should use custom projectorDir when specified', () => {
      const body = TemplateManager.getSlashCommandBody('research', '.my-projector');

      expect(body).toContain('.my-projector/research/investigations/');
      expect(body).toMatch(/`[^`]*\.my-projector\/research\/investigations\/[^`]*`/);
    });

    it('should add dot prefix if not provided', () => {
      const body = TemplateManager.getSlashCommandBody('research', 'myprojector');

      expect(body).toContain('.myprojector/research/investigations/');
      expect(body).toMatch(/`[^`]*\.myprojector\/research\/investigations\/[^`]*`/);
    });

    it('should keep review command body stable', () => {
      const body = TemplateManager.getSlashCommandBody('review', '.test');
      expect(body).toContain('Use the Projector agent skill `projector-review`');
    });
  });

  describe('OpenCode frontmatter with projectorDir', () => {
    it('should use custom projectorDir in frontmatter', () => {
      const configurator = new OpenCodeSlashCommandConfigurator();
      const frontmatter = (configurator as any).getFrontmatter('research', '.my-projector');

      expect(frontmatter).toContain('.my-projector/research/investigations/');
    });
  });
});