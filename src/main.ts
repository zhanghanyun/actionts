import * as exec from "@actions/exec"
import * as core from "@actions/core"
import * as fs from "fs"
import * as crypto from "crypto"
import * as github from "@actions/github"
import * as Webhooks from '@octokit/webhooks'
import * as toml from "toml"
import * as io from '@actions/io'


async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.info(`ms = ${ms}`)

    const OS = process.env.RUNNER_OS
    core.info(`OS = ${OS}`)

    const g = new github.GitHub(process.env.GITHUB_TOKEN!)

    const context = github.context;
    core.info(`release = ${context.payload.release}`)
    //core.info(`release_id = ${context.payload.release.id}`)



    //const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY
    //core.info(`GITHUB_REPOSITORY = ${GITHUB_REPOSITORY}`)
    //const PKGNAME = path.basename(process.env.GITHUB_REPOSITORY!)
    const doc = toml.parse(fs.readFileSync('Cargo.toml','utf-8'))
    const pkgName = doc.package.name
    // const RELEASE_TAG = path.basename(process.env.GITHUB_REF!)
    const releaseTag = context.payload.release.tag_name
    //core.info(`GITHUB_EVENT_PATH = ${process.env.GITHUB_EVENT_PATH}`)
    let out, file = ''
    //let  upload = JSON.parse(`${data1}`)
    //core.info(`upload123 ${upload}`)
    // let upload : Upload = {release:{upload_url:''}}
    //const data = fs.readFileSync(process.env.GITHUB_EVENT_PATH!)

    const upload_url = context.payload.release.upload_url
    //let upload_url = upload.release.upload_url
    //let upload_url : string = upload.release
    //const URL =  JSON.parse(process.env.GITHUB_EVENT_PATH!)
    core.info(`upload_url = ${upload_url}`)
    core.info(`pkgName = ${pkgName}`)
    core.info(`releaseTag = ${releaseTag}`)

    let build = await getStdout('cargo',['build','--release'])
    core.info(`build result: ${build}`)

    if (OS == 'Windows') {
      // const BIN_NAME = `${PKGNAME}.exe`
      // core.info(`BIN_NAME = ${BIN_NAME}`)
      file = `${pkgName}-${releaseTag}-${OS}.zip`
      io.mv(`./target/release/${pkgName}.exe`,`./${pkgName}.exe`)
      out = await getStdout("zip", ["-v", file, `./${pkgName}.exe`])
    } else {
      //  const BIN_NAME = PKGNAME
      // core.info(`BIN_NAME = ${BIN_NAME}`)
      file = `${pkgName}-${releaseTag}-${OS}.tar.gz`
      io.mv(`./target/release/${pkgName}`,`./${pkgName}`)
      out = await getStdout("tar", ["cvfz", file, `./${pkgName}`])
    }
    core.info(`file = ${file}`)
    core.info(`out = ${out}`)
    let f = fs.readFileSync(file)

    const sha256 = crypto.createHash('sha256').update(f).digest('hex')
    core.info(`sha256 = ${sha256}`)

    let rsp = await g.repos.uploadReleaseAsset({
      url: upload_url,
      name: file,
      headers: {
        "content-length": f.length,
        "content-type": "application/gzip"
      },
      data: f
    })
    core.info(`file upload rep: ${rsp}`)

    rsp = await g.repos.uploadReleaseAsset({
      url: upload_url,
      name: `${file}.SHA256`,
      headers: {
        "content-length": sha256.length,
        "content-type": "text/plain"
      },
      data: sha256
    })
    core.info(`sha256 upload rep: ${rsp}`)

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
