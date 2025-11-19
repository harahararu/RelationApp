import { Column } from "./types";

export type CustomNode = {
	name: string;
	columns: Column[]
}

export type CustomEdge = {
	id: string;
	source: string;
	target: string;
	data: {
		cardinality: string;
	};
}
