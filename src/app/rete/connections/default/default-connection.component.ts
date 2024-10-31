import { Component, Input } from '@angular/core';
import { ClassicPreset } from 'rete';

@Component({
  selector: 'connection',
  templateUrl: './default-connection.component.html',
  styleUrl: './default-connection.component.scss',
})
export class DefaultConnectionComponent {
  @Input() data!: ClassicPreset.Connection<
    ClassicPreset.Node,
    ClassicPreset.Node
  >;
  @Input() start: any;
  @Input() end: any;
  @Input() path!: string;

  logData() {
    console.log(this.data);
    console.log(this.start);
    console.log(this.end);
    console.log(this.path);
  }
}
