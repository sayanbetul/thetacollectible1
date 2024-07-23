const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Sözleşmeyi dağıtmak için hesap:", deployer.address);

  // Sözleşme fabrikasını al
  const ThetaCollectibles = await hre.ethers.getContractFactory("ThetaCollectibles");

  // Constructor için argümanlar: reflectionPoolAddress, birthdayBabyPoolAddress, ve houseFeeAddress
  const reflectionPoolAddress = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"; // Örnek adres
  const birthdayBabyPoolAddress = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0"; // Örnek adres
  const houseFeeAddress = "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E"; // Örnek adres

  // Sözleşmeyi dağıt
  const thetaCollectibles = await ThetaCollectibles.deploy(reflectionPoolAddress, birthdayBabyPoolAddress, houseFeeAddress);

  // Dağıtımın tamamlanmasını bekle
  await thetaCollectibles.deployed();

  console.log("ThetaCollectibles sözleşmesi dağıtıldı:", thetaCollectibles.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
