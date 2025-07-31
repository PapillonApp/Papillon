import { formatDistance, isToday, isTomorrow } from "date-fns";
import { fr } from "date-fns/locale";
export var timestampToString = function (timestamp) {
    if (isNaN(timestamp)) {
        return;
    }
    if (isToday(timestamp)) {
        return "Aujourd’hui";
    }
    if (isTomorrow(timestamp)) {
        return "Demain";
    }
    var mtn = new Date();
    mtn.setHours(0, 0, 0, 0);
    return formatDistance(new Date(timestamp), mtn, {
        locale: fr,
        addSuffix: true,
    });
};
