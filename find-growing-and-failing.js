#!/usr/bin/env node

const _ = require('lodash');
const jsonToMarkdown = require('json-to-markdown');
const languages = require('./languages');
const all = require('./all');
const new0 = require('./all-since-2018');
const all10 = require('./10-all');
const new10 = require('./10-since-2018');
const all100 = require('./100-all');
const new100 = require('./100-since-2018');
const all1000 = require('./1000-all');
const new1000 = require('./1000-since-2018');
const all10000 = require('./10000-all');
const new10000 = require('./10000-since-2018');

const transformToRank = object => _.zipObject(
  _.sortBy(Object.entries(object).filter(([, value]) => value), ([, value]) => -value).map(([key]) => key),
  _.range(1, _.size(object)),
);

const groups = [
  {
    allData: transformToRank(all),
    newData: transformToRank(new0),
  },
  {
    allData: transformToRank(all10),
    newData: transformToRank(new10),
  },
  {
    allData: transformToRank(all100),
    newData: transformToRank(new100),
  },
  {
    allData: transformToRank(all1000),
    newData: transformToRank(new1000),
  },
  {
    allData: transformToRank(all10000),
    newData: transformToRank(new10000),
  },
];

const getCoefficient = language => ({
  language,
  value: _.sum(groups.map(
    ({ allData, newData }) => (newData[language] || _.size(newData) + 1) / (allData[language] || _.size(allData)),
  )) / groups.length,
  pairs: groups.map(
    ({ allData, newData }) => ({ allRank: allData[language] || '🚫', newRank: newData[language] || '🚫' }),
  ),
  isAnywhereOnTop: _.flatten(groups.map(Object.values)).some(data => data[language] <= 20),
});

const bold = word => `**${word}**`;

const results = languages.map(getCoefficient);
const sortedResults = _.sortBy(results, ({ value }) => value);
const mostGrowing = sortedResults.slice(0, 40);
const mostFailing = sortedResults.slice(-40).reverse();
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

console.log('\n\n## Most growing languages in 2018-2019\n');
console.log(resultsToMarkdown(mostGrowing));
console.log('\n\n## Most failing languages in 2018-2019\n');
console.log(resultsToMarkdown(mostFailing));
