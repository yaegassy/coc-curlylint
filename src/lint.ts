import {
  DiagnosticCollection,
  DiagnosticSeverity,
  languages,
  Position,
  Range,
  TextDocument,
  workspace,
  OutputChannel,
  Uri,
  Diagnostic,
} from 'coc.nvim';

import cp from 'child_process';

import { SUPPORT_LANGUAGES } from './constant';

interface CurlylintDiagnostics {
  file_path: string;
  line: number;
  column: number;
  message: string;
  code: string; // parse_error | ???
}

export class LintEngine {
  private collection: DiagnosticCollection;
  private cmdPath: string;
  private outputChannel: OutputChannel;

  constructor(cmdPath: string, outputChannel: OutputChannel) {
    this.collection = languages.createDiagnosticCollection('curlylint');
    this.cmdPath = cmdPath;
    this.outputChannel = outputChannel;
  }

  public async lint(textDocument: TextDocument): Promise<void> {
    // Guard: Disable linting for unsupported languageId
    if (!SUPPORT_LANGUAGES.includes(textDocument.languageId)) return;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const filePath = Uri.parse(textDocument.uri).fsPath;
    const args: string[] = [];
    const cwd = Uri.file(workspace.root).fsPath;
    // Use shell
    const opts = { cwd, shell: true };

    const extensionConfig = workspace.getConfiguration('curlylint');
    const configPath = extensionConfig.get('configPath', '');

    args.push('--quiet');
    args.push('--format', 'json');

    if (configPath) {
      args.push('--config', configPath);
    }

    args.push('-');
    args.push('--stdin-filepath');
    args.push(filePath);

    this.outputChannel.appendLine(`${'#'.repeat(10)} curlylint\n`);
    this.outputChannel.appendLine(`Cwd: ${opts.cwd}`);
    this.outputChannel.appendLine(`Run: ${self.cmdPath} ${args.join(' ')} ${filePath}`);
    this.outputChannel.appendLine(`Args: ${args.join(' ')}`);

    this.collection.clear();

    return new Promise(function (resolve) {
      const cps = cp.spawn(self.cmdPath, args, opts);
      cps.stdin.write(textDocument.getText());
      cps.stdin.end();

      let buffer = '';
      const onDataEvent = (data: Buffer) => {
        buffer += data.toString();
      };

      let curlylintDiagnostics: CurlylintDiagnostics[];
      const onEndEvent = () => {
        self.outputChannel.appendLine(`Res: ${buffer}`);
        try {
          curlylintDiagnostics = JSON.parse(buffer);
        } catch (error) {
          self.outputChannel.appendLine(`Failed: JSON.parse failure`);
          return;
        }

        const diagnostics: Diagnostic[] = [];

        if (curlylintDiagnostics && curlylintDiagnostics.length > 0) {
          for (const c of curlylintDiagnostics) {
            // position is "real line" - 1
            const startPosition = Position.create(c.line - 1, c.column - 1);
            const endPosition = Position.create(c.line - 1, c.column - 1);

            diagnostics.push({
              range: Range.create(startPosition, endPosition),
              message: c.message,
              severity: DiagnosticSeverity.Error,
              source: 'curlylint',
              relatedInformation: [],
            });
          }

          self.collection.set(textDocument.uri, diagnostics);
        }
        resolve();
      };

      // If there is an stderr
      cps.stderr.on('data', (error) => {
        self.outputChannel.appendLine(`---- STDERR ----`);
        self.outputChannel.appendLine(`${error}`);
        self.outputChannel.appendLine(`---- /STDERR ----`);
      });

      cps.stdout.on('data', onDataEvent);
      cps.stdout.on('end', onEndEvent);

      resolve();
    });
  }
}
