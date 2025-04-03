module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Detect and transform nested ternary operators into nullish coalescing chains",
      category: "Best Practices",
      recommended: false
    },
    schema: [],
    messages: {
      redundantNestedTernary: "The nested ternary can be simplified using nullish coalescing operators"
    },
    fixable: "code",
  },
  create (context) {
    function processConditionalExpression (node) {
      const sourceCode = context.getSourceCode();

      // Fonction récursive pour construire la chaîne de nullish coalescing
      function buildNullishChain (node) {
        if (node.type !== "ConditionalExpression") {
          return sourceCode.getText(node);
        }

        const test = sourceCode.getText(node.test);

        // Si c'est un ternaire imbriqué dans l'alternate
        if (node.alternate.type === "ConditionalExpression") {
          // Récupérer l'expression complète du consequent
          const nextValueNode = node.alternate.consequent;

          // Si c'est un accès à une propriété imbriquée, ajouter l'optional chaining
          if (nextValueNode.type === "MemberExpression") {
            const object = sourceCode.getText(nextValueNode.object);
            const property = sourceCode.getText(nextValueNode.property);
            return `${test} ?? ${object}?.${property} ?? ${sourceCode.getText(node.alternate.alternate)}`;
          }

          const nextValue = sourceCode.getText(nextValueNode);
          return `${test} ?? ${nextValue} ?? ${sourceCode.getText(node.alternate.alternate)}`;
        }

        return `${test} ?? ${sourceCode.getText(node.alternate)}`;
      }

      // Vérifie si c'est un cas valide à transformer
      function isValidTransform (node) {
        if (!node || node.type !== "ConditionalExpression") return false;

        const test = sourceCode.getText(node.test);
        const consequent = sourceCode.getText(node.consequent);

        // Soit test et consequent sont identiques
        if (test === consequent) return true;

        // Soit c'est dans un alternate d'un ternaire valide
        return !!(node.parent?.type === "ConditionalExpression"
            && node.parent.alternate === node
            && isValidTransform(node.parent));
      }

      // Vérifie si c'est un cas de ternaire imbriqué à transformer
      if (isValidTransform(node)) {
        context.report({
          node,
          messageId: "redundantNestedTernary",
          fix (fixer) {
            return fixer.replaceText(node, buildNullishChain(node));
          }
        });
      }
    }

    return {
      ConditionalExpression: processConditionalExpression
    };
  }
};
