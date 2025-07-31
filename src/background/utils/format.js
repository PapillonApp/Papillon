export var formatHoursMinutes = function (timestamp) {
    var LAdate = new Date(timestamp);
    var heures = LAdate.getHours().toString().padStart(2, "0");
    var minutes = LAdate.getMinutes().toString().padStart(2, "0");
    return "".concat(heures, ":").concat(minutes);
};
