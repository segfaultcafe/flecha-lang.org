---
title: "Editor and language-server installation"
description: "Install Flecha 0.3.2, flecha-lsp 0.1.0, the Visual Studio Code extension, or the Neovim runtime plugin for live compiler diagnostics."
editUrl: https://github.com/segfaultcafe/flecha/edit/master/docs/editors.md
---
Flecha releases provide a ready-to-install Visual Studio Code extension and a
Neovim runtime plugin. Both provide syntax highlighting, filetype detection,
comments, brackets, and indentation support. The separate `flecha-lsp` process
connects editors to the compiler for live syntax and semantic diagnostics,
including diagnostics for unsaved buffers.

Both editors render the `!` in a crashable declaration or call, such as
`load!()`, in orange. Logical negation such as `!ready` keeps the ordinary
operator style. The terminal `crash(...)` builtin is blue to distinguish it
from ordinary function calls.

## Install the language server

The server has two parts. [`flecha-lsp` v0.1.0](https://github.com/segfaultcafe/flecha-lsp/releases/tag/v0.1.0)
speaks the standard Language Server Protocol to the editor. Flecha 0.3.2 runs
the compiler-side analyzer through `flecha analyze --stdio`. Install both
releases; Flecha 0.3.1 and earlier do not provide the required analyzer.

Download the archive for your platform from the `flecha-lsp` release, verify it
against that release's `SHA256SUMS`, extract it, and place its `bin` directory
on the `PATH` inherited by the editor. Keep the Flecha 0.3.2 `bin` directory on
the same `PATH`:

```sh
flecha --version
command -v flecha-lsp
```

`flecha analyze --stdio` and `flecha-lsp` are protocol processes. When started
by hand, they wait for framed input instead of showing an interactive prompt.
Use Ctrl-C to stop a manual probe.

The server reads `target/package-graph.json` when the editor opens a Longbow
project. Run `longbow build` once after adding or changing dependencies so
diagnostics resolve the same package graph as a project build.

## Visual Studio Code

Download `flecha-language-VERSION.vsix` and `SHA256SUMS` from the matching
[Flecha GitHub Release](https://github.com/segfaultcafe/flecha/releases/tag/v0.3.2). Verify the
download against `SHA256SUMS`, then install it on Linux, macOS, or Windows:

```sh
sha256sum -c SHA256SUMS --ignore-missing
code --install-extension flecha-language-VERSION.vsix
```

On macOS, use `shasum -a 256 flecha-language-VERSION.vsix`; on Windows, use
`Get-FileHash flecha-language-VERSION.vsix -Algorithm SHA256` and compare the
reported value with `SHA256SUMS`.

The command replaces an older version of the same extension. Restart open
Flecha editor windows after an upgrade. Confirm the installed version with:

```sh
code --list-extensions --show-versions
```

The expected identifier is `flecha.flecha-language`. Remove it with:

```sh
code --uninstall-extension flecha.flecha-language
```

When `code` is not on `PATH`, open the Extensions view, choose **Views and More
Actions**, select **Install from VSIX**, and select the downloaded file.

The extension starts `flecha-lsp` from `PATH` and asks it to use `flecha` as
the compiler. To use executables outside `PATH`, set their absolute paths:

```json
{
  "flecha.server.path": "/absolute/path/to/flecha-lsp",
  "flecha.compiler.path": "/absolute/path/to/flecha"
}
```

Run **Flecha: Restart Language Server** after replacing either executable. Set
`flecha.trace.server` to `messages` or `verbose` to inspect the LSP exchange.

### Package a checkout

Install Node.js 22 or newer, then run this from the repository root:

```sh
make package-vscode
```

This uses `npm ci` and the checked-in lockfile to package the extension with the
pinned official `@vscode/vsce` release. It writes
`editors/vscode/flecha-language-VERSION.vsix` and verifies the archive's
identity, version, installation manifest, grammar, and development-file
exclusions. CI performs the same steps, and the release workflow checks that
the extension version matches the release tag before publishing it.

## Neovim

The compiler archives contain the plugin at
`share/flecha/editors/neovim`. On Linux or macOS, install it as a native package:

```sh
destination="${XDG_DATA_HOME:-$HOME/.local/share}/nvim/site/pack/flecha/start/flecha.nvim"
mkdir -p "$(dirname "$destination")"
cp -R /path/to/flecha/share/flecha/editors/neovim "$destination"
```

On Windows, run the equivalent command in PowerShell:

```powershell
$destination = "$env:LOCALAPPDATA\nvim-data\site\pack\flecha\start\flecha.nvim"
New-Item -ItemType Directory -Force (Split-Path $destination) | Out-Null
Copy-Item -Recurse C:\path\to\flecha\share\flecha\editors\neovim $destination
```

Restart Neovim and open a `.fl` file. `:set filetype?` should report
`filetype=flecha`. If needed, enable filetype plugins and indentation in the
Neovim configuration:

```vim
filetype plugin indent on
```

To upgrade, replace the existing `flecha.nvim` directory with the directory
from the new release. To uninstall, remove that `flecha.nvim` directory.

For a development checkout, use a symbolic link instead of copying:

```sh
mkdir -p ~/.local/share/nvim/site/pack/flecha/start
ln -s /path/to/flecha/editors/neovim \
    ~/.local/share/nvim/site/pack/flecha/start/flecha.nvim
```

Run `make test-neovim` from a checkout to exercise filetype detection, syntax
groups, buffer settings, and indentation headlessly.

### Enable diagnostics in Neovim 0.11

Neovim 0.11 provides `vim.lsp.config` and `vim.lsp.enable` in its built-in LSP
client. Add this configuration after installing the runtime plugin and the two
executables:

```lua
vim.lsp.config('flecha_lsp', {
  cmd = { 'flecha-lsp' },
  filetypes = { 'flecha' },
  root_markers = { 'longbow.toml', '.git' },
})

vim.lsp.enable('flecha_lsp')
```

If the executables are not on the editor's `PATH`, configure their absolute
paths instead:

```lua
vim.lsp.config('flecha_lsp', {
  cmd = { '/absolute/path/to/flecha-lsp' },
  cmd_env = {
    FLECHA_COMPILER = '/absolute/path/to/flecha',
  },
  filetypes = { 'flecha' },
  root_markers = { 'longbow.toml', '.git' },
})

vim.lsp.enable('flecha_lsp')
```

Open a `.fl` file inside the project and run `:checkhealth vim.lsp`. The active
client should be named `flecha_lsp`; syntax or semantic errors should appear as
ordinary Neovim diagnostics.

## Current language-server scope

The first release intentionally provides diagnostics and full-document
synchronization. Completion, hover, go-to-definition, references, rename,
formatting, semantic tokens, cancellation, and multi-workspace process pools
remain future work.
