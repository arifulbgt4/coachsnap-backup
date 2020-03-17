function IsNumeric(input) {
  return input - 0 === input && `${input}`.trim().length > 0;
}

module.exports = IsNumeric;
