import { ethers } from 'ethers';
import { HydroCredToken__factory } from '../abi/contracts';
import { Transaction } from '../models/Transaction';
import { ProductionRequest } from '../models/ProductionRequest';

export class BlockchainService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL!;
    const privateKey = process.env.PRIVATE_KEY!;
    const contractAddress = process.env.CONTRACT_ADDRESS!;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = HydroCredToken__factory.connect(contractAddress, this.wallet);
  }

  /**
   * Verify certification signature
   */
  async verifyCertificationSignature(
    producerAddress: string,
    amount: number,
    certificationHash: string,
    signature: string
  ): Promise<{ isValid: boolean; certifier: string }> {
    try {
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ['address', 'uint256', 'bytes32'],
          [producerAddress, amount, certificationHash]
        )
      );
      
      const ethSignedMessageHash = ethers.hashMessage(ethers.getBytes(messageHash));
      const certifier = ethers.recoverAddress(ethSignedMessageHash, signature);
      
      // Check if certifier has CITY_ADMIN_ROLE
      const cityAdminRole = await this.contract.CITY_ADMIN_ROLE();
      const hasRole = await this.contract.hasRole(cityAdminRole, certifier);
      
      return {
        isValid: hasRole,
        certifier
      };
    } catch (error) {
      console.error('Signature verification failed:', error);
      return {
        isValid: false,
        certifier: ethers.ZeroAddress
      };
    }
  }

  /**
   * Mint tokens with certification
   */
  async mintWithCertification(
    producerAddress: string,
    amount: number,
    certificationHash: string,
    certifierSignature: string
  ): Promise<{ success: boolean; transactionHash?: string; tokenIds?: number[]; error?: string }> {
    try {
      // Verify signature first
      const verification = await this.verifyCertificationSignature(
        producerAddress,
        amount,
        certificationHash,
        certifierSignature
      );

      if (!verification.isValid) {
        return {
          success: false,
          error: 'Invalid certification signature'
        };
      }

      // Check if certification hash already used
      const isUsed = await this.contract.certificationHashUsed(certificationHash);
      if (isUsed) {
        return {
          success: false,
          error: 'Certification hash already used'
        };
      }

      // Get current token count to calculate new token IDs
      const currentSupply = await this.contract.totalSupply();
      const fromTokenId = Number(currentSupply) + 1;
      const toTokenId = fromTokenId + amount - 1;

      // Mint tokens
      const tx = await this.contract.mintWithCertification(
        producerAddress,
        amount,
        certificationHash,
        certifierSignature
      );

      const receipt = await tx.wait();
      
      if (receipt?.status === 1) {
        // Update production request status
        await ProductionRequest.findOneAndUpdate(
          { certificationHash },
          { 
            status: 'minted',
            transactionHash: receipt.hash,
            tokenIds: Array.from({ length: amount }, (_, i) => fromTokenId + i)
          }
        );

        // Log transaction
        await this.logTransaction({
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber!,
          from: this.wallet.address,
          to: producerAddress,
          eventType: 'mint',
          tokenIds: Array.from({ length: amount }, (_, i) => fromTokenId + i),
          amount,
          metadata: { certificationHash, certifier: verification.certifier },
          timestamp: new Date(),
          status: 'confirmed'
        });

        return {
          success: true,
          transactionHash: receipt.hash,
          tokenIds: Array.from({ length: amount }, (_, i) => fromTokenId + i)
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed'
        };
      }
    } catch (error) {
      console.error('Minting failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Appoint country admin
   */
  async appointCountryAdmin(adminAddress: string, countryId: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const tx = await this.contract.appointCountryAdmin(adminAddress, countryId);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        await this.logTransaction({
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber!,
          from: this.wallet.address,
          to: adminAddress,
          eventType: 'role_grant',
          role: 'country_admin',
          metadata: { countryId },
          timestamp: new Date(),
          status: 'confirmed'
        });

        return {
          success: true,
          transactionHash: receipt.hash
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed'
        };
      }
    } catch (error) {
      console.error('Appoint country admin failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Appoint state admin
   */
  async appointStateAdmin(adminAddress: string, stateId: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const tx = await this.contract.appointStateAdmin(adminAddress, stateId);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        await this.logTransaction({
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber!,
          from: this.wallet.address,
          to: adminAddress,
          eventType: 'role_grant',
          role: 'state_admin',
          metadata: { stateId },
          timestamp: new Date(),
          status: 'confirmed'
        });

        return {
          success: true,
          transactionHash: receipt.hash
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed'
        };
      }
    } catch (error) {
      console.error('Appoint state admin failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Appoint city admin
   */
  async appointCityAdmin(adminAddress: string, cityId: number): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const tx = await this.contract.appointCityAdmin(adminAddress, cityId);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        await this.logTransaction({
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber!,
          from: this.wallet.address,
          to: adminAddress,
          eventType: 'role_grant',
          role: 'city_admin',
          metadata: { cityId },
          timestamp: new Date(),
          status: 'confirmed'
        });

        return {
          success: true,
          transactionHash: receipt.hash
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed'
        };
      }
    } catch (error) {
      console.error('Appoint city admin failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Register producer
   */
  async registerProducer(producerAddress: string): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      const tx = await this.contract.registerProducer(producerAddress);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        await this.logTransaction({
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber!,
          from: this.wallet.address,
          to: producerAddress,
          eventType: 'role_grant',
          role: 'producer',
          timestamp: new Date(),
          status: 'confirmed'
        });

        return {
          success: true,
          transactionHash: receipt.hash
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed'
        };
      }
    } catch (error) {
      console.error('Register producer failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user role from blockchain
   */
  async getUserRole(userAddress: string): Promise<string | null> {
    try {
      const roles = [
        { role: 'main_admin', check: await this.contract.hasRole(await this.contract.MAIN_ADMIN_ROLE(), userAddress) },
        { role: 'country_admin', check: await this.contract.hasRole(await this.contract.COUNTRY_ADMIN_ROLE(), userAddress) },
        { role: 'state_admin', check: await this.contract.hasRole(await this.contract.STATE_ADMIN_ROLE(), userAddress) },
        { role: 'city_admin', check: await this.contract.hasRole(await this.contract.CITY_ADMIN_ROLE(), userAddress) },
        { role: 'producer', check: await this.contract.hasRole(await this.contract.PRODUCER_ROLE(), userAddress) },
        { role: 'buyer', check: await this.contract.hasRole(await this.contract.BUYER_ROLE(), userAddress) },
        { role: 'auditor', check: await this.contract.hasRole(await this.contract.AUDITOR_ROLE(), userAddress) }
      ];

      for (const { role, check } of roles) {
        if (check) return role;
      }

      return null;
    } catch (error) {
      console.error('Get user role failed:', error);
      return null;
    }
  }

  /**
   * Get user tokens
   */
  async getUserTokens(userAddress: string): Promise<number[]> {
    try {
      const tokens = await this.contract.tokensOfOwner(userAddress);
      return tokens.map(token => Number(token));
    } catch (error) {
      console.error('Get user tokens failed:', error);
      return [];
    }
  }

  /**
   * Log transaction to database
   */
  private async logTransaction(transactionData: {
    transactionHash: string;
    blockNumber: number;
    from: string;
    to?: string;
    eventType: 'mint' | 'transfer' | 'retire' | 'role_grant' | 'role_revoke';
    tokenIds?: number[];
    amount?: number;
    role?: string;
    metadata?: Record<string, any>;
    timestamp: Date;
    status: 'pending' | 'confirmed' | 'failed';
  }) {
    try {
      await Transaction.create(transactionData);
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
  }
}

export const blockchainService = new BlockchainService();