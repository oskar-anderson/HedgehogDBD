module.exports = {
    moduleNameMapper: {
      "monaco-editor": "<rootDir>/__mocks__/monacoMock.js"
    },
    testEnvironment: "jsdom",
    setupFiles: [
        '<rootDir>/test/config.ts',
    ],
};