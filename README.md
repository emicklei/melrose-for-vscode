# melrose-for-vscode

This plugin is used to edit musical expressions for the [melrōse](http://github.com/emicklei/melrose) music programming tool.
Musical statements can be created with `.mel` or `.melrose` files.
Each statements can be evaluated directly with the connected `melrōse` tool, which needs to be started separately, typically in a Terminal Window.
A statement is evaluated by using the shortcut `cmd+E` and takes the content of the active line (where the cursor is), or the content of the selected text in the editor.

## Features

- direct evaluation of `melrōse` expressions using `cmd+E`
- direct play of `melrose` expressions using `cmd+3`
- loop begin `cmd+4` and loop end `cmd+5`
- stop looping and playing `cmd+k`
- inspect musial object `cmd+2`
- syntax highlighting
- visual feedback of the success of evaluation
    - flash green means OK
    - flash blue means PLAY
    - flash red means ERROR

## Requirements

This plugin requires the `melrōse` tool which needs to be [installed](https://emicklei.github.io/melrose/) and run separately in a Terminal Window.

## Known Issues

- Any known issues or requests are listed in the [issue tracker](https://github.com/emicklei/melrose-for-vscode/issues)

## Release Notes

See (CHANGELOG](https://github.com/emicklei/melrose-for-vscode/blob/master/CHANGELOG.md)


Software is licensed under [Apache 2.0 license](LICENSE).
(c) 2019-2020 [ernestmicklei.com](http://ernestmicklei.com)