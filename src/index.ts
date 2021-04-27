import { commands, ExtensionContext, workspace, window } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import which from 'which';

import { curlylintInstall } from './installer';
import { LintEngine } from './lint';

export async function activate(context: ExtensionContext): Promise<void> {
  const { subscriptions } = context;
  const extensionConfig = workspace.getConfiguration('curlylint');
  const isEnable = extensionConfig.enable;
  if (!isEnable) return;

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath);
  }

  const outputChannel = window.createOutputChannel('curlylint');

  subscriptions.push(
    commands.registerCommand('curlylint.install', async () => {
      await installWrapper(context);
    })
  );

  // MEMO: Priority to detect curlylint
  //
  // 1. curlylint.commandPath setting
  // 2. PATH environment (e.g. system global PATH or venv/bin, etc ...)
  // 3. extension venv (buit-in)
  let curlylintPath = extensionConfig.get('commandPath', '');
  if (!curlylintPath) {
    const whichCurlylint = whichCmd('curlylint');
    if (whichCurlylint) {
      curlylintPath = whichCurlylint;
    } else if (fs.existsSync(path.join(context.storagePath, 'curlylint', 'venv', 'bin', 'curlylint'))) {
      curlylintPath = path.join(context.storagePath, 'curlylint', 'venv', 'bin', 'curlylint');
    }
  }

  // Install "curlylint" if it does not exist.
  if (!curlylintPath) {
    await installWrapper(context);
    if (fs.existsSync(path.join(context.storagePath, 'curlylint', 'venv', 'bin', 'curlylint'))) {
      curlylintPath = path.join(context.storagePath, 'curlylint', 'venv', 'bin', 'curlylint');
    }
  }

  // If "curlylint" does not exist completely, terminate the process.
  // ----
  // If you cancel the installation.
  if (!curlylintPath) {
    setTimeout(() => {
      window.showErrorMessage('Exit, because "curlylint" does not exist.');
    }, 500);
    return;
  }

  const engine = new LintEngine(curlylintPath, outputChannel);

  const onOpen = extensionConfig.get<boolean>('lintOnOpen');
  if (onOpen) {
    workspace.documents.map(async (doc) => {
      await engine.lint(doc.textDocument);
    });

    workspace.onDidOpenTextDocument(
      async (e) => {
        await engine.lint(e);
      },
      null,
      subscriptions
    );
  }

  const onChange = extensionConfig.get<boolean>('lintOnChange');
  if (onChange) {
    workspace.onDidChangeTextDocument(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async (_e) => {
        const doc = await workspace.document;
        await engine.lint(doc.textDocument);
      },
      null,
      subscriptions
    );
  }

  const onSave = extensionConfig.get<boolean>('lintOnSave');
  if (onSave) {
    workspace.onDidSaveTextDocument(
      async (e) => {
        await engine.lint(e);
      },
      null,
      subscriptions
    );
  }
}

async function installWrapper(context: ExtensionContext) {
  const msg = 'Install/Upgrade "curlylint"?';
  context.workspaceState;

  let ret = 0;
  ret = await window.showQuickpick(['Yes', 'Cancel'], msg);
  if (ret === 0) {
    try {
      await curlylintInstall(context);
    } catch (e) {
      return;
    }
  } else {
    return;
  }
}

function whichCmd(cmd: string): string {
  try {
    return which.sync(cmd);
  } catch (error) {
    return '';
  }
}
