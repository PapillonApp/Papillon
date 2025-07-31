export var lz = function (num) { return (num < 10 ? "0".concat(num) : num); };
export var getDuration = function (minutes) {
    var durationHours = Math.floor(minutes / 60);
    var durationRemainingMinutes = minutes % 60;
    if (durationHours === 0) {
        return "".concat(durationRemainingMinutes, " min");
    }
    return "".concat(durationHours, "h ").concat(lz(durationRemainingMinutes), "min");
};
