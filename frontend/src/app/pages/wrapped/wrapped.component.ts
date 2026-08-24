import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecapService } from '../../core/services/recap.service';
import { Recap } from '../../core/models/recap.model';
import { SlideChromeComponent } from '../../shared/slide-chrome/slide-chrome.component';
import { HeatmapGridComponent } from '../../shared/heatmap-grid/heatmap-grid.component';
import { CountUpComponent } from '../../shared/count-up/count-up.component';
import { IconComponent, IconName } from '../../shared/icon/icon.component';
import { ConfettiComponent } from '../../shared/confetti/confetti.component';
import { ShareCardComponent } from '../../shared/share-card/share-card.component';
import { DEMO_RECAP } from './demo-recap';

type SlideKind = 'intro' | 'stat' | 'compare' | 'heatmap' | 'outro';
type Accent = 'add' | 'violet' | 'blue';

interface Slide {
  kind: SlideKind;
  accent: Accent;
  icon: IconName;
  kicker: string;
  headline: string;
  numericValue?: number;
  unit?: string;
  detail?: string;
  diff?: boolean;
  percent?: number;
}

const SLIDE_SECONDS = 5.5;
const EXIT_MS = 220;

const LOADING_MESSAGES = [
  'Counting commits…',
  'Finding your longest streak…',
  'Mapping your busiest month…',
  'Packing the confetti…',
];

@Component({
  selector: 'app-wrapped',
  standalone: true,
  imports: [
    RouterLink,
    SlideChromeComponent,
    HeatmapGridComponent,
    CountUpComponent,
    IconComponent,
    ConfettiComponent,
    ShareCardComponent,
  ],
  templateUrl: './wrapped.component.html',
  styleUrl: './wrapped.component.scss',
})
export class WrappedComponent implements OnInit, OnDestroy {
  @ViewChild('shareCardEl') shareCardEl?: ElementRef<HTMLElement>;
  @ViewChild('stageEl') stageEl?: ElementRef<HTMLElement>;

  loading = signal(true);
  error = signal<string | null>(null);
  recap = signal<Recap | null>(null);
  slides = signal<Slide[]>([]);
  currentIndex = signal(0);
  paused = signal(false);
  direction = signal<'fwd' | 'back'>('fwd');
  exiting = signal(false);
  showHint = signal(false);
  exporting = signal(false);
  loadingIndex = signal(0);
  readonly loadingMessages = LOADING_MESSAGES;
  slideDurationMs = SLIDE_SECONDS * 1000;

