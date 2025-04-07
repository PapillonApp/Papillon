const redundant_logical = require("./redundant-logical.js");
const no_redundant_ternary = require("./no-redundant-ternary.js");

const plugin = {
  rules: {
    "redundant-logical": redundant_logical,
    "no-redundant-ternary": no_redundant_ternary
  }
};
module.exports = plugin;
