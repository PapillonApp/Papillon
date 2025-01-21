import { convert as convertHTML } from "html-to-text";

function parse_news_resume (content: string): string {
  const converted = convertHTML(content);
  const formatted = converted.replace(/Bonjour,|Bonjour à tous|Bonjour !|Bonsoir|Bonjour|Bonjour à tous, |Bonjour , |Bonsoir, /g, "").replace(/\n/g, "");
  const trimmed = formatted.trim();
  const decoma = (trimmed.startsWith(",") ? trimmed.slice(1) : trimmed).trim();
  const uppercased = decoma.charAt(0).toUpperCase() + decoma.slice(1);
  return uppercased;
}

export default parse_news_resume;
