// src/app/services/ai.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private apiUrl = "http://localhost:3000/chat"; 

  constructor(private http: HttpClient) {}

  chat(prompt: string): Observable<{ text: string }> {
    return this.http.post<{ text: string }>(this.apiUrl, { prompt });
  }
}
