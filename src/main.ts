import * as exec from "@actions/exec"
import * as core from "@actions/core"
import * as path from "path"
import * as fs from "fs"
import * as crypto from "crypto"
import * as github from "@actions/github"

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.info(`ms = ${ms}`)

    const OS = process.env.RUNNER_OS
    core.info(`OS = ${OS}`)

    const context = github.context;
    console.log("context = "+ context)


    //const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY
    //core.info(`GITHUB_REPOSITORY = ${GITHUB_REPOSITORY}`)
    const PKGNAME = path.basename(process.env.GITHUB_REPOSITORY!)
    const RELEASE_TAG = path.basename(process.env.GITHUB_REF!)
    core.info(`GITHUB_EVENT_PATH = ${process.env.GITHUB_EVENT_PATH}`)
    let out, file = ''
    //let  upload = JSON.parse(`${data1}`)
    //core.info(`upload123 ${upload}`)
    // let upload : Upload = {release:{upload_url:''}}
    const data = fs.readFileSync(process.env.GITHUB_EVENT_PATH!)
    const MD5_SUM = crypto.createHash('sha256').update(data).digest('hex')
    core.info(`MD5_SUM = ${MD5_SUM}`)
    const UPLOAD_URL = JSON.parse(data.toString()).release.upload_url
    //let upload_url = upload.release.upload_url
    //let upload_url : string = upload.release
    //const URL =  JSON.parse(process.env.GITHUB_EVENT_PATH!)
    core.info(`UPLOAD_URL = ${UPLOAD_URL}`)
    core.info(`PKGNAME = ${PKGNAME}`)
    core.info(`RELEASE_TAG = ${RELEASE_TAG}`)
    


    if (OS == 'Windows') {
      // const BIN_NAME = `${PKGNAME}.exe`
      // core.info(`BIN_NAME = ${BIN_NAME}`)
      file = `${PKGNAME}-${RELEASE_TAG}-${OS}.zip`
      out = await getStdout("zip", ["-v", file, `./target/release/${PKGNAME}.exe`])
    } else {
      //  const BIN_NAME = PKGNAME
      // core.info(`BIN_NAME = ${BIN_NAME}`)
      file = `${PKGNAME}-${RELEASE_TAG}-${OS}.tar.gz`
      out = await getStdout("tar", ["cvfz", file, `./target/release/${PKGNAME}`])
    }
    core.info(`file = ${file}`)
    core.info(`out = ${out}`)

    const g = new github.GitHub(process.env.GITHUB_TOKEN!)

   // const headers = { 'content-type': "zip"}
    //let urlPath = UPLOAD_URL.match(/repos\/(.*){/)[1]
    //let [owner,repo,,release_id] = urlPath.split('/')
    // await g.repos.uploadReleaseAsset({
    //   ...context.repo,
    //   name: file,
    //   data: fs.readFileSync(file)
    // })

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
