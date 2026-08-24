import { Component, Input } from '@angular/core';
import { HeatmapDay } from '../../core/models/recap.model';

@Component({
  selector: 'app-heatmap-grid',
  standalone: true,
  templateUrl: './heatmap-grid.component.html',
  styleUrl: './heatmap-grid.component.scss',
})
export class HeatmapGridComponent {
  @Input() days: HeatmapDay[] = [];
  @Input() highlightMonth: string | null = null;
  @Input() cellSize = 11;
  @Input() gap = 4;

  weeks(): HeatmapDay[][] {
    const weeks: HeatmapDay[][] = [];
    for (let i = 0; i < this.days.length; i += 7) {
      weeks.push(this.days.slice(i, i + 7));
    }
    return weeks;
  }

  level(count: number): number {
    if (count <= 0) return 0;
    if (count < 3) return 1;
    if (count < 6) return 2;
    if (count < 10) return 3;
    return 4;
  }

  isHighlighted(date: string): boolean {
    return !!this.highlightMonth && date.slice(0, 7) === this.highlightMonth;
  }
}
