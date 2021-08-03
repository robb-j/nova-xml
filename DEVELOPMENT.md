# Development

**Links**

- https://github.com/eclipse/lemminx
- https://github.com/redhat-developer/vscode-xml
- https://github.com/redhat-developer/vscode-xml/blob/master/docs/Validation.md#xml-catalog-with-xsd
- https://www.w3schools.com/xml/schema_elements_ref.asp
- https://docs.nova.app/syntax-reference/

**Notes**

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
