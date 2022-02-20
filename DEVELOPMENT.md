# Development

## Setup

To work on the extension, you will need to have [Node.js](https://nodejs.org/en/) (version 16+)
and [Nova](https://nova.app) installed on your development machine. Then run:

```sh
# cd to/this/folder

# install NPM dependencies
npm install
```

## Regular use

For development, use the `Development` task to build and run the extension locally.
**Build** will compile the TypeScript into JavaScript into the extension folder.
**Run** will do the build, install bundled dependencies and activate the extension in Nova.
Nova will run the extension locally and restart when any file inside the `.novaextension` changes,
i.e. by running the **Build** task.

> Make sure to disable the extension if a published version is already installed.

When in development mode, the extension outputs extra information to the Debug Pane,
which can be shown with **View** → **Show Debug Pane**.

Use the files in the [examples](/examples) folder to test out different features of the language server.

## Code formatting

This repository uses [Prettier](https://prettier.io/),
[yorkie](https://www.npmjs.com/package/yorkie)
and [lint-staged](https://www.npmjs.com/package/lint-staged) to
automatically format code when staging code git commits.

You can manually run the formatter with `npm run format` if you want.

Prettier ignores files using [.prettierignore](/.prettierignore)
or specific lines after a `// prettier-ignore` comment.

## Links

- https://github.com/eclipse/lemminx
- https://github.com/redhat-developer/vscode-xml
- https://github.com/redhat-developer/vscode-xml/blob/master/docs/Validation.md#xml-catalog-with-xsd
- https://www.w3schools.com/xml/schema_elements_ref.asp
- https://docs.nova.app/syntax-reference/

## Notes

Files are cached at `~/.lemminx`

## Release procedure

- Ensure the Language Server is downloaded
- Check the core language definitions are still valid
- Generate new screenshots if needed
- Ensure the `CHANGELOG.md` is up to date
- Run the build
- Bump the version in `extension.json`
- Commit as `X.Y.Z`
- Tag as `vX.Y.Z`
- **Extensions** → **Submit to the Extension Library...**
