const fs = require('fs');
const path = require('path');

// Read the deployment info from the blockchain workspace
const deploymentPath = path.join(__dirname, '../blockchain/contract-address.json');

try {
  if (fs.existsSync(deploymentPath)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    const contractAddress = deploymentInfo.address;

    console.log('📋 Updating contract address:', contractAddress);

    // Update .env file
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update CONTRACT_ADDRESS
      if (envContent.includes('CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(
          /CONTRACT_ADDRESS=.*/,
          `CONTRACT_ADDRESS=${contractAddress}`
        );
      } else {
        envContent += `\nCONTRACT_ADDRESS=${contractAddress}`;
      }

      // Update VITE_CONTRACT_ADDRESS for frontend
      if (envContent.includes('VITE_CONTRACT_ADDRESS=')) {
        envContent = envContent.replace(
          /VITE_CONTRACT_ADDRESS=.*/,
          `VITE_CONTRACT_ADDRESS=${contractAddress}`
        );
      } else {
        envContent += `\nVITE_CONTRACT_ADDRESS=${contractAddress}`;
      }

      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env file');
    }

    // Update frontend environment
    const frontendEnvPath = path.join(__dirname, '../frontend/.env');
    let frontendEnvContent = '';
    
    if (fs.existsSync(frontendEnvPath)) {
      frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
    }

    // Update VITE_CONTRACT_ADDRESS
    if (frontendEnvContent.includes('VITE_CONTRACT_ADDRESS=')) {
      frontendEnvContent = frontendEnvContent.replace(
        /VITE_CONTRACT_ADDRESS=.*/,
        `VITE_CONTRACT_ADDRESS=${contractAddress}`
      );
    } else {
      frontendEnvContent += `VITE_CONTRACT_ADDRESS=${contractAddress}\n`;
    }

    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Updated frontend .env file');

    // Create a deployment summary
    const summary = {
      contractAddress,
      network: deploymentInfo.network,
      chainId: deploymentInfo.chainId,
      deployer: deploymentInfo.deployer,
      deployedAt: deploymentInfo.deployedAt,
      timestamp: new Date().toISOString()
    };

    const summaryPath = path.join(__dirname, '../deployment-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log('✅ Created deployment summary');

    console.log('\n🎉 Contract address updated successfully!');
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`🌐 Network: ${deploymentInfo.network}`);
    console.log(`🔗 Chain ID: ${deploymentInfo.chainId}`);
    
  } else {
    console.log('❌ No deployment info found. Run "npm run chain:deploy" first.');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error updating contract address:', error);
  process.exit(1);
}