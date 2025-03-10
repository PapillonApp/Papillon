const ts = require("typescript");

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Detect redundant `x || x.y` or `x && x` patterns",
      category: "Best Practices",
      recommended: false
    },
    schema: [],
    messages: {
      redundantLogical: "The logical expression `{{ expression }}` is redundant. Consider simplifying it."
    }
  },
  create (context) {
    const parserServices = context.parserServices;
    if (!parserServices?.program) {
      return {}; // Ignorer si TypeScript n'est pas activé
    }
    const typeChecker = parserServices.program.getTypeChecker();

    return {
      LogicalExpression (node) {
        if (node.operator === "&&" || node.operator === "||") {
          const left = context.getSourceCode().getText(node.left);
          const right = context.getSourceCode().getText(node.right);

          if (right.startsWith(left)) {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.left);
            const type = typeChecker.getTypeAtLocation(tsNode);
            const isNullable = (type.getFlags() & ts.TypeFlags.Null) !== 0;

            if ((node.operator === "&&" && isNullable) ||
                (node.operator === "||" && !isNullable)) {
              return;
            }

            // Extraire la partie après le point (ex: pour "x.y", on récupère "y")
            const suffix = right.slice(left.length);

            context.report({
              node,
              messageId: "redundantLogical",
              data: {
                expression: `${left} ${node.operator} ${right}`
              },
              fix (fixer) {
                if (node.operator === "&&") {
                  // Pour &&, utiliser l'opérateur optionnel
                  return fixer.replaceText(node, `${left}?${suffix}`);
                } else {
                  // Pour ||, utiliser l'accès direct
                  return fixer.replaceText(node, `${right}`);
                }
              }
            });
          }
        }
      }
    };
  }
};
