/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const fs = require('fs-extra')
const mkdirp = require('mkdirp')
const path = require('path')

const { getRegionalLists } = require('../lib/adBlockRustUtils')

var outPath = path.join('build', 'ad-block-updater');

const defaultAdblockComponentId = "cffkpbalmllkdoenhmdmpbkajipdjfam"
const defaultAdblockBase64PublicKey = 
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs0qzJmHSgIiw7IGFCxij" +
    "1NnB5hJ5ZQ1LKW9htL4EBOaMJvmqaDs/wfq0nw/goBHWsqqkMBynRTu2Hxxirvdb" +
    "cugn1Goys5QKPgAvKwDHJp9jlnADWm5xQvPQ4GE1mK1/I3ka9cEOCzPW6GI+wGLi" +
    "VPx9VZrxHHsSBIJRaEB5Tyi5bj0CZ+kcfMnRTsXIBw3C6xJgCVKISQUkd8mawVvG" +
    "vqOhBOogCdb9qza5eJ1Cgx8RWKucFfaWWxKLOelCiBMT1Hm1znAoVBHG/blhJJOD" +
    "5HcH/heRrB4MvrE1J76WF3fvZ03aHVcnlLtQeiNNOZ7VbBDXdie8Nomf/QswbBGa" +
    "VwIDAQAB"

const generateManifestFile = (name, base64PublicKey, uuid) => {
  var manifest = "{\n" +
                 "  \"description\": \"Brave Ad Block Updater extension\",\n" +
                 "  \"key\": \"" + base64PublicKey + "\",\n" +
                 "  \"manifest_version\": 2,\n" +
                 "  \"name\": \"Brave Ad Block Updater (" + name + ")\",\n" +
                 "  \"version\": \"0.0.0\"\n" +
                 "}\n"

  let filePath = path.join(outPath, uuid , 'manifest.json')
  let p = fs.writeFile(filePath, manifest);
  return p
}

const generateManifestFileForDefaultAdblock =
  generateManifestFile.bind(null, 'Default', defaultAdblockBase64PublicKey, 'default')  // eslint-disable-line

const generateManifestFilesForAllRegions = () => {
  let p = Promise.resolve()
  getRegionalLists().then(regions => {
    regions.forEach((region) => {
      p = p.then(generateManifestFile.bind(null, region.title, region.base64_public_key, region.uuid))
    })
  })
}

generateManifestFileForDefaultAdblock()
  .then(generateManifestFilesForAllRegions)
  .then(() => {
    console.log('Thank you for updating the data files, don\'t forget to upload them too!')
  })
  .catch((e) => {
    console.error(`Something went wrong, aborting: ${e}`)
    process.exit(1)
  })

process.on('uncaughtException', (err) => {
  console.error('Caught exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
  process.exit(1)
})
