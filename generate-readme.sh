#!/usr/local/bin/bash
set -e

today=`date +'%B %d, %Y'`
if [ `uname` == 'Darwin' ];
then
  minusOneYear=`date -v -365d +'%Y-%m-%d'`
  minusOneYearFormatted=`date -v -365d +'%B %d, %Y'`
else
  minusOneYear=`date -d "$date -365 days" +'%Y-%m-%d'`
  minusOneYearFormatted=`date -d "$date -365 days" +'%B %d, %Y'`
fi
echo today=$today
echo minusOneYear=$minusOneYear
echo minusOneYearFormatted=$minusOneYearFormatted

cat<<EOF > README.md
# Most popular languages on GitHub

## Table of Contents
1. [Most popular languages on GitHub as of $today](#all)
1. [Most popular languages on GitHub as of $today, counting only repos with at least 10 stars](#10-stars)
1. [Most popular languages on GitHub as of $today, counting only repos with at least 100 stars](#100-stars)
1. [Most popular languages on GitHub as of $today, counting only repos with at least 1000 stars](#1000-stars)
1. [Most popular languages on GitHub as of $today, counting only repos with at least 10000 stars](#10000-stars)
1. [Most popular languages on GitHub as of $today, counting only repos with any commits pushed since $minusOneYearFormatted](#all-active)
1. [Most popular languages on GitHub as of $today, counting only repos with at least 10 stars and any commits pushed since $minusOneYearFormatted](#10-stars-active)
1. [Most popular languages on GitHub as of $today, counting only repos with at least 100 stars and any commits pushed since $minusOneYearFormatted](#100-stars-active)
1. [Most popular languages on GitHub as of $today, counting only repos with at least 1000 stars and any commits pushed since $minusOneYearFormatted](#1000-stars-active)
1. [Most popular languages on GitHub as of $today, counting only repos with at least 10000 stars and any commits pushed since $minusOneYearFormatted](#10000-stars-active)
1. [Most starred GitHub repositories by language as of $today](#top-repos-by-language)
1. [Most growing languages (comparing the number of repos with new commits to the total number of repos)](#most-growing)
1. [Most failing languages (comparing the number of repos with new commits to the total number of repos)](#most-failing)
EOF


cat<<EOF >> README.md
## Most popular languages on GitHub as of $today
<a name="all" />

EOF
./search-languages.js >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with at least 10 stars
<a name="10-stars" />

EOF
./search-languages.js --stars 10 >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with at least 100 stars
<a name="100-stars" />

EOF
./search-languages.js --stars 100 >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with at least 1000 stars
<a name="1000-stars" />

EOF
./search-languages.js --stars 1000 >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with at least 10000 stars
<a name="10000-stars" />

EOF
./search-languages.js --stars 10000 >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with any commits pushed since $minusOneYearFormatted
<a name="all-active" />

EOF
./search-languages.js --pushed $minusOneYear >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with at least 10 stars and any commits pushed since $minusOneYearFormatted
<a name="10-stars-active" />

EOF
./search-languages.js --stars 10 --pushed $minusOneYear >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with at least 100 stars and any commits pushed since $minusOneYearFormatted
<a name="100-stars-active" />

EOF
./search-languages.js --stars 100 --pushed $minusOneYear >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with at least 1000 stars and any commits pushed since $minusOneYearFormatted
<a name="1000-stars-active" />

EOF
./search-languages.js --stars 1000 --pushed $minusOneYear >> README.md

cat<<EOF >> README.md
## Most popular languages on GitHub as of $today, counting only repos with at least 10000 stars and any commits pushed since $minusOneYearFormatted
<a name="10000-stars-active" />

EOF
./search-languages.js --stars 10000 --pushed $minusOneYear >> README.md

cat<<EOF >> README.md
## Most starred GitHub repositories by language as of $today
<a name="top-repos-by-language" />

EOF
./search-repos-by-languages.js --files="0-pushed-after-1970-01-01.json,0-pushed-after-$minusOneYear.json,10-pushed-after-1970-01-01.json,10-pushed-after-$minusOneYear.json,100-pushed-after-1970-01-01.json,100-pushed-after-$minusOneYear.json,1000-pushed-after-1970-01-01.json,1000-pushed-after-$minusOneYear.json,10000-pushed-after-1970-01-01.json,10000-pushed-after-$minusOneYear.json" >> README.md

./find-growing-and-failing.js --files="0-pushed-after-1970-01-01.json,0-pushed-after-$minusOneYear.json,10-pushed-after-1970-01-01.json,10-pushed-after-$minusOneYear.json,100-pushed-after-1970-01-01.json,100-pushed-after-$minusOneYear.json,1000-pushed-after-1970-01-01.json,1000-pushed-after-$minusOneYear.json,10000-pushed-after-1970-01-01.json,10000-pushed-after-$minusOneYear.json" >> README.md
