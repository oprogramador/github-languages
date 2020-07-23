#!/usr/bin/env node

const _ = require('lodash');
const jsonToMarkdown = require('json-to-markdown');
const commander = require('commander');
const packageInfo = require('./package');
const languages = require('./languages');

const LIMIT = 80;
const BOLD_LIMIT = 40;

commander
  .version(packageInfo.version)
  .option('-f, --files [type]', 'File names to get language statistics, separated with a coma (,)')
  .parse(process.argv);

const filesList = commander.files.split(',');
// eslint-disable-next-line global-require, import/no-dynamic-require
const inputData = filesList.map(filename => require(`./${filename}`));

const transformToRank = object => _.zipObject(
  _.sortBy(Object.entries(object).filter(([, value]) => value), ([, value]) => -value).map(([key]) => key),
  _.range(1, _.size(object)),
);

const groups = _.chunk(inputData, 2).map(([allData, newData]) => ({
  allData: transformToRank(allData),
  newData: transformToRank(newData),
}));

const getCoefficient = language => ({
  language,
  value: _.sum(groups.map(
    ({ allData, newData }) => (newData[language] || _.size(newData) + 1) / (allData[language] || _.size(allData)),
  )) / groups.length,
  pairs: groups.map(
    ({ allData, newData }) => ({ allRank: allData[language] || '🚫', newRank: newData[language] || '🚫' }),
  ),
  isAnywhereOnTop: _.flatten(groups.map(Object.values)).some(data => data[language] <= BOLD_LIMIT),
});

const bold = word => `**${word}**`;

const results = languages.map(getCoefficient);
const sortedResults = _.sortBy(results, ({ value }) => value);
const mostGrowing = sortedResults.slice(0, LIMIT);
const mostFailing = sortedResults.slice(-LIMIT).reverse();
const repoLabels = ['all repos', '10+ stars', '100+ stars', '1000+ stars', '10000+ stars'];

const resultsToMarkdown = data => jsonToMarkdown(
  data.map(({
    language, value, pairs, isAnywhereOnTop,
  }) => ({
    language: isAnywhereOnTop ? bold(language) : language,
    coefficient: value.toFixed(5),
    ..._.zipObject(repoLabels, pairs.map(({ allRank, newRank }) => `${allRank}→${newRank}`)),
  })),
  ['language', 'coefficient', ...repoLabels],
);

console.log('\n\n## Most growing languages within last 12 months');
console.log('<a name="most-growing" />\n\n');
console.log(resultsToMarkdown(mostGrowing));
console.log('\n\n## Most failing languages within last 12 months');
console.log('<a name="most-failing" />\n\n');
console.log(resultsToMarkdown(mostFailing));
