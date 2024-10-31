import * as React from "react";
import { FunctionComponent } from "react";
import ReactFlow, {
  Controls,
  Background,
  ReactFlowProvider,
  ConnectionMode,
  ReactFlowProps,
} from "reactflow";

const Flow: FunctionComponent<any> = ({ props }: { props: ReactFlowProps }) => {
  // props.nodeTypes = nodeTypes;
  props.minZoom = 0.25;
  props.maxZoom = 1;
  props.autoPanOnConnect = true;
  props.connectionRadius = 20;
  props.elementsSelectable = true;
  props.elevateNodesOnSelect = true;
  props.fitView = false;
  props.connectOnClick = true;
  props.edgesFocusable = true;
  props.nodesFocusable = true;
  props.nodesDraggable = true;
  props.nodesConnectable = true;
  props.snapToGrid = false;
  props.snapGrid = [15, 15];
  props.nodeOrigin = [0, 0];
  props.noPanClassName = "nopan";
  props.connectionMode = ConnectionMode.Strict;
  props.preventScrolling = true;

  return (
    <ReactFlow {...(props as any)}>
      <Controls />
      <Background
        gap={20}
        size={2}
      />
    </ReactFlow>
  );
};

/**
 * ReactFlowProvider fixes some internal context
 * issues with ReactFlow
 */
export const ReactFlowWrappableComponent: FunctionComponent<any> = ({
  props,
}) => {
  return (
    <ReactFlowProvider>
      <Flow props={props} />
    </ReactFlowProvider>
  );
};
