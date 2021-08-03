**XML Extension** provides a deeper integration with **XML** through the use of schemas, XML validation, code completion, linting and optional document formatting. XML Extension also provides a schema for Nova's own [Syntax definitions](https://docs.nova.app/syntax-reference/).

<img src="https://raw.githubusercontent.com/robb-j/nova-xml/main/XML.novaextension/Images/extension/linting.png" width="800" alt="XML Extension adds XML schema support to Nova">

## Work in Progress

This version of XML is a prerelease and not all functionality exists yet.
Things that are still to be done are on
[GitHub Issues](https://github.com/robb-j/nova-xml/issues/1).

## Requirements

XML Extension runs the [eclipse/lemminx](https://github.com/eclipse/lemminx) XML language server as a native binary
and has no external requirements.

## Entitlements

XML Extension uses these entitlements for these purposes:

- `process` is to run the Language Server itself
- `network` is to download schemas and cache them to `~/.lemmix`
- `filesystem` is to read in XML files, write formatted files and cache schemas

## Usage

XML Extension runs any time you open a local project with XML files in it, automatically lints all open files, then reports errors and warnings in Nova's **Issues** sidebar and the editor gutter:

<img src="https://raw.githubusercontent.com/robb-j/nova-xml/main/XML.novaextension/Images/extension/linting.png" width="800" alt="XML Extension adds XML schema support to Nova">

XML Extension intelligently suggests completions for you as you write, based on the current documents [associated schema](#associating-schemas).

<img src="https://raw.githubusercontent.com/robb-j/nova-xml/main/XML.novaextension/Images/extension/completions.png" width="800" alt="See completion options as you write">

XML Extension displays relevant documentation when you hover over symbols:

<img src="https://raw.githubusercontent.com/robb-j/nova-xml/main/XML.novaextension/Images/extension/hovers.png" width="800" alt="Get tooltips when writting XML files">

### Configuration

To configure global preferences, open **Extensions → Extension Library...** then select XML's **Preferences** tab.

<!-- You can also configure preferences on a per-project basis in **Project → Project Settings...** -->

### Associating Schemas

There are two schema languages for XML, [DTD](https://www.w3schools.com/xml/xml_dtd_intro.asp)
and [XSD](https://www.w3schools.com/xml/schema_intro.asp). DTD files are simpler and shorter to write whereas XSD schemas are more verbose but provide greater functionality.

Schemas can be loaded relative to the XML file in question.

**Nova Syntax Definitions**

XML Extension uses a schema catalog to automatically register a schema for Nova [Syntax definitions](https://docs.nova.app/syntax-reference/).
You can opt into it like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<syntax name="javascript" xmlns="https://www.nova.app/syntax">
  <!-- ... -->
</syntax>
```

### Writing Schemas

W3 Schools has good tutorials for creating both [DTD](https://www.w3schools.com/xml/xml_dtd_intro.asp)
and [XSD](https://www.w3schools.com/xml/schema_intro.asp) schemas.
