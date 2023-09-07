# HedgehogDBD

Open source ERD schema drawing tool with scripting support. Start modeling in your browser [here](https://hedgehog-dbd.vercel.app/) 📐

## About
Webapp for ERD schema creation. Allows for quick visualization of Database model by compact table editing view and automatic relation connections. The app allows users to create JavaScript scripts and execute them based on the schema. Contains built-in scripts and user created scripts shared as comments.

### Main drawing view
Everything needed to visualise database tables. Create/read/update/delete tables, export schema as PNG, JSON import/export, navigate schemas (panning, zooming, minimap). Also supports undo/redo functionality.
![Drawing view](./doc/img/drawing_view.png)


### Scripting editor view
Write executable JavaScript in Monaco Editor (Visual Studio Code) based on schema data. Alternatively use app built-in scripts or user shared scripts from Giscus comments.
![Scripting editor view](./doc/img/scripting_editor_view.png)

Check demo video- https://www.youtube.com/watch?v=Qnqnqw68eeo

## Running Locally

1. Start the app server
```
// check for compiletime type errors, and start localhost server in watch mode
npm run start

// build and run manually
npm run build
npm run preview
```

2. Visit http://localhost:8080

## Todo
* Script tagging and filtering
* Add hidden semantic description field on table row fields to allow better documentation generation. Saving has to be reworked to include extra values on top of the schema
* More scripts (documentation, code generation, ORM)
