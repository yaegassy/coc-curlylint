import { ExtensionContext, window } from 'coc.nvim';

import path from 'path';

import rimraf from 'rimraf';
import child_process from 'child_process';
import util from 'util';

import { CURLYLINT_VERSION } from './constant';

const exec = util.promisify(child_process.exec);

export async function curlylintInstall(pythonCommand: string, context: ExtensionContext): Promise<void> {
  const pathVenv = path.join(context.storagePath, 'curlylint', 'venv');

  let pathVenvPython = path.join(context.storagePath, 'curlylint', 'venv', 'bin', 'python');
  if (process.platform === 'win32') {
    pathVenvPython = path.join(context.storagePath, 'curlylint', 'venv', 'Scripts', 'python');
  }

  const statusItem = window.createStatusBarItem(0, { progress: true });
  statusItem.text = `Install curlylint...`;
  statusItem.show();

  const installCmd =
    `${pythonCommand} -m venv ${pathVenv} && ` +
    `${pathVenvPython} -m pip install -U pip curlylint==${CURLYLINT_VERSION}`;

  rimraf.sync(pathVenv);
  try {
    window.showMessage(`Install curlylint...`);
    await exec(installCmd);
    statusItem.hide();
    window.showMessage(`curlylint: installed!`);
  } catch (error) {
    statusItem.hide();
    window.showErrorMessage(`curlylint: install failed. | ${error}`);
    throw new Error();
  }
}
