import { Component, Input, OnInit } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon.component';

interface Piece {
  id: number;
  icon: IconName;
  size: number;
  style: Record<string, string>;
}

const ICONS: IconName[] = ['star', 'commit', 'branch'];
const COLORS = ['var(--diff-add)', 'var(--accent-violet)', 'var(--accent-blue)'];

@Component({
  selector: 'app-confetti',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="confetti">
      @for (p of particles; track p.id) {
        <span class="piece" [style]="p.style">
          <app-icon [name]="p.icon" [size]="p.size"></app-icon>
        </span>
      }
    </div>
  `,
  styleUrl: './confetti.component.scss',
})
export class ConfettiComponent implements OnInit {
  @Input() count = 26;

  particles: Piece[] = [];

  ngOnInit() {
    this.particles = Array.from({ length: this.count }, (_, i) => {
      const left = (i * 41 + (i % 7) * 13) % 100;
      const delay = (i % 12) * 0.22;
      const duration = 3.4 + (i % 5) * 0.55;
      const size = 12 + (i % 3) * 4;
      const rot = (i * 47) % 360;
      const color = COLORS[i % COLORS.length];

      return {
        id: i,
        icon: ICONS[i % ICONS.length],
        size,
        style: {
          left: `${left}%`,
          'animation-delay': `${delay}s`,
          'animation-duration': `${duration}s`,
          color,
          '--rot': `${rot}deg`,
        },
      };
    });
  }
}
