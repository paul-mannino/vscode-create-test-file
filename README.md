# Create Test File

Create Test File is an extension for (Visual Studio Code)[https://code.visualstudio.com/] that adds a command for creating test files with names and paths inferred from currently-open source files (or ones selected from the sidebar).

For example, if your source code lives under the `app` folder in your workspace and your test code lives under the `spec` folder, you can define rules such that for any source file, e.g., `app/foo/bar/filename.rb`, you can create a test file inferred from the name, e.g., `spec/foo/bar/filename_spec.rb`. These settings can be customized for each filetype, and you may create multiple path mappers if you have multiple conventions for where you create tests.

## Configuration

Simple configuration example:

```javascript
// If file is named foo.bar, will create test named foo_spec.bar
'createTestFile.nameTemplate': '{filename}_spec',

// Language-specific settings
'createTestFile.languages': {
    // For javascript, if file is foo.js, will create foo.test.js
    '[javascript]': {
        'createTestFile.nameTemplate': '{filename}.test'
    }
},

// Defines rule such that any file under app/ will have a test file created
// under spec/ Rules will be applied in the order they are defined. The first
// rule to match the file path will be used.
'createTestFile.pathMaps': [
    {
        // Regex file path matcher and resulting test file path. $1, $2, etc.
        // will be replaced with the matching text from the pathPattern
        pathPattern: 'app(/.*)?',
        testFilePath: 'spec$1'
    },
    {
        // Example configuration for Jest tests
        pathPattern: '(.*)',
        testFilePath: '$1/__tests__/'
    }
]
```

## Command

To create a test file, run `Create Test File` from the command pallet, or select it from the right-click menu on the selected file in the sidebar.
