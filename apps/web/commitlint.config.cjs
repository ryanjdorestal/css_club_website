module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [2, "always", ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert", "content", "inheritance"]],
    "subject-case": [0],
    "header-max-length": [2, "always", 140],
    "body-max-line-length": [0],
    "footer-max-line-length": [0],
  },
};
