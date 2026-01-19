import { describe, it, expect } from 'vitest';
import {
  normalizeProjectorDir,
  replaceHardcodedProjectorPaths,
  replaceHardcodedDotProjectorPaths,
} from '../../src/utils/path-normalization.js';

describe('path normalization utilities', () => {
  describe('normalizeProjectorDir', () => {
    it('should leave directories starting with dot unchanged', () => {
      expect(normalizeProjectorDir('.projector')).toBe('.projector');
      expect(normalizeProjectorDir('.my-projector')).toBe('.my-projector');
    });

    it('should add dot prefix to directories without it', () => {
      expect(normalizeProjectorDir('projector')).toBe('.projector');
      expect(normalizeProjectorDir('my-projector')).toBe('.my-projector');
      expect(normalizeProjectorDir('custom')).toBe('.custom');
    });
  });

  describe('replaceHardcodedProjectorPaths', () => {
    it('should replace projector/ paths with default .projector', () => {
      const text = 'Write to projector/research/investigations/stack-analysis.md';
      expect(replaceHardcodedProjectorPaths(text)).toBe('Write to .projector/research/investigations/stack-analysis.md');
    });

    it('should replace projector/ paths with custom directory', () => {
      const text = 'Write to projector/research/investigations/stack-analysis.md';
      expect(replaceHardcodedProjectorPaths(text, '.my-projector')).toBe('Write to .my-projector/research/investigations/stack-analysis.md');
    });

    it('should add dot prefix if custom directory lacks it', () => {
      const text = 'Write to projector/research/investigations/stack-analysis.md';
      expect(replaceHardcodedProjectorPaths(text, 'my-projector')).toBe('Write to .my-projector/research/investigations/stack-analysis.md');
    });

    it('should handle multiple replacements', () => {
      const text = 'projector/changes and projector/specs';
      expect(replaceHardcodedProjectorPaths(text, '.custom')).toBe('.custom/changes and .custom/specs');
    });

    it('should not affect other text', () => {
      const text = 'This is just regular text with no paths';
      expect(replaceHardcodedProjectorPaths(text)).toBe(text);
    });
  });

  describe('replaceHardcodedDotProjectorPaths', () => {
    it('should replace .projector/ paths with custom directory', () => {
      const text = 'Write to .projector/research/investigations/stack-analysis.md';
      expect(replaceHardcodedDotProjectorPaths(text, '.my-projector')).toBe('Write to .my-projector/research/investigations/stack-analysis.md');
    });

    it('should add dot prefix if custom directory lacks it', () => {
      const text = 'Write to .projector/research/investigations/stack-analysis.md';
      expect(replaceHardcodedDotProjectorPaths(text, 'my-projector')).toBe('Write to .my-projector/research/investigations/stack-analysis.md');
    });

    it('should handle multiple replacements', () => {
      const text = '.projector/changes and .projector/specs';
      expect(replaceHardcodedDotProjectorPaths(text, '.custom')).toBe('.custom/changes and .custom/specs');
    });

    it('should not affect other text', () => {
      const text = 'This is just regular text with no paths';
      expect(replaceHardcodedDotProjectorPaths(text)).toBe(text);
    });
  });
});