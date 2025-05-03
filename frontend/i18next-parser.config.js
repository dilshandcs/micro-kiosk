module.exports = {
    locales: ['en', 'si'],
    input: [
        './app/**/*.{js,jsx,ts,tsx}',
        './actions/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './context/**/*.{js,jsx,ts,tsx}'
    ],
    output: 'locales/$LOCALE/translation.json',
    createOldCatalogs: false,
    failOnWarnings: true,
    keySeparator: '.',
    namespaceSeparator: false,
    useKeysAsDefaultValue: true,
    defaultValue: (locale, namespace, key) => key,
  };
  