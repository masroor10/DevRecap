import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-typewriter',
  standalone: true,
  templateUrl: './typewriter.component.html',
  styleUrl: './typewriter.component.scss',
})
export class TypewriterComponent implements OnInit, OnDestroy {
  @Input() text = '';
  @Input() speedMs = 35;
  @Output() done = new EventEmitter<void>();

  displayed = signal('');
  private timer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.type(0);
  }

  ngOnDestroy() {
    if (this.timer) clearTimeout(this.timer);
  }

  private type(index: number) {
    if (index > this.text.length) {
      this.done.emit();
      return;
    }
    this.displayed.set(this.text.slice(0, index));
    this.timer = setTimeout(() => this.type(index + 1), this.speedMs);
  }
}
