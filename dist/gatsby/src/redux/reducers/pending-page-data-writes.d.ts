import { ActionsUnion, IGatsbyState } from "../types";
export declare const pendingPageDataWritesReducer: (state: {
    pagePaths: Set<string>;
} | undefined, action: ActionsUnion) => IGatsbyState["pendingPageDataWrites"];
