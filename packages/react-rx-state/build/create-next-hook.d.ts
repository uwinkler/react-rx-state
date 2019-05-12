/// <reference types="react" />
import { RxStore } from "./rx-store";
declare type CreateUseUpdateHookInput<S> = React.Context<RxStore<S>>;
declare type SelectorFunction<S, T extends object> = (state: S) => T;
declare type UpdateFunction<T> = (subState: T) => void;
export declare function createNextHook<S extends object>(provider: CreateUseUpdateHookInput<S>): <T extends object>(selectorFunction?: SelectorFunction<S, T> | undefined) => (updateFunction: UpdateFunction<T>) => void;
export {};
//# sourceMappingURL=create-next-hook.d.ts.map