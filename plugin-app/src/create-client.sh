#!/bin/bash

# This creates the hangut plugin from the index.html in this directory
# and the header/footer xml data in the parent directory (which never
# changes).

# To deploy after editing the application, run this script and point
# the hangout API to the generated `plugin.xml` file.

cat ../header.xml index.html ../footer.xml > ../plugin.xml
