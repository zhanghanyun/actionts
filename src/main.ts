import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { wait } from './wait'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`)
    core.info('test running')
    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.info(await getStdout("docker",["version"]))

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function getStdout(
  exe: string,
  args: string[],
  options?: {}
): Promise<string> {
  let stdout = "";
  const resOptions = Object.assign({}, options, {
    listeners: {
      stdout: (buffer: Buffer): void => {
        stdout += buffer.toString();
      },
    },
  });

  await exec.exec(exe, args, resOptions);

  return stdout;
}

run()
