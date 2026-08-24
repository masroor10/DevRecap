import { Component, Input } from '@angular/core';

export type TickState = 'done' | 'active' | 'pending';

@Component({
  selector: 'app-progress-ticks',
  standalone: true,
  templateUrl: './progress-ticks.component.html',
  styleUrl: './progress-ticks.component.scss',
})
export class ProgressTicksComponent {
  @Input() count = 0;
  @Input() currentIndex = 0;
  @Input() paused = false;
  @Input() durationMs = 5000;

  stateFor(index: number): TickState {
    if (index < this.currentIndex) return 'done';
    if (index === this.currentIndex) return 'active';
    return 'pending';
  }

  indices(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
