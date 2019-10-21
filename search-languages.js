#!/usr/bin/env node

const request = require('superagent');
const _ = require('lodash');
const bluebird = require('bluebird');
const { chunks } = require('chunk-array');
const jsonToMarkdown = require('json-to-markdown');
const commander = require('commander');
const fs = require('fs');
const packageInfo = require('./package');
const languages = require('./languages');

const token = process.env.GITHUB_TOKEN;

commander
  .version(packageInfo.version)
  .option('-s, --stars [type]', 'Minimum stars number', 0)
  .option('-p, --pushed [type]', 'Maximum date of the last pushed commit', '1970-01-01')
  .parse(process.argv);


const retrieve = language => request('https://api.github.com/search/repositories')
  .query({
    // eslint-disable-next-line max-len
    q: `stars:>=${commander.stars} pushed:>=${commander.pushed} language:${JSON.stringify(language)}`,
  })
  .set('Authorization', `token ${token}`)
  .then(({ body }) => body.total_count);

const retrieveGroup = async (group) => {
  try {
    return _.zipObject(
      group,
      await Promise.all(group.map(language => retrieve(language))),
    );
  } catch (error) {
    console.error(error);
    await bluebird.delay(20000);
    return retrieveGroup(group);
  }
};

const findRepos = async () => {
  const groups = chunks(languages, 5);
  const results = [];
  for (const [i, group] of Object.entries(groups)) {
    const result = await retrieveGroup(group);
    console.warn(JSON.stringify({ stars: commander.stars, pushed: commander.pushed, ...result }));
    results.push(result);
    console.warn(`${i} / ${groups.length} groups processed`);
  }
  const unifiedResults = Object.assign(...results);
  fs.writeFileSync(`${commander.stars}-pushed-after-${commander.pushed}.json`, JSON.stringify(unifiedResults));
  const sortedAndFilteredResults = _.sortBy(
    Object.entries(unifiedResults)
      .filter(([, value]) => value > 0),
    ([, value]) => -value,
  )
    .slice(0, 100);
  console.log(jsonToMarkdown(
    sortedAndFilteredResults.map(([k, v], i) => ({ '#': i + 1, language: k, 'repos count': v })),
    ['#', 'language', 'repos count'],
  ));
};

findRepos();
