import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TerminalWindowComponent } from '../../shared/terminal-window/terminal-window.component';
import { TypewriterComponent } from '../../shared/typewriter/typewriter.component';

interface BootLine {
  kind: 'cmd' | 'out';
  text: string;
}

const BOOT_LINES: BootLine[] = [
  { kind: 'cmd', text: 'git clone github.com/you/2026.git --wrapped' },
  { kind: 'out', text: "Cloning into '2026'... done." },
];

const FINAL_PROMPT = 'devrecap analyze --user';

const FLOAT_TOKENS = [
  'git commit -m "ship it"',
  'npm run build',
  '#1247 merged',
  'feat: add dark mode',
  'git push origin main',
  '✓ tests passed',
  'fix: off-by-one',
  'chore: bump deps',
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, TerminalWindowComponent, TypewriterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @ViewChild('usernameInput') usernameInput?: ElementRef<HTMLInputElement>;

  readonly bootLines = BOOT_LINES;
  readonly finalPrompt = FINAL_PROMPT;
  readonly floatTokens = FLOAT_TOKENS;

  username = signal('');
  stepIndex = signal(0);
  lines = signal<BootLine[]>([]);
  bootDone = signal(false);
  promptReady = signal(false);

  constructor(private router: Router) {
    this.processStep();
  }

  private processStep() {
    if (this.stepIndex() >= this.bootLines.length) {
      this.bootDone.set(true);
      return;
    }
    const step = this.bootLines[this.stepIndex()];
    if (step.kind === 'out') {
      setTimeout(() => this.advanceBoot(), 450);
    }
  }

  private advanceBoot() {
    this.lines.update((l) => [...l, this.bootLines[this.stepIndex()]]);
    this.stepIndex.set(this.stepIndex() + 1);
    this.processStep();
  }

  onBootCmdTyped() {
    this.advanceBoot();
  }

  onFinalTyped() {
    this.promptReady.set(true);
    setTimeout(() => this.usernameInput?.nativeElement.focus(), 50);
  }

  tokenStyle(index: number) {
    const left = (index * 37 + 8) % 92;
    const duration = 16 + (index % 5) * 3;
    const delay = -(index * 2.7);
    return {
      left: `${left}%`,
      animationDuration: `${duration}s`,
      animationDelay: `${delay}s`,
    };
  }

  submit() {
    const value = this.username().trim().replace(/^@/, '');
    if (!value) return;
    this.router.navigate(['/wrapped', value]);
  }

  tryDemo() {
    this.router.navigate(['/wrapped', 'demo']);
  }
}
