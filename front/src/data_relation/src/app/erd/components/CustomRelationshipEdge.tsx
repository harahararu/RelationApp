'use client';
import { EdgeProps, BaseEdge, getBezierPath } from '@xyflow/react';

interface RelationshipEdgeData {
  cardinality: string;
}

const CustomRelationshipEdge: React.FC<EdgeProps<RelationshipEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const renderCrowFoot = (cardinality: string) => {
    switch (cardinality) {
      case '1:N':
        return (
          <>
            <path d="M-10,0 L0,0" stroke="black" strokeWidth="2" />
            <path d="M0,-5 L0,5 L5,0 Z" fill="black" stroke="black" strokeWidth="2" />
          </>
        );
      case '1:1':
        return (
          <>
            <path d="M-10,0 L0,0" stroke="black" strokeWidth="2" />
            <path d="M0,-5 L0,5" stroke="black" strokeWidth="2" />
          </>
        );
      case 'N:N':
        return (
          <>
            <path d="M-10,-5 L-10,5 L-5,0 Z" fill="black" stroke="black" strokeWidth="2" />
            <path d="M0,-5 L0,5 L5,0 Z" fill="black" stroke="black" strokeWidth="2" />
          </>
        );
      default:
        return <path d="M-10,0 L0,0" stroke="black" strokeWidth="2" />;
    }
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <g transform={`translate(${targetX}, ${targetY})`}>
        {renderCrowFoot(data?.cardinality || '1:N')}
      </g>
      <text
        x={labelX}
        y={labelY}
        className="text-sm text-gray-700 font-medium bg-white px-2 py-1 rounded border border-gray-200"
        style={{ pointerEvents: 'none', zIndex: 10 }}
      >
        {data?.cardinality || '1:N'}
      </text>
    </>
  );
};

export default CustomRelationshipEdge;