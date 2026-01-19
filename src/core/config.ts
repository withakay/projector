export const PROJECTOR_DIR_NAME = '.projector';

export const PROJECTOR_MARKERS = {
  start: '<!-- PROJECTOR:START -->',
  end: '<!-- PROJECTOR:END -->'
};

export interface ProjectorConfig {
  aiTools: string[];
}

export interface AIToolOption {
  name: string;
  value: string;
  available: boolean;
  successLabel?: string;
}

export const AI_TOOLS: AIToolOption[] = [
  { name: 'Claude Code', value: 'claude', available: true, successLabel: 'Claude Code' },
  { name: 'Codex', value: 'codex', available: true, successLabel: 'Codex' },
  { name: 'GitHub Copilot', value: 'github-copilot', available: true, successLabel: 'GitHub Copilot' },
  { name: 'OpenCode', value: 'opencode', available: true, successLabel: 'OpenCode' },
];
