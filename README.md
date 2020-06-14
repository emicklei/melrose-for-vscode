# melrose-for-vscode README

This plugin is used to edit musical expressions for the [melrōse](http://github.com/emicklei/melrose) music programming tool.
Musical statements can be created with `.mel` or `.melrose` fiels.
Each statements can be evaluated directly with the connected `melrōse` tool, which needs to be started separately.
A statement is evaluated by using the shortcut `cmd+E` and takes the content of the active line (where the cursor is), or the content of the selected text in the editor.

## Features

- direct evaluation of `melrōse` expressions using `cmd+E`
- direct play of `melrose` expressions using `cmd+3`
- loop begin `cmd+4` and loop end `cmd+5`
- stop looping and playing `cmd+k`
- inpsect musial object `cmd+2`
- syntax highlighting
- visual feedback of the success of evaluation
    - flash green means OK
    - flash blue means PLAY
    - flash red means ERROR

## Requirements

This plugin requires the `melrōse` tool which needs to be [installed](https://emicklei.github.io/melrose/) and run separately.

## Known Issues

- Any known issues or requests are listed in the [issue tracker](https://github.com/emicklei/melrose-for-vscode/issues)

## Release Notes

### 1.0.0

Initial release.