#!/bin/bash

meteor-build-client ../client-bundle -u http://breakout.media.mit.edu -t ../template.html -p breakout.media.mit.edu

cat ../header.xml ../client-bundle/head.html ../footer.xml > ../plugin.xml
