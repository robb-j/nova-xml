## (next)

- Added `Restart Server` command

## Version 0.3.0

- Tree sitter support! Added support for `<tree-sitter>` syntax in `https://www.nova.app/syntax` xml files.
- Update the language server from `0.21.0` to `0.24.0`, see it's [GitHub releases](https://github.com/redhat-developer/vscode-xml/releases) for info
- Build tooling updates
- Specify custom catalog files per-workspace, thanks [@greystate](https://github.com/greystate)!

## Version 0.2.1

Update the language server from `0.18.0` to `0.21.0`, see it's [GitHub releases](https://github.com/redhat-developer/vscode-xml/releases) for info

> [0.18.1](https://github.com/redhat-developer/vscode-xml/releases/tag/0.18.1),
> [0.18.2](https://github.com/redhat-developer/vscode-xml/releases/tag/0.18.2),
> [0.18.3](https://github.com/redhat-developer/vscode-xml/releases/tag/0.18.3),
> [0.19.0](https://github.com/redhat-developer/vscode-xml/releases/tag/0.19.0),
> [0.19.1](https://github.com/redhat-developer/vscode-xml/releases/tag/0.19.1),
> [0.20.0](https://github.com/redhat-developer/vscode-xml/releases/tag/0.20.0),
> [0.21.0](https://github.com/redhat-developer/vscode-xml/releases/tag/0.21.0)

All compiled code is now Open Source, if you fancy diving in to see what Yaml Extension is up to, [you can](https://github.com/robb-j/nova-xml/tree/main/XML.novaextension/Scripts)

## Version 0.2

Nova Syntax definitions improvements

- Add support for `<subsyntax>` definitions
- Allow `subsyntax=true` on `<syntax>` elements
- Allow empty `<subscopes />`
- Fix detectors so sub-elements can be re-used

Thanks to [Martin Kopischke](https://github.com/kopischke) for the `<subsyntax>` [bug report](https://github.com/robb-j/nova-xml/issues/2)

## Version 0.1.1

- Fix the LanguageServer not starting up correctly

## Version 0.1

- Everything is new
