ls *.jpg | sort --version-sort |
 gawk 'BEGIN{ a=0 }{ printf "mv %s %02d.jpg\n", $0, a++ }' | # build mv command
 bash # run that command
rename 's/^100/a/' *.jpg
rename 's/^0/a/' *.jpg
rename 's/^1/b/' *.jpg
rename 's/^2/c/' *.jpg
rename 's/^3/d/' *.jpg
rename 's/^4/e/' *.jpg
rename 's/^5/f/' *.jpg
rename 's/^6/g/' *.jpg
rename 's/^7/h/' *.jpg
rename 's/^8/i/' *.jpg
rename 's/^9/j/' *.jpg
rename 's/^b00/a0/' *.jpg
