import {
  ApplicationRef,
  Component,
  Injector,
  NgZone,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
// import {  } from 'ngx-reactflow';
import React from 'react';
import { Edge, Handle, Node, Position } from 'reactflow';
import { ReactMagicWrapperComponent } from '@dotglitch/ngx-common';
import dagre from '@dagrejs/dagre';

import { TargetNodeComponent } from './target-node/target-node.component';
import { SourceNodeComponent } from './source-node/source-node.component';
import { BasicNodeComponent } from './basic-node/basic-node.component';
import { pipeline } from './pipeline';
import { ReactFlowComponent } from './reactflow-wrapper';

@Component({
  selector: 'app-reactflow',
  templateUrl: './reactflow-demo.component.html',
  styleUrls: ['./reactflow-demo.component.scss'],
  imports: [ReactFlowComponent],
  standalone: true,
})
export class ReactflowDemoComponent implements OnInit {
  @ViewChild(ReactFlowComponent)
  public readonly reactFlow: ReactFlowComponent | undefined;

  pipeline = pipeline;

  items = [];

  public readonly nodes = signal<Node[]>([]);
  public readonly edges = signal<Edge[]>([]);

  nodeTypes = {
    basic: ReactMagicWrapperComponent.WrapAngularComponent({
      component: BasicNodeComponent,
      appRef: this.appRef,
      injector: this.injector,
      ngZone: this.ngZone,
      staticInputs: {},
      staticOutputs: {
        removeNode: ({ data }: { data: any }) => {
          const index = this.pipeline.stages.findIndex((s) => s.id == data.id);
          this.pipeline.stages.splice(index, 1);
          this.renderGraph();
        },
      },
      additionalChildren: [
        React.createElement(Handle, {
          type: 'target',
          position: Position.Left,
        }),
        React.createElement(Handle, {
          type: 'source',
          position: Position.Right,
        }),
      ],
    }),
    source: ReactMagicWrapperComponent.WrapAngularComponent({
      component: SourceNodeComponent,
      appRef: this.appRef,
      injector: this.injector,
      ngZone: this.ngZone,
      staticInputs: {
        // inputs
      },
      staticOutputs: {
        // outputs
      },
      additionalChildren: [
        React.createElement(Handle, {
          type: 'source',
          position: Position.Right,
        }),
      ],
    }),
    target: ReactMagicWrapperComponent.WrapAngularComponent({
      component: TargetNodeComponent,
      appRef: this.appRef,
      injector: this.injector,
      ngZone: this.ngZone,
      staticInputs: {
        // inputs
      },
      staticOutputs: {
        // outputs
      },
      additionalChildren: [
        React.createElement(Handle, {
          type: 'target',
          position: Position.Left,
        }),
      ],
    }),
  };

  constructor(
    private readonly appRef: ApplicationRef,
    private readonly injector: Injector,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit() {
    this.renderGraph();
  }

  addNewNode() {
    console.log('addNewNode');
    const id = (Math.random() * 10000000000).toFixed(0);
    this.nodes.update((nodes) => [
      ...nodes,
      {
        id: id,
        type: 'basic',
        data: {
          label: 'Node ' + id,
        },
        position: { x: 0, y: 0 },
      },
    ]);
  }

  renderGraph() {
    if (!this.pipeline) return;

    const edges: Edge[] = [];
    const nodes: Node[] =
      this.pipeline.stages?.map((stage) => {
        for (const precedingStageId of stage.stageTrigger ?? []) {
          const source =
            stage.stageTrigger?.length < 1
              ? '_source'
              : precedingStageId.split(':')[1];
          const target = stage.id.split(':')[1];

          edges.push({
            source: source,
            target: target,
            id: source + '.' + target,
            sourceHandle: 'source',
            type: 'bezier',
            style: {
              strokeWidth: 2,
              stroke: '#00c7ff',
            },
            data: {
              source: this.pipeline.stages.find(
                (s) => s.id == precedingStageId
              ),
              target: stage,
            },
          });

          const descendants = this.pipeline.stages.filter((s) =>
            s.stageTrigger?.some((trigger) => trigger === stage.id)
          );
          if (descendants.length == 0) {
            edges.push({
              source: target,
              target: '_target',
              id: source + '_target',
              sourceHandle: 'source',
              type: 'bezier',
              style: {
                strokeWidth: 2,
                stroke: '#009688',
              },
            });
          }
        }

        if (stage.stageTrigger?.length == 0) {
          edges.push({
            source: '_source',
            target: stage.id.split(':')[1],
            id: 'source_' + stage.id,
            sourceHandle: 'source',
            type: 'bezier',
            style: {
              strokeWidth: 2,
              stroke: '#009688',
            },
          });
        }

        return {
          id: stage.id.split(':')[1],
          width: 200,
          height: 80,
          type: 'basic',
          data: stage,
          style: {
            // "--background": stage.id == this.selectedStage?.id
            //     ? "#6d6d6d"
            //     : "#4b4b4b",
            // "--background-hover": stage.id == this.selectedStage?.id
            //     ? "#7f7f7f"
            //     : "#595959",
            // "--border-color": stage.id == this.selectedStage?.id
            //     ? "#00c7ff"
            //     : "#0000"
          } as any, // react doesn't have typing for CSS variables.
          position: {
            x: 300,
            y: 300,
          },
        };
      }) ?? [];

    nodes.push({
      id: '_source',
      width: 64,
      height: 64,
      type: 'source',
      data: {} as any,
      targetPosition: null,
      sourcePosition: null,
      position: {
        x: 20,
        y: 20,
      },
    } as any);
    nodes.push({
      id: '_target',
      width: 64,
      height: 64,
      type: 'target',
      data: {} as any,
      targetPosition: null,
      sourcePosition: null,
      position: {
        x: 10,
        y: 10,
      },
    } as any);

    const dagreGraph = new dagre.graphlib.Graph();

    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR' });

    nodes
      .filter((node) => node instanceof Node)
      .forEach((node) =>
        dagreGraph.setNode(node.id, {
          height: node?.height ?? 0,
          width: node?.width ?? 0 + 50,
        })
      );
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

    dagre.layout(dagreGraph);

    nodes
      .filter((node) => node instanceof Node)
      .forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        const newX = nodeWithPosition.x - (node.width ?? 0) / 2;
        const newY = nodeWithPosition.y - (node.height ?? 0) / 2;

        // Offset the entire grid so we don't need to pan the view initially.
        node.position = {
          x: newX + 20,
          y: newY + 20,
        };
      });
    console.log({
      nodes,
      edges,
    });
    this.edges.set(edges);
    this.nodes.set(nodes);
  }
}
