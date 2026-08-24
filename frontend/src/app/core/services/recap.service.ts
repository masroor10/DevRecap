import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Recap } from '../models/recap.model';

@Injectable({ providedIn: 'root' })
export class RecapService {
  constructor(private http: HttpClient) {}

  getRecap(username: string, year: number): Observable<Recap> {
    return this.http.get<Recap>(`${environment.apiBaseUrl}/recap/${username}`, {
      params: { year },
    });
  }
}
