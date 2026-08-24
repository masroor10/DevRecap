import { Component, Input } from '@angular/core';

export type IconName =
  | 'commit'
  | 'flame'
  | 'code'
  | 'star'
  | 'repo'
  | 'calendar'
  | 'share'
  | 'branch'
  | 'trend'
  | 'download';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name) {
        @case ('commit') {
          <line x1="2" y1="12" x2="8" y2="12" />
          <circle cx="12" cy="12" r="4" />
          <line x1="16" y1="12" x2="22" y2="12" />
        }
        @case ('flame') {
          <path
            fill="currentColor"
            stroke="none"
            d="M12 2c.4 2.6-1.7 4.1-3.1 5.9C7.3 9.9 6 12 6 14.5a6 6 0 0 0 12 0c0-2.5-1.4-3.8-2.3-4.5.2 1.6-.4 2.7-1.6 2.7-1.4 0-1.8-1.3-1.3-2.7C13.7 8.4 12.4 5 12 2Z"
          />
        }
        @case ('code') {
          <polyline points="9 7 4 12 9 17" />
          <polyline points="15 7 20 12 15 17" />
        }
        @case ('star') {
          <path
            fill="currentColor"
            stroke="none"
            d="M12 2.5l2.9 6 6.6.7-5 4.4 1.5 6.5L12 16.9 6 20.1l1.5-6.5-5-4.4 6.6-.7z"
          />
        }
        @case ('repo') {
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="7" y1="13" x2="13" y2="13" />
        }
        @case ('calendar') {
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
        }
        @case ('share') {
          <circle cx="6" cy="12" r="2.4" />
          <circle cx="18" cy="6" r="2.4" />
          <circle cx="18" cy="18" r="2.4" />
          <line x1="8.2" y1="10.8" x2="15.8" y2="7.2" />
          <line x1="8.2" y1="13.2" x2="15.8" y2="16.8" />
        }
        @case ('branch') {
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="6" cy="18" r="2.2" />
          <circle cx="18" cy="6" r="2.2" />
          <path d="M6 8.2V15.8" />
          <path d="M6 6h6a4 4 0 0 1 4 4v0" />
        }
        @case ('trend') {
          <polyline points="3 17 9 11 13 15 21 6" />
          <polyline points="15 6 21 6 21 12" />
        }
        @case ('download') {
          <path d="M12 3v12" />
          <polyline points="7 11 12 16 17 11" />
          <line x1="4" y1="20" x2="20" y2="20" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input() name: IconName = 'commit';
  @Input() size = 22;
}
