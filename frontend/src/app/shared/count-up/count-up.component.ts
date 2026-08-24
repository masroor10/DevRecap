import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-count-up',
  standalone: true,
  template: `{{ display }}`,
  styles: [
    `
      :host {
        display: inline-block;
      }
      :host(.landed) {
        animation: land 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      @keyframes land {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.12);
        }
        100% {
          transform: scale(1);
        }
      }
    `,
  ],
})
export class CountUpComponent implements OnChanges {
  @Input() value = 0;
  @Input() durationMs = 1100;

  display = '0';

  @HostBinding('class.landed') landed = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) {
      this.animate();
    }
  }

  private animate() {
    const target = this.value;
    const duration = this.durationMs;
    const start = performance.now();
    this.landed = false;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.display = Math.round(target * eased).toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.landed = true;
      }
    };

    requestAnimationFrame(step);
  }
}
