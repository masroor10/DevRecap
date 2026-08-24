import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-terminal-window',
  standalone: true,
  templateUrl: './terminal-window.component.html',
  styleUrl: './terminal-window.component.scss',
})
export class TerminalWindowComponent {
  @Input() titleText = 'devrecap';
  @Input() tint: 'default' | 'add' | 'violet' = 'default';
}
