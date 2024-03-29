# melrose-for-vscode

This plugin is used to edit musical expressions for the [melrōse](http://github.com/emicklei/melrose) music programming tool.
Musical statements can be created with `.mel` or `.melrose` files.
Each statement can be evaluated directly with the connected `melrōse` tool, which needs to be started separately, typically in a Terminal Window.
A statement is evaluated by using the shortcut `cmd+e` and takes the content of the active line (where the cursor is), or the content of the selected text in the editor.

## Features

- `cmd+2` = inspect musial object
- `cmd+3` = direct play of `melrose` expressions,loop,listen or recording
- `cmd+5` = stop 
- `cmd+e` = only evaluate one or more `melrōse` expressions
- `cmd+k` = stop all
- syntax highlighting
- hover support for
    - variable
    - function
- visual feedback of the success of evaluation
    - flash green means OK
    - flash blue means PLAY
    - flash red means ERROR

## Working with melrōse

![screenshot.png](https://raw.githubusercontent.com/emicklei/melrose/master/docs/images/riboluta-melrose.png)


## Requirements

This plugin requires the `melrōse` tool which needs to be [installed](http://github.com/emicklei/melrose) and run separately in a Terminal Window.

## Known Issues

- Any known issues or requests are listed in the [issue tracker](https://github.com/emicklei/melrose-for-vscode/issues)

## Release Notes

See [CHANGELOG](https://github.com/emicklei/melrose-for-vscode/blob/master/CHANGELOG.md)


Software is licensed under [MIT](LICENSE).

&copy; 2019-2021 [ernestmicklei.com](http://ernestmicklei.com)