import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private apiUrl = "http://localhost:3000/chat"; 

  constructor(private http: HttpClient, private authService: AuthService) {}

  chat(prompt: string): Observable<{ text: string }> {
    const token = this.authService.getToken();

    return this.http.post<{ text: string }>(
      this.apiUrl,
      { prompt }, // body
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } 
    );
  }
}
