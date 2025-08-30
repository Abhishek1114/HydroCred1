import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const mainAdminAddress = process.env.MAIN_ADMIN_ADDRESS;
  
  if (!mainAdminAddress) {
    throw new Error("MAIN_ADMIN_ADDRESS not found in environment variables");
  }

  console.log("Deploying HydroCredToken...");
  console.log("Main Admin Address:", mainAdminAddress);

  const HydroCredToken = await ethers.getContractFactory("HydroCredToken");
  const hydroCredToken = await HydroCredToken.deploy(mainAdminAddress);

  await hydroCredToken.waitForDeployment();

  const contractAddress = await hydroCredToken.getAddress();
  
  console.log("HydroCredToken deployed to:", contractAddress);
  console.log("Main Admin set to:", mainAdminAddress);
  
  // Verify the main admin role
  const hasMainAdminRole = await hydroCredToken.hasRole(
    await hydroCredToken.MAIN_ADMIN_ROLE(),
    mainAdminAddress
  );
  
  console.log("Main Admin role verified:", hasMainAdminRole);
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress,
    mainAdminAddress,
    network: (await ethers.provider.getNetwork()).name,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString()
  };
  
  console.log("Deployment completed successfully!");
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });