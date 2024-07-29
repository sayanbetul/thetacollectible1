const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Sözleşmeyi dağıtmak için hesap:", deployer.address);

  // Sözleşme fabrikasını al
  const ThetaCollectibles = await hre.ethers.getContractFactory("ThetaCollectibles");

  // Constructor için argümanlar: reflectionPoolAddress, birthdayBabyPoolAddress, ve houseFeeAddress
  const reflectionPoolAddress = "0x235c8627A6d9627C18652870727dE7f861f9E49F"; // Örnek adres
  const birthdayBabyPoolAddress = "0xba33DAcf393A1054dc1eE81c977400D8868668b4"; // Örnek adres
  const houseFeeAddress = "0x48dd7416DB852999A1B8bc749BB1cF170c9198da"; // Örnek adres

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
