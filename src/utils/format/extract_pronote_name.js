function upperFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function upperName(name) {
    return name.split("-").map(upperFirst).join("-");
}
export default function extract_pronote_name(fullName) {
    var regex = /^([\p{L} \-]+) ([\p{L}\-]+.*)$/u;
    var match = fullName.match(regex);
    if (match) {
        var lastName = match[1].trim();
        var firstNames = match[2].trim();
        return {
            familyName: upperName(lastName),
            givenName: firstNames
        };
    }
    else {
        return {
            familyName: fullName,
            givenName: fullName
        };
    }
}
