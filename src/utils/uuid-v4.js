/**
 * Generate an UUIDv4 string.
 */
export default function uuid() {
    var dateTime = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (dateTime + Math.random() * 16) % 16 | 0;
        dateTime = Math.floor(dateTime / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
}
;
