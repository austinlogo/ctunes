#!/bin/bash

for f in *.less;
do
	lessc $f > ../stylesheets/${f%.*}.css
done