import * as assert from 'assert';
import * as vscode from 'vscode';

import * as path from 'path';
import * as fs from 'fs';
import { createTestFile, testPath } from '../../createTestFile';

suite('createTestFile', function() {
	const rootWorkspacePath = (vscode.workspace.workspaceFolders || [])[0]?.uri?.path;
	if (!rootWorkspacePath) {
		throw new Error('no workspace folder set for integration tests');
	}

	test('performs a file name replacement that retains the file extension', async () => {
		const config = vscode.workspace.getConfiguration(
			'createTestFile',
		);
		await config.update('nameTemplate', 'test_{filename}{extension}');

		const filePath = path.join(rootWorkspacePath, 'src/example.py');
		const testFilePath = (await createTestFile(vscode.Uri.file(filePath))).path;
		assert.equal(path.join(rootWorkspacePath, 'src/test_example.py'), testFilePath);
		assert.ok(fs.existsSync(testFilePath));
	});

	test('creates the appropriate folder and performs the file name replacement', async () => {
		const config = vscode.workspace.getConfiguration(
			'createTestFile',
		);
		await config.update('nameTemplate', 'test_{filename}{extension}');
		await config.update('pathMaps', [
			{
				"pathPattern": "src(/.*)?",
				"testFilePath": "tests/$1"
			},
		]);

		const filePath = path.join(rootWorkspacePath, 'src/example.py');
		const testFilePath = (await createTestFile(vscode.Uri.file(filePath))).path;
		assert.equal(path.join(rootWorkspacePath, 'tests/test_example.py'), testFilePath);
		assert.ok(fs.existsSync(testFilePath));
	});

	test('uses language-specific nameTemplate rather than default template', async () => {
		const config = vscode.workspace.getConfiguration(
			'createTestFile',
		);
		await config.update('nameTemplate', 'test_{filename}{extension}');
		await config.update('languages', {
			"[shellscript]": {
				"createTestFile.nameTemplate": "{filename}.test"
			}
		});
		await config.update('pathMaps', [
			{
				"pathPattern": "src(/.*)?",
				"testFilePath": "test/$1"
			},
		]);

		const filePath = path.join(rootWorkspacePath, 'src/lib/example.sh');
		const testFilePath = (await createTestFile(vscode.Uri.file(filePath))).path;
		assert.equal(path.join(rootWorkspacePath, 'test/lib/example.test'), testFilePath);
		assert.ok(fs.existsSync(testFilePath));
	});
})

suite('testPath', function() {
    test('creates test file from windows path in same folder', function() {
        const srcPath = '/c:/Users/bob/code/app/foo.rb';
        const nameTemplate = '{filename}_spec{extension}';

        const expected = '/c:/Users/bob/code/app/foo_spec.rb';
        assert.equal(expected, testPath(srcPath, nameTemplate));
    });

    test('updates test file extension when override is provided', function() {
        const srcPath = '/home/alice/projects/elixir-app/lib/auth.ex';
        const nameTemplate = '{filename}_test.exs';

        const expected = '/home/alice/projects/elixir-app/lib/auth_test.exs';
        assert.equal(expected, testPath(srcPath, nameTemplate));
    });

    test('remaps windows path if mapping argument provided', function() {
        const srcPath = '/c:/Users/bob/code/app/Foo.cs';
        const nameTemplate = 'Test{filename}{extension}';
        const pathMapper = { pathPattern: 'app(/?.*)', testFilePath: 'spec$1' };

        const expected = '/c:/Users/bob/code/spec/TestFoo.cs';
        assert.equal(expected, testPath(srcPath, nameTemplate, pathMapper));
    });
});
