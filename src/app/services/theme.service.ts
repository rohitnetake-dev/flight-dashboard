import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkSubject = new BehaviorSubject<boolean>(this.getInitialTheme());
  isDark$ = this.darkSubject.asObservable();

  constructor() {
    this.applyTheme(this.darkSubject.value);
  }

  toggle(): void {
    const dark = !this.darkSubject.value;
    this.darkSubject.next(dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    this.applyTheme(dark);
  }

  private applyTheme(dark: boolean): void {
    document.body.classList.toggle('dark-theme', dark);
  }

  private getInitialTheme(): boolean {
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
