import { ExtensionContext, window } from 'coc.nvim';

import path from 'path';

import rimraf from 'rimraf';
import child_process from 'child_process';
import util from 'util';

import { CURLYLINT_VERSION } from './constant';

const exec = util.promisify(child_process.exec);

export async function curlylintInstall(context: ExtensionContext): Promise<void> {
  const pathVenv = path.join(context.storagePath, 'curlylint', 'venv');
  const pathPip = path.join(pathVenv, 'bin', 'pip');

  const statusItem = window.createStatusBarItem(0, { progress: true });
  statusItem.text = `Install curlylint...`;
  statusItem.show();

  const installCmd = `python3 -m venv ${pathVenv} && ` + `${pathPip} install -U pip curlylint==${CURLYLINT_VERSION}`;

  rimraf.sync(pathVenv);
  try {
    window.showWarningMessage(`Install curlylint...`);
    await exec(installCmd);
    statusItem.hide();
    window.showWarningMessage(`curlylint: installed!`);
  } catch (error) {
    statusItem.hide();
    window.showErrorMessage(`curlylint: install failed. | ${error}`);
    throw new Error();
  }
}