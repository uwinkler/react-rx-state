"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var connect_actions_1 = require("./connect-actions");
function createActionsHook(provider, selectorFunction, actionFactory) {
    return function useActions() {
        var store = react_1.useContext(provider);
        var actions = react_1.useMemo(function () { return connect_actions_1.connectActions(store, selectorFunction, actionFactory); }, [store]);
        return actions;
    };
}
exports.createActionsHook = createActionsHook;
//# sourceMappingURL=create-actions-hook.js.map