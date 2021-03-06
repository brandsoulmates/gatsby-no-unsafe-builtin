import { AnyEventObject, ActionFunction, ActionFunctionMap, DoneEventObject } from "xstate";
import { IBuildContext } from "../../services";
/**
 * Handler for when we're inside handlers that should be able to mutate nodes
 * Instead of queueing, we call it right away
 */
export declare const callApi: ActionFunction<IBuildContext, AnyEventObject>;
/**
 * Event handler used in all states where we're not ready to process node
 * mutations. Instead we add it to a batch to process when we're next idle
 */
export declare const addNodeMutation: import("xstate").AssignAction<IBuildContext, AnyEventObject>;
export declare const assignStoreAndWorkerPool: import("xstate").AssignAction<IBuildContext, DoneEventObject>;
export declare const markQueryFilesDirty: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const markSourceFilesDirty: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const markSourceFilesClean: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const markNodesDirty: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const markNodesClean: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const incrementRecompileCount: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const resetRecompileCount: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const assignServiceResult: import("xstate").AssignAction<IBuildContext, DoneEventObject>;
/**
 * This spawns the service that listens to the `emitter` for various mutation events
 */
export declare const spawnMutationListener: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const assignServers: import("xstate").AssignAction<IBuildContext, AnyEventObject>;
export declare const spawnWebpackListener: import("xstate").AssignAction<IBuildContext, AnyEventObject>;
export declare const assignWebhookBody: import("xstate").AssignAction<IBuildContext, AnyEventObject>;
export declare const clearWebhookBody: import("xstate").AssignAction<IBuildContext, AnyEventObject>;
export declare const finishParentSpan: ({ parentSpan }: IBuildContext) => void;
export declare const saveDbState: () => Promise<void>;
export declare const logError: ActionFunction<IBuildContext, AnyEventObject>;
export declare const panic: ActionFunction<IBuildContext, AnyEventObject>;
export declare const panicBecauseOfInfiniteLoop: ActionFunction<IBuildContext, AnyEventObject>;
export declare const trackRequestedQueryRun: import("xstate").AssignAction<IBuildContext, AnyEventObject>;
export declare const clearPendingQueryRuns: import("xstate").AssignAction<IBuildContext, import("xstate").EventObject>;
export declare const buildActions: ActionFunctionMap<IBuildContext, AnyEventObject>;
