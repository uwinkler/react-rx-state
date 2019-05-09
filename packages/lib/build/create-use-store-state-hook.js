"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var react_1 = require("react");
var identifySelectorFunction = function (state) { return state; };
function createUseStoreStateHook(context) {
    function useStore(selectorFunction) {
        var _store = react_1.useContext(context);
        var selector = selectorFunction ? selectorFunction : identifySelectorFunction;
        var state$ = _store.state$;
        var startValue = selector(state$.value);
        var _a = react_1.useState(startValue), value = _a[0], setValue = _a[1];
        var output$ = react_1.useMemo(function () {
            return new rxjs_1.BehaviorSubject(startValue);
        }, [state$]);
        react_1.useEffect(function () {
            var subscription = state$.subscribe(function (nextStateValue) {
                var nextSubValue = selector(nextStateValue);
                output$.next(nextSubValue);
            });
            output$.pipe(operators_1.distinctUntilChanged()).subscribe(function (nextStateValue) { return setValue(nextStateValue); });
            return function cleanup() {
                subscription.unsubscribe();
            };
        }, [output$]);
        return value;
    }
    return useStore;
}
exports.createUseStoreStateHook = createUseStoreStateHook;
//# sourceMappingURL=create-use-store-state-hook.js.map