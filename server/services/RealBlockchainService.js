// services/RealBlockchainService.js
const { ethers } = require('ethers');
const crypto = require('crypto');

class RealBlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.isConnected = false;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.initializeBlockchain();
  }

  async initializeBlockchain() {
    try {
      // Connect to Ethereum network (Polygon, BSC, etc.)
      const network = process.env.BLOCKCHAIN_NETWORK || 'sepolia';
      const rpcUrl = this.getRpcUrl(network);
      
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Use private key from environment (keep this secure!)
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        console.log('🔗 Blockchain wallet connected:', this.wallet.address);
      }

      // Contract ABI (you'll get this after deploying the contract)
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.getContractABI(),
        this.wallet || this.provider
      );

      this.isConnected = true;
      console.log('✅ Real Blockchain Service initialized');
      
    } catch (error) {
      console.error('❌ Blockchain initialization failed:', error.message);
      this.isConnected = false;
    }
  }

  getRpcUrl(network) {
    const rpcUrls = {
      sepolia: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      mainnet: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      polygon: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      mumbai: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      bsc: 'https://bsc-dataseed.binance.org/',
      bsctest: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    };
    
    return rpcUrls[network] || rpcUrls.sepolia;
  }

  getContractABI() {
    return [
      "function addRegistration(string _studentId, string _studentName, uint256[] _courseIds, uint256 _totalAmount, uint256 _amountPaid, string _paymentMethod, string _verificationCode, string _recordHash) external returns (uint256)",
      "function getRegistration(uint256 _registrationId) external view returns (uint256, string, string, uint256[], uint256, uint256, string, string, uint256, string)",
      "function getStudentRecords(string _studentId) external view returns (uint256[])",
      "function verifyRecord(uint256 _registrationId, string _expectedHash) external view returns (bool)",
      "function getRecordCount() external view returns (uint256)",
      "event RegistrationAdded(uint256 indexed registrationId, string indexed studentId, string studentName, uint256 totalAmount, uint256 timestamp, string verificationCode)"
    ];
  }

  async addRecord(record) {
    if (!this.isConnected) {
      console.warn('⚠️ Blockchain not connected, storing locally');
      return this.createLocalRecord(record);
    }

    try {
      // Create a hash of the record for integrity verification
      const recordHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(record))
        .digest('hex');

      console.log('📝 Adding record to REAL blockchain...');

      // Convert course IDs to BigInt array
      const courseIds = record.courses.map(id => BigInt(id));

      // Send transaction to smart contract
      const tx = await this.contract.addRegistration(
        record.studentId,
        record.studentName,
        courseIds,
        BigInt(Math.floor(record.totalAmount * 100)), // Convert to integer (wei equivalent)
        BigInt(Math.floor(record.amountPaid * 100)),
        record.paymentMethod,
        record.verificationCode,
        recordHash
      );

      console.log('⛓️ Transaction sent:', tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      // Get the registration ID from transaction events
      const event = receipt.logs.find(log => 
        log.address.toLowerCase() === this.contractAddress.toLowerCase()
      );
      
      if (event) {
        const parsedLog = this.contract.interface.parseLog(event);
        const registrationId = parsedLog.args.registrationId.toString();
        
        console.log(`🎉 Record stored on blockchain with ID: ${registrationId}`);
        
        return {
          ...record,
          recordId: registrationId,
          blockchainTx: tx.hash,
          blockNumber: receipt.blockNumber,
          timestamp: new Date().toISOString(),
          recordHash: recordHash
        };
      }

      throw new Error('Failed to get registration ID from transaction');

    } catch (error) {
      console.error('💥 Blockchain transaction failed:', error);
      
      // Fallback to local storage
      return this.createLocalRecord(record);
    }
  }

  createLocalRecord(record) {
    // Fallback method when blockchain is unavailable
    const localRecord = {
      ...record,
      recordId: crypto.randomBytes(16).toString('hex'),
      recordHash: crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex'),
      timestamp: new Date().toISOString(),
      localFallback: true
    };
    
    console.log('📋 Record stored locally (blockchain fallback):', localRecord.recordId);
    return localRecord;
  }

  async getRecordsByStudent(studentId) {
    if (!this.isConnected) {
      console.warn('⚠️ Blockchain not connected, cannot fetch records');
      return [];
    }

    try {
      const recordIds = await this.contract.getStudentRecords(studentId);
      const records = [];

      for (const id of recordIds) {
        try {
          const record = await this.getRegistration(id);
          if (record) {
            records.push(record);
          }
        } catch (error) {
          console.error(`Error fetching record ${id}:`, error);
        }
      }

      return records;
    } catch (error) {
      console.error('Error fetching student records from blockchain:', error);
      return [];
    }
  }

  async getRegistration(registrationId) {
    if (!this.isConnected) {
      return null;
    }

    try {
      const result = await this.contract.getRegistration(registrationId);
      
      return {
        registrationId: result[0].toString(),
        studentId: result[1],
        studentName: result[2],
        courseIds: result[3].map(id => id.toString()),
        totalAmount: Number(result[4]) / 100, // Convert back from integer
        amountPaid: Number(result[5]) / 100,
        paymentMethod: result[6],
        verificationCode: result[7],
        timestamp: new Date(Number(result[8]) * 1000).toISOString(),
        recordHash: result[9]
      };
    } catch (error) {
      console.error('Error fetching registration from blockchain:', error);
      return null;
    }
  }

  async verifyRecord(registrationId, expectedData) {
    if (!this.isConnected) {
      return { verified: false, reason: 'Blockchain not connected' };
    }

    try {
      const expectedHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(expectedData))
        .digest('hex');

      const isVerified = await this.contract.verifyRecord(registrationId, expectedHash);
      
      return {
        verified: isVerified,
        recordHash: expectedHash,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error verifying record on blockchain:', error);
      return { verified: false, reason: error.message };
    }
  }

  async getBlockchainStatus() {
    if (!this.isConnected) {
      return {
        connected: false,
        network: 'Not connected',
        blockHeight: 0,
        contractAddress: this.contractAddress,
        walletAddress: this.wallet?.address || 'Not connected'
      };
    }

    try {
      const blockNumber = await this.provider.getBlockNumber();
      const recordCount = await this.contract.getRecordCount();
      const network = await this.provider.getNetwork();

      return {
        connected: true,
        network: network.name,
        chainId: network.chainId,
        blockHeight: blockNumber,
        totalRecords: recordCount.toString(),
        contractAddress: this.contractAddress,
        walletAddress: this.wallet?.address,
        gasPrice: (await this.provider.getFeeData()).gasPrice?.toString()
      };
    } catch (error) {
      console.error('Error getting blockchain status:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

module.exports = RealBlockchainService;