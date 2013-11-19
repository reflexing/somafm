VERSION=1.0
SOURCES=script.spec main.js parsexml.js icon.png
TEMP_DIR_NAME=somafm

all: $(SOURCES)
	mkdir -p $(TEMP_DIR_NAME)
	cp $(SOURCES) $(TEMP_DIR_NAME)
	tar -cjf somafm_$(VERSION).amarokscript.tar.bz2 $(TEMP_DIR_NAME)
	rm -r $(TEMP_DIR_NAME)