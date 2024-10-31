import {
  Component,
  Input,
  HostBinding,
  ChangeDetectorRef,
  OnChanges,
  computed,
} from '@angular/core';
import { ClassicPreset } from 'rete';
import { CommonModule, KeyValue } from '@angular/common';
import { InputControl } from 'rete/_types/presets/classic';
import {
  FaIconComponent,
  FontAwesomeModule,
} from '@fortawesome/angular-fontawesome';
import { IconProp } from '@fortawesome/angular-fontawesome/types';

@Component({
  templateUrl: './default-node.component.html',
  styleUrls: ['./default-node.component.scss'],
  imports: [FaIconComponent, FontAwesomeModule, CommonModule],
  standalone: true,
  host: {
    'data-testid': 'node',
  },
})
export class DefaultNodeComponent implements OnChanges {
  @Input() data!: ClassicPreset.Node;
  @Input() emit!: (data: any) => void;
  @Input() rendered!: () => void;
  public readonly title = computed(() => {
    if (!this.data) return null;
    const title = this.data.controls['title'] as InputControl<'text'>;
    return title.value;
  });
  public readonly color = computed(() => {
    if (!this.data) return null;
    const color = this.data.controls['color'] as InputControl<'text'>;
    return color.value;
  });
  public readonly icon = computed(() => {
    if (!this.data) return null;
    const icon = this.data.controls['icon'] as InputControl<'text'> | null;
    if (!icon) return null;
    return icon.value;
  });
  public readonly inputs = computed(() => {
    if (!this.data) return [];
    const inputs = this.data.inputs;
    const keys = Object.keys(inputs);
    const sorted = keys.sort((a, b) => {
      const ai = inputs[a]!.index || 0;
      const bi = inputs[b]!.index || 0;
      return ai - bi;
    });
    return sorted.map((key) => inputs[key]);
  });
  public readonly outputs = computed(() => {
    if (!this.data) return [];
    const outputs = this.data.outputs;
    const keys = Object.keys(outputs);
    const sorted = keys.sort((a, b) => {
      const ai = outputs[a]!.index || 0;
      const bi = outputs[b]!.index || 0;
      return ai - bi;
    });
    return sorted.map((key) => outputs[key]);
  })
  public readonly nodeIcon = computed<IconProp | undefined>(
    () => this.icon() || undefined
  );

  seed = 0;

  @HostBinding('class.selected') get selected() {
    return this.data.selected;
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.cdr.detach();
  }

  ngOnChanges(): void {
    this.cdr.detectChanges();
    requestAnimationFrame(() => this.rendered());
    this.seed++; // force render sockets
    console.log(this.data);
  }

  sortByIndex<
    N extends object,
    T extends KeyValue<string, N & { index?: number }>
  >(a: T, b: T) {
    const ai = a.value.index || 0;
    const bi = b.value.index || 0;

    return ai - bi;
  }
}
