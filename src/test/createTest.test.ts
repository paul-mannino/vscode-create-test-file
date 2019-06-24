import * as assert from 'assert';
import { testPath } from '../createTest';

suite('testPath', function() {
    test('creates test file from windows path in same folder', function() {
        let srcPath = '/c:/Users/bob/code/app/foo.rb';
        let nameTemplate = '{filename}_spec';

        let expected = '/c:/Users/bob/code/app/foo_spec.rb';
        assert.equal(expected, testPath(srcPath, nameTemplate));
    });

    test('remaps windows path if mapping argument provided', function() {
        let srcPath = '/c:/Users/bob/code/app/Foo.cs';
        let nameTemplate = 'Test{filename}';
        let pathMapper = (srcPath: string): string => srcPath.replace('/app', '/spec');

        let expected = '/c:/Users/bob/code/spec/TestFoo.cs';
        assert.equal(expected, testPath(srcPath, nameTemplate, pathMapper));
    });
});