import { IGatsbyPage } from "../redux/types";
import { IExecutionResult } from "../query/types";
interface IPageData {
    componentChunkName: IGatsbyPage["componentChunkName"];
    matchPath?: IGatsbyPage["matchPath"];
    path: IGatsbyPage["path"];
    staticQueryHashes: Array<string>;
}
export interface IPageDataWithQueryResult extends IPageData {
    result: IExecutionResult;
}
export declare function fixedPagePath(pagePath: string): string;
export declare function reverseFixedPagePath(pageDataRequestPath: string): string;
export declare function readPageData(publicDir: string, pagePath: string): Promise<IPageDataWithQueryResult>;
export declare function removePageData(publicDir: string, pagePath: string): Promise<void>;
export declare function pageDataExists(publicDir: string, pagePath: string): boolean;
export declare function writePageData(publicDir: string, { componentChunkName, matchPath, path: pagePath, staticQueryHashes, }: IPageData): Promise<IPageDataWithQueryResult>;
export declare function isFlushEnqueued(): boolean;
export declare function flush(): Promise<void>;
export declare function enqueueFlush(): void;
export declare function handleStalePageData(): Promise<void>;
export {};
