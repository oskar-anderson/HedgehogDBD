# RasterModeler
Open source text based ERD schema drawing tool with scripting support.

[🔥 Live 🔥](https://oskar-anderson.github.io/RasterModeler/pages/draw.html)
  

## About:
Webapp for ERD schema creation. Uses PixiJS library to allow text based schema format that can be exported to HTML and Markdown code blocks. Allows creation and execution of user scripts over schema data.

## Quick start:

### Local installation:
1. `npm run build`
2. `python pyServer.py`
3. Visit http://127.0.0.1:1337/webapp/pages/draw.html

### Todo:
* Script tagging and filtering
* Add hidden semantic description field on table row fields to allow better documentation generation. Saving has to be reworked to include extra values on top of the schema
* More scripts (documentation, code generation, ORM)
* Change Scene folder name to lowercase scene without breaking webpack. Commit 88 💩