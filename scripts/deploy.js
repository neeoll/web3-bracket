const hre = require('hardhat')
const fs = require('fs')

async function main() {
  // these two lines deploy the contract to the network
  const Main = await hre.ethers.getContractFactory('Main')
  const main = await Main.deploy()

  await main.deployed()
  console.log('Main deployed to: ', main.address)

  // this code writes the contract addresses to a local file named config.js that we can use in the app
  fs.writeFileSync('./config.js', `
  export const contractAddress = "${main.address}"
  export const ownerAddress = "${main.signer.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })