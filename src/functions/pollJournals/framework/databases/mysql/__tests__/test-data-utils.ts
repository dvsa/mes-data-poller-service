const importer = require('mysql-import');

export const loadTestFile = async (pathRelativeToTestData: string) => {
  const importerInstance = importer.config({
    host: 'localhost',
    database: 'tarsreplica',
    user: 'root',
    password: 'Pa55word1',
  });
  const path = `src/functions/pollJournals/framework/repo/mysql/__tests__/data/${pathRelativeToTestData}`;
  await importerInstance.import(path);
};
