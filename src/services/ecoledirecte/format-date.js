import { format } from "date-fns";
export var formatDate = function (date) {
    return format(date, "yyyy-MM-dd");
};
