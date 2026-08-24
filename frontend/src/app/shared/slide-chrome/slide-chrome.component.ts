import { Component, Input } from '@angular/core';
import { ProgressTicksComponent } from '../progress-ticks/progress-ticks.component';

@Component({
  selector: 'app-slide-chrome',
  standalone: true,
  imports: [ProgressTicksComponent],
  templateUrl: './slide-chrome.component.html',
  styleUrl: './slide-chrome.component.scss',
})
export class SlideChromeComponent {
  @Input() crumbs: string[] = [];
  @Input() count = 0;
  @Input() currentIndex = 0;
  @Input() paused = false;
  @Input() durationMs = 5000;
}
