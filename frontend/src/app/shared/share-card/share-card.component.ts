import { Component, Input } from '@angular/core';
import { Recap } from '../../core/models/recap.model';
import { IconComponent } from '../icon/icon.component';
import { HeatmapGridComponent } from '../heatmap-grid/heatmap-grid.component';

@Component({
  selector: 'app-share-card',
  standalone: true,
  imports: [IconComponent, HeatmapGridComponent],
  templateUrl: './share-card.component.html',
  styleUrl: './share-card.component.scss',
})
export class ShareCardComponent {
  @Input() recap!: Recap;
  @Input() username = '';

  initial(): string {
    return (this.username || '?').charAt(0).toUpperCase();
  }

  growthPercent(): number | null {
    const prev = this.recap.previousYearContributions;
    if (!prev) return null;
    return Math.round(((this.recap.totalContributions - prev) / prev) * 100);
  }
}
