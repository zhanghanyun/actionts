import * as exec from "@actions/exec";
import * as core from "@actions/core";
import { wait } from './wait'
import * as path from "path"
import * as md5 from "md5-file"
import * as fs from "fs";

interface Upload {
  release :  release
}

interface release{
  upload_url : string
}

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`)
    core.info(`ms = ${ms}`)
    //core.debug(new Date().toTimeString())
    //await wait(parseInt(ms, 10))
    //core.debug(new Date().toTimeString())
    //console.log(process.env)

    const OS = process.env.RUNNER_OS

    core.info(`OS = ${OS}`)
    //const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY
    //core.info(`GITHUB_REPOSITORY = ${GITHUB_REPOSITORY}`)
    const PKGNAME = path.basename(process.env.GITHUB_REPOSITORY!)
    const RELEASE_TAG = path.basename(process.env.GITHUB_REF!)
    core.info(`GITHUB_EVENT_PATH = ${process.env.GITHUB_EVENT_PATH}`)
    let out, file : string
    let upload : Upload = {release:{upload_url:''}}
    fs.readFile(process.env.GITHUB_EVENT_PATH!,(err,data) => {
      if (err) {
        core.info(`${err}`)
        core.setFailed(err.message)
        return
      }
      //core.info(`data = ` + data.toString())
      let obj = JSON.parse(`${data}`)
      core.info(`obj = ${obj}`)
    })
    //let upload_url : string = upload.release
    //const URL =  JSON.parse(process.env.GITHUB_EVENT_PATH!)
    core.info(`upload = ${upload.release.upload_url}`)
    core.info(`PKGNAME = ${PKGNAME}`)
    core.info(`RELEASE_TAG = ${RELEASE_TAG}`)
    
    if (OS == 'Windows') {
     // const BIN_NAME = `${PKGNAME}.exe`
     // core.info(`BIN_NAME = ${BIN_NAME}`)
     file = `${PKGNAME}-${RELEASE_TAG}-${OS}.zip`
     out = await getStdout("zip",["-v",file,`./target/release/${PKGNAME}.exe`])
    }else{
    //  const BIN_NAME = PKGNAME
     // core.info(`BIN_NAME = ${BIN_NAME}`)
     file = `${PKGNAME}-${RELEASE_TAG}-${OS}.tar.gz`
     out = await getStdout("tar",["cvfz",file,`./target/release/${PKGNAME}`])
    }
    const MD5_SUM = await md5.default(file)
    core.info(`file = ${file}`)
    core.info(`out = ${out}`)
    core.info(`MD5_SUM = ${MD5_SUM}`)
   


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
