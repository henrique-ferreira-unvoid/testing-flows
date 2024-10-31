import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Injector,
  computed,
} from '@angular/core';
import { NodeEditor, GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from 'rete-connection-plugin';
import { AngularPlugin, Presets, AngularArea2D } from 'rete-angular-plugin/15';
import { Position } from 'rete-angular-plugin/types';
import { addCustomBackground } from './custom-background';
import {
  AutoArrangePlugin,
  Presets as ArrangePresets,
} from 'rete-auto-arrange-plugin';
import { DefaultNodeComponent } from './nodes/default/default-node.component';
import { DefaultConnectionComponent } from './connections/default/default-connection.component';
import { DefaultSocketComponent } from './sockets/default/default-socket.component';
import { ConnectionComponent } from 'rete-angular-plugin';

class Node extends ClassicPreset.Node {
  width = 180;
  height = 120;
}

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = AngularArea2D<Schemes>;

@Component({
  selector: 'app-rete',
  templateUrl: './rete.component.html',
  styleUrls: ['./rete.component.scss'],
  standalone: true,
})
export class ReteComponent implements AfterViewInit {
  public readonly title = 'CodeSandbox';

  @ViewChild('rete')
  private readonly _container!: ElementRef;

  private readonly _socket = new ClassicPreset.Socket('socket');

  private readonly _editor = new NodeEditor<Schemes>();
  private readonly _area = computed(() => {
    if (!this._container) return;
    return new AreaPlugin<Schemes, AreaExtra>(this._container.nativeElement);
  });
  private readonly _connection = new ConnectionPlugin<Schemes, AreaExtra>();
  private readonly _render = new AngularPlugin<Schemes, AreaExtra>({
    injector: this.injector,
  });
  private readonly _arrange = new AutoArrangePlugin<any>();

  constructor(private injector: Injector) {}

  private async _addNewNode(
    title: string,
    color: string,
    icon: string | null,
    position?: Position
  ): Promise<
    ClassicPreset.Node<
      { [x: string]: ClassicPreset.Socket | undefined },
      { [x: string]: ClassicPreset.Socket | undefined },
      { [x: string]: ClassicPreset.Control | undefined }
    >
  > {
    const newNode = new ClassicPreset.Node('Custom');
    newNode.addControl(
      'title',
      new ClassicPreset.InputControl('text', {
        initial: title,
      })
    );
    newNode.addControl(
      'color',
      new ClassicPreset.InputControl('text', {
        initial: color,
      })
    );
    newNode.addControl(
      'icon',
      new ClassicPreset.InputControl('text', {
        initial: icon,
      })
    );

    newNode.addInput(newNode.id, new ClassicPreset.Input(this._socket));
    newNode.addOutput(newNode.id, new ClassicPreset.Output(this._socket));
    await this._editor.addNode(newNode);

    if (position) {
      this._area()?.translate(newNode.id, position);
    }

    return newNode;
  }

  private async _drawEditor() {
    const area = this._area();
    if (!area) return;

    this._arrange.addPreset(ArrangePresets.classic.setup());
    this._area()!.use(this._arrange);

    AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl(),
    });

    this._render.addPreset(
      Presets.classic.setup({
        customize: {
          node() {
            return DefaultNodeComponent;
          },
          connection() {
            return ConnectionComponent;
          },
          socket() {
            return DefaultSocketComponent;
          },
        },
      })
    );

    this._connection.addPreset(ConnectionPresets.classic.setup());

    const background = document.createElement('div');

    background.classList.add('background');
    background.classList.add('fill-area');

    area.area.content.add(background);

    this._editor.use(area);
    area.use(this._connection);
    area.use(this._render);

    area.addPipe((c) => {
      return c;
    });

    AreaExtensions.simpleNodesOrder(area);

    const span = await this._addNewNode('SPAN', 'BLUE', 'fa-solid fa-house', {
      x: 100,
      y: 270,
    });
    const flowIdentifier = await this._addNewNode(
      'FLOW IDENTIFIER',
      'ORANGE',
      'fa-solid fa-gears',
      {
        x: 300,
        y: 150,
      }
    );
    const assetIdentifier = await this._addNewNode(
      'ASSET IDENTIFIER',
      'ORANGE',
      'fa-solid fa-gears',
      {
        x: 300,
        y: 225,
      }
    );
    const threatDetection = await this._addNewNode(
      'THREAT DETECTION',
      'ORANGE',
      'fa-solid fa-gears',
      {
        x: 300,
        y: 300,
      }
    );
    const remoteDetection = await this._addNewNode(
      'REMOTE DETECTION',
      'ORANGE',
      'fa-solid fa-gears',
      {
        x: 300,
        y: 375,
      }
    );
    const elasticFlowsIndex = await this._addNewNode(
      'ELASTIC FLOWS INDEX',
      'GREEN',
      'fa-solid fa-server',
      {
        x: 700,
        y: 150,
      }
    );
    const elasticAssetsIndex = await this._addNewNode(
      'ELASTIC ASSETS INDEX',
      'GREEN',
      'fa-solid fa-server',
      {
        x: 700,
        y: 250,
      }
    );
    const elasticAlertsIndex = await this._addNewNode(
      'ELASTIC ALERTS INDEX',
      'GREEN',
      'fa-solid fa-server',
      {
        x: 700,
        y: 350,
      }
    );

    await this._editor.addConnection(
      new ClassicPreset.Connection(
        span,
        span.id,
        flowIdentifier,
        flowIdentifier.id
      )
    );
    await this._editor.addConnection(
      new ClassicPreset.Connection(
        flowIdentifier,
        flowIdentifier.id,
        elasticFlowsIndex,
        elasticFlowsIndex.id
      )
    );

    AreaExtensions.zoomAt(area, this._editor.getNodes());

    return () => area.destroy();
  }

  public async arrangeNodes() {
    await this._arrange.layout();
  }

  public async handleAddNode(color: string, icon: string) {
    this._addNewNode('New Node', color, icon, { x: 500, y: 200 });
  }

  ngAfterViewInit(): void {
    this._drawEditor();
  }
}
