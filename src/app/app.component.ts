import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FoblexComponent } from './foblex/foblex.component';
import { ReactflowDemoComponent } from './reactflow/reactflow-demo.component';
import { ReteComponent } from './rete/rete.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FoblexComponent,
    ReactflowDemoComponent,
    ReteComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent {
  public readonly currentFlow = signal('foblex');

  public handleCurrentFlowChange(flow: string) {
    this.currentFlow.set(flow);
  }
}
