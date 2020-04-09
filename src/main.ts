import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { wait } from './wait'

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`)
    core.info("ms = ${ms}")
    //core.debug(new Date().toTimeString())
    //await wait(parseInt(ms, 10))
    //core.debug(new Date().toTimeString())
    //console.log(process.env)

    const OS = process.env.RUNNER_OS
    core.info("OS = ${OS}")

    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY
    core.info("OS = ${GITHUB_REPOSITORY}")

    if (OS == 'windows') {

    }else{

    }

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