  private timer: ReturnType<typeof setTimeout> | null = null;
  private exitTimer: ReturnType<typeof setTimeout> | null = null;
  private loadingTimer: ReturnType<typeof setInterval> | null = null;
  username = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recapService: RecapService,
  ) {}

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username') ?? '';
    const year = Number(this.route.snapshot.queryParamMap.get('year')) || new Date().getFullYear();

    this.loadingTimer = setInterval(() => {
      this.loadingIndex.set((this.loadingIndex() + 1) % this.loadingMessages.length);
    }, 1400);

    if (this.username.toLowerCase() === 'demo') {
      const recap = { ...DEMO_RECAP, year };
      this.onRecapReady(recap);
      return;
    }

    this.recapService.getRecap(this.username, year).subscribe({
      next: (recap) => this.onRecapReady(recap),
      error: (err) => {
        this.stopLoadingCycle();
        this.error.set(
          err.status === 404
            ? `No GitHub user named "${this.username}" found.`
            : 'Something went wrong fetching this recap.',
        );
        this.loading.set(false);
      },
    });
  }

  private onRecapReady(recap: Recap) {
    this.stopLoadingCycle();
    this.recap.set(recap);
    this.slides.set(this.buildSlides(recap));
    this.loading.set(false);
    this.scheduleNext();
    this.maybeShowHint();
    this.resetScroll();
  }

  private resetScroll() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (this.stageEl) this.stageEl.nativeElement.scrollTop = 0;
      });
    });
  }

  private stopLoadingCycle() {
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
      this.loadingTimer = null;
    }
  }

  private maybeShowHint() {
    try {
      if (localStorage.getItem('devrecap_hint_seen')) return;
      localStorage.setItem('devrecap_hint_seen', '1');
    } catch {
      /* localStorage unavailable */
    }
    this.showHint.set(true);
    setTimeout(() => this.showHint.set(false), 3000);
  }

  ngOnDestroy() {
    this.clearTimer();
    this.stopLoadingCycle();
    if (this.exitTimer) clearTimeout(this.exitTimer);
  }

  private buildSlides(recap: Recap): Slide[] {
    const slides: Slide[] = [
      {
        kind: 'intro',
        accent: 'violet',
        icon: 'branch',
        kicker: `${recap.year} recap`,
        headline: `@${this.username}`,
        detail: `Here's your year on GitHub.`,
      },
      {
        kind: 'stat',
        accent: 'add',
        icon: 'commit',
        kicker: 'total contributions',
        headline: recap.totalContributions.toLocaleString(),
        numericValue: recap.totalContributions,
        detail: 'commits, issues, PRs and reviews combined',
        diff: true,
      },
    ];

    if (recap.previousYearContributions && recap.previousYearContributions > 0) {
      const percent = Math.round(
        ((recap.totalContributions - recap.previousYearContributions) / recap.previousYearContributions) * 100,
      );
      slides.push({
        kind: 'compare',
        accent: percent >= 0 ? 'add' : 'blue',
        icon: 'trend',
        kicker: `vs. ${recap.year - 1}`,
        headline: `${percent >= 0 ? '+' : ''}${percent}%`,
        percent,
        detail:
          percent >= 0
            ? `more active than last year (${recap.previousYearContributions.toLocaleString()} → ${recap.totalContributions.toLocaleString()})`
            : `quieter than last year (${recap.previousYearContributions.toLocaleString()} → ${recap.totalContributions.toLocaleString()})`,
      });
    }

    slides.push({
      kind: 'stat',
      accent: 'add',
      icon: 'flame',
      kicker: 'longest streak',
      headline: `${recap.longestStreak}`,
      numericValue: recap.longestStreak,
      unit: `day${recap.longestStreak === 1 ? '' : 's'}`,
      detail: 'in a row without missing a commit',
      diff: true,
    });

    if (recap.topLanguage) {
      slides.push({
        kind: 'stat',
        accent: 'violet',
        icon: 'code',
        kicker: 'most used language',
        headline: recap.topLanguage,
        detail: 'across your top repositories',
      });
    }

    if (recap.mostActiveRepo) {
      slides.push({
        kind: 'stat',
        accent: 'blue',
        icon: 'repo',
        kicker: 'most active repo',
        headline: recap.mostActiveRepo.name,
        detail: `${recap.mostActiveRepo.commits.toLocaleString()} commits this year`,
      });
    }

    if (recap.mostStarredRepo) {
      slides.push({
        kind: 'stat',
        accent: 'blue',
        icon: 'star',
        kicker: 'most starred repo',
        headline: recap.mostStarredRepo.name,
        detail: `${recap.mostStarredRepo.stars.toLocaleString()} stars`,
      });
    }

    slides.push({
      kind: 'heatmap',
      accent: 'add',
      icon: 'calendar',
      kicker: 'busiest month',
      headline: this.formatMonth(recap.busiestMonth),
    });

    slides.push({
      kind: 'outro',
      accent: 'violet',
      icon: 'share',
      kicker: 'that’s a wrap',
      headline: 'Share your DevRecap',
    });

    return slides;
  }

  private formatMonth(month: string): string {
    if (!month) return '—';
    const [year, m] = month.split('-');
    const date = new Date(Number(year), Number(m) - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  currentSlide(): Slide {
    return this.slides()[this.currentIndex()];
  }

  busiestMonthKey(): string | null {
    const recap = this.recap();
    return recap ? recap.busiestMonth : null;
  }

  next() {
    this.go(this.currentIndex() + 1, 'fwd');
  }

  prev() {
    this.go(this.currentIndex() - 1, 'back');
  }

  private go(newIndex: number, dir: 'fwd' | 'back') {
    if (newIndex < 0 || newIndex >= this.slides().length) return;
    this.clearTimer();
    this.direction.set(dir);
    this.exiting.set(true);
    if (this.exitTimer) clearTimeout(this.exitTimer);
    this.exitTimer = setTimeout(() => {
      this.currentIndex.set(newIndex);
      this.exiting.set(false);
      this.scheduleNext();
      this.resetScroll();
    }, EXIT_MS);
  }

  togglePause(pause: boolean) {
    this.paused.set(pause);
    if (pause) {
      this.clearTimer();
    } else {
      this.scheduleNext();
    }
  }

  private scheduleNext() {
    this.clearTimer();
    this.timer = setTimeout(() => this.next(), this.slideDurationMs);
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') this.next();
    if (event.key === 'ArrowLeft') this.prev();
  }

  private async captureShareCard(): Promise<HTMLCanvasElement | null> {
    const el = this.shareCardEl?.nativeElement;
    if (!el) return null;
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas(el, { backgroundColor: '#0d1117', scale: 3 });
  }

  async downloadImage() {
    this.exporting.set(true);
    try {
      const canvas = await this.captureShareCard();
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `devrecap-${this.username}-${this.recap()?.year ?? ''}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      this.exporting.set(false);
    }
  }

  async share() {
    this.exporting.set(true);
    try {
      const canvas = await this.captureShareCard();
      if (canvas && (navigator as any).canShare) {
        const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const file = new File([blob], `devrecap-${this.username}.png`, { type: 'image/png' });
          if ((navigator as any).canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'My DevRecap' } as any);
            return;
          }
        }
      }
    } catch {
      /* fall through to link share */
    } finally {
      this.exporting.set(false);
    }

    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My DevRecap', url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
