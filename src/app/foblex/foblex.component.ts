import { Component } from '@angular/core';
import { EFConnectionBehavior, FFlowModule } from '@foblex/flow';

@Component({
  selector: 'app-foblex',
  standalone: true,
  imports: [FFlowModule],
  templateUrl: './foblex.component.html',
  styleUrl: './foblex.component.scss',
})
export class FoblexComponent {
  public eConnectionBehaviour = EFConnectionBehavior;
}
