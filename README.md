# VSCode Create Test File Extension

This is an extension that adds a command for create a test file with a name and path inferred from a currently
open file (or one selected file from the sidebar).

For example, if your application code lives under the `app` directory in your workspace and your test code lives under
the `spec` folder, you can define rules such that for any file `app/foo/bar/filename.rb`, you will create or open a file
with `spec/foo/bar/filename_spec.rb`. These settings can be customized for each filetype, and you may create multiple
path mappers if you have multiple conventions for where you create tests.

## Configuration

```javascript
// Basic settings
"createTestFile.nameTemplate": "{filename}_spec", // If file is named foo.bar, will create test named foo_spec.bar
"createTestFile.languages": {
    "[javascript]": {
        "createTestFile.nameTemplate": "{filename}.test" // For javascript, if file is foo.js, will create foo.test.js
    }
},
"createTestFile.pathMaps": [
    {
        // Defines rule such that any file under app/ will have a test file created under spec/
        // Rules will be applied in the order they are defined. The first rule to match the file path will be used.
        "pathPattern": "app(/.*)?", // Regex file path matcher
        "testFilePath": "spec$1" // $1, $2, etc. will be replaced with the matching text from the pathPattern
    }
]
```

