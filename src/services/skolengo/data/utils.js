export var userToFormalName = function (user) { return "".concat(user.firstName.at(0), ". ").concat(user.lastName); };
export var userToName = function (user) { return "".concat(user.lastName, " ").concat(user.firstName); };
export var _skoUcFist = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
export var wait = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
