export var formatCardIdentifier = function (identifier, dots, separator) {
    var _a;
    if (dots === void 0) { dots = 4; }
    if (separator === void 0) { separator = " "; }
    if (!identifier) {
        return "";
    }
    var visiblePart = identifier.slice(-4).toLowerCase();
    var maskedPart = identifier.slice(-(4 + dots), -4).replace(/./g, "•");
    return (maskedPart + separator + ((_a = visiblePart.match(/.{1,4}/g)) !== null && _a !== void 0 ? _a : []).join(" "));
};
