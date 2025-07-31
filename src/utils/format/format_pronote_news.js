import { convert as convertHTML } from "html-to-text";
function parse_news_resume(content) {
    var converted = convertHTML(content, {
        preserveNewlines: true,
        whitespaceCharacters: " ",
    });
    var formatted = converted.replace("\n", " ").replace(/Bonjour,|Bonjour à tous|Bonjour !|Bonsoir|Bonjour|Bonjour à tous, |Bonjour , |Bonsoir, /g, "").replace(/\n/g, "");
    var trimmed = formatted.trim();
    var decoma = (trimmed.startsWith(",") ? trimmed.slice(1) : trimmed).trim();
    var uppercased = decoma.charAt(0).toUpperCase() + decoma.slice(1);
    return uppercased;
}
export default parse_news_resume;
