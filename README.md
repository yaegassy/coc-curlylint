# coc-curlylint

[curlylint](https://github.com/thibaudcolas/curlylint) extension for [coc.nvim](https://github.com/neoclide/coc.nvim)

<img width="780" alt="coc-curlylint-capture" src="https://user-images.githubusercontent.com/188642/116176327-f08c1f00-a74c-11eb-8f45-3bc8a46cec7d.png">

[Curlylint](https://www.curlylint.org/) is an HTML linter for "curly braces" templates, and their HTML.

## Install

**CocInstall**:

> TODO

**vim-plug**:

```vim
Plug 'yaegassy/coc-intelephense', {'do': 'yarn install --frozen-lockfile'}
```

## Detect: curlylint

1. `curlylint.commandPath` setting
1. PATH environment (e.g. system global PATH or venv/bin, etc ...)
1. builtin: extension-only "venv/bin" (Installation commands are also provided)

## Bult-in install

coc-curlylint allows you to create an extension-only "venv" and install "curlylint".

The first time you use coc-curlylint, if curlylint is not detected, you will be prompted to do a built-in installation.

You can also run the installation command manually.

```vim
:CocComannd curlylint.install
```

## pyproject.toml

Curlylint is able to read project-specific default values for its command line options, or from a [PEP 518](https://www.python.org/dev/peps/pep-0518/) `pyproject.toml` file.

---

Alternatively, you can set any `pyproject.toml` file in the `curlylint.configPath` configuration.

## Activation Events

- `"onLanguage:htmldjango"`
- `"onLanguage:jinja2"`
- `"onLanguage:twig"`
- `"onLanguage:nunjucks"`

## Configuration options

- `curlylint.enable`: Enable coc-curlylint extension, default: `true`
- `curlylint.commandPath`: The path to the curlylint command (Absolute path), default: `""`
- `curlylint.configPath`: Read configuration from the provided file (Absolute path), default: `""`
- `curlylint.lintOnOpen`: Lint file on opening, default: `true`
- `curlylint.lintOnChange`: Lint file on change, default: `true`
- `curlylint.lintOnSave`: Lint file on save, default: `true`

## Commands

- `curlylint.install`: Install curlylint

## Related coc.nvim extension

- [yaegassy/coc-htmldjango](https://github.com/yaegassy/coc-htmldjango)
- [neoclide/coc-html](https://github.com/neoclide/coc-html)

## Thanks

- [https://github.com/thibaudcolas/curlylint](https://www.curlylint.org/) | [Web](https://www.curlylint.org/docs/rules/tabindex_no_positive)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
