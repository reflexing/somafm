#/bin/sh
amarok --debug > out 2>&1 &
tail -f out | grep SCRIPT