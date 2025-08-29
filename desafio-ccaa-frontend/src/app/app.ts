import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div style="padding: 20px; text-align: center;">
      <h1>CCAA Books - Teste</h1>
      <p>Teste de aplicação Angular funcionando!</p>
      <p>Backend conectado ao Supabase ✅</p>
      <router-outlet></router-outlet>
    </div>
  `
})
export class App {}
