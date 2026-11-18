import { describe, expect, it } from "@jest/globals";

import { decodeHTMLEntities, formatHTML, parseHomeworkHTML } from "./html";

describe("decodeHTMLEntities", () => {
  it("decodes common French and typographic named entities", () => {
    expect(
      decodeHTMLEntities(
        "&Eacute;tudier l&rsquo;&oelig;uvre &laquo;&nbsp;C&rsquo;est &agrave; dire&nbsp;&raquo; &ndash; 20&nbsp;&euro; &agrave; 15&deg;&hellip;"
      )
    ).toBe("Étudier l’œuvre « C’est à dire » – 20 € à 15°…");
  });

  it("decodes lowercase and uppercase accented entities", () => {
    expect(
      decodeHTMLEntities(
        "&eacute;&egrave;&ecirc;&agrave;&acirc;&ugrave;&ocirc;&ccedil; &Egrave;&Ecirc;&Agrave;&Acirc;&Ugrave;&Ocirc;&Ccedil;&OElig;"
      )
    ).toBe("éèêàâùôç ÈÊÀÂÙÔÇŒ");
  });

  it("decodes decimal and hexadecimal numeric entities", () => {
    expect(decodeHTMLEntities("L&#39;exercice &#8217;test&#x2019; &#x00E9;")).toBe(
      "L'exercice ’test’ é"
    );
  });

  it("preserves unknown entities intact", () => {
    expect(decodeHTMLEntities("&unknownEntity;")).toBe("&unknownEntity;");
  });
});

describe("formatHTML", () => {
  it("prefixes <li> items with bullet points", () => {
    const html = "<p>À faire :</p><ul><li>Exercice 1</li><li>Exercice 2</li></ul>";
    expect(formatHTML(html)).toBe("À faire :\n• Exercice 1\n• Exercice 2");
  });

  it("handles <li><p>...</p></li> without extra blank lines", () => {
    const html = "<ul><li><p>Lire la page 12</p></li><li><p>Faire le sch&eacute;ma</p></li></ul>";
    expect(formatHTML(html)).toBe("• Lire la page 12\n• Faire le schéma");
  });

  it("normalizes line breaks and collapses nobreak when requested", () => {
    const html = "Bonjour<br />Le<p>monde</p>";
    expect(formatHTML(html)).toBe("Bonjour\nLe\nmonde");
    expect(formatHTML(html, true)).toBe("Bonjour Le monde");
  });
});

describe("parseHomeworkHTML", () => {
  it("extracts bold, italic, underline, strikethrough and mark styles", () => {
    const spans = parseHomeworkHTML(
      "<b>Gras</b> <i>Italique</i> <u>Soulign&eacute;</u> <s>Barr&eacute;</s> <mark>Surlign&eacute;</mark>"
    );

    expect(spans).toEqual([
      { text: "Gras", style: { bold: true } },
      { text: " ", style: {} },
      { text: "Italique", style: { italic: true } },
      { text: " ", style: {} },
      { text: "Souligné", style: { underline: true } },
      { text: " ", style: {} },
      { text: "Barré", style: { strikethrough: true } },
      { text: " ", style: {} },
      { text: "Surligné", style: { highlightColor: "rgba(255, 235, 59, 0.35)" } },
    ]);
  });

  it("parses inline CSS styles on spans", () => {
    const spans = parseHomeworkHTML(
      '<span style="font-weight: 700; font-style: italic; text-decoration: underline line-through; background-color: #ffe082;">Important</span>'
    );

    expect(spans).toEqual([
      {
        text: "Important",
        style: {
          bold: true,
          italic: true,
          underline: true,
          strikethrough: true,
          highlightColor: "#ffe082",
        },
      },
    ]);
  });

  it("preserves unordered and ordered lists with nested styles", () => {
    const ulSpans = parseHomeworkHTML(
      "<p>Travail :</p>\n<ul>\n  <li><b>Maths</b> : ex 1</li>\n  <li>Fran&ccedil;ais</li>\n</ul>"
    );
    expect(ulSpans).toEqual([
      { text: "Travail :\n• ", style: {} },
      { text: "Maths", style: { bold: true } },
      { text: " : ex 1\n• Français", style: {} },
    ]);

    const olSpans = parseHomeworkHTML(
      "<ol><li>Premier</li><li>Deuxi&egrave;me</li></ol>"
    );
    expect(olSpans).toEqual([
      { text: "1. Premier\n2. Deuxième", style: {} },
    ]);
  });

  it("extracts safe link hrefs and ignores unsafe protocols", () => {
    const spans = parseHomeworkHTML(
      'Consulter <a href="https://papillon.bzh/devoirs">le site</a> ou <a href="javascript:alert(1)">ignorer</a>'
    );

    expect(spans).toEqual([
      { text: "Consulter ", style: {} },
      {
        text: "le site",
        style: { href: "https://papillon.bzh/devoirs", underline: true },
      },
      { text: " ou ignorer", style: {} },
    ]);
  });

  it("preserves newlines in plain text without HTML tags", () => {
    expect(parseHomeworkHTML("Ligne 1\nLigne 2")).toEqual([
      { text: "Ligne 1\nLigne 2", style: {} },
    ]);
  });

  it("preserves literal < and > in math expressions", () => {
    expect(parseHomeworkHTML("Montrer que x < 5 et y > 3")).toEqual([
      { text: "Montrer que x < 5 et y > 3", style: {} },
    ]);
  });
});
