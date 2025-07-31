import { useEffect, useState } from "react";
export var useDebounce = function (value, delay) {
    if (delay === void 0) { delay = 500; }
    var _a = useState(value), debouncedValue = _a[0], setDebouncedValue = _a[1];
    useEffect(function () {
        var timer = setTimeout(function () { return setDebouncedValue(value); }, delay);
        return function () {
            clearTimeout(timer);
        };
    }, [value, delay]);
    return debouncedValue;
};
