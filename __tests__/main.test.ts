import {wait} from '../src/wait'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import toml from "toml";
import fs from "fs";

test('throws invalid number', async () => {
 // const input = parseInt('foo', 10)
 // await expect(wait(input)).rejects.toThrow('milliseconds not a number')
//  const url ='https://uploads.github.com/repos/zhanghanyun/actionts/releases/25382811/assets{?name,label}'
  
//  console.log(url.match(/repos\/(.*){/))
 //const myURL = new URL(url);
  //console.log(myURL.pathname.split('/'));
  //console.log(process.cwd())
  const doc = toml.parse(fs.readFileSync('Cargo.toml','utf-8'))
  console.log(doc.package.name)

})

// test('wait 500 ms', async () => {
//   const start = new Date()
//   await wait(500)
//   const end = new Date()
//   var delta = Math.abs(end.getTime() - start.getTime())
//   expect(delta).toBeGreaterThan(450)
// })

// // shows how the runner will run a javascript action with env / stdout protocol
// test('test runs', () => {
//   process.env['INPUT_MILLISECONDS'] = '500'
//   const ip = path.join(__dirname, '..', 'lib', 'main.js')
//   const options: cp.ExecSyncOptions = {
//     env: process.env
//   }
//   console.log(cp.execSync(`node ${ip}`, options).toString())
// })
