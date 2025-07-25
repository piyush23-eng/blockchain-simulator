export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  fee: number;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
}

export class BlockchainSimulator {
  private chain: Block[] = [];
  private difficulty: number = 4;
  private miningReward: number = 10;
  private pendingTransactions: Transaction[] = [];
  private initialized: boolean = false;

  constructor() {
    this.initializeBlockchain();
  }

  private async initializeBlockchain() {
    const genesisBlock = await this.createGenesisBlock();
    this.chain = [genesisBlock];
    this.initialized = true;
  }

  private async createGenesisBlock(): Promise<Block> {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: "0",
      hash: "",
      nonce: 0,
      difficulty: this.difficulty
    };
    genesisBlock.hash = await this.calculateHash(genesisBlock);
    return genesisBlock;
  }

  private async calculateHash(block: Block): Promise<string> {
    const data = JSON.stringify({
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions,
      previousHash: block.previousHash,
      nonce: block.nonce
    });

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  async mineBlock(miningAddress: string, onProgress?: (nonce: number) => void): Promise<Block> {
    const block: Block = {
      index: this.chain.length,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
      previousHash: this.getLatestBlock().hash,
      hash: "",
      nonce: 0,
      difficulty: this.difficulty
    };

    // Add mining reward transaction
    const rewardTransaction: Transaction = {
      id: `reward-${Date.now()}`,
      from: "system",
      to: miningAddress,
      amount: this.miningReward,
      timestamp: Date.now(),
      fee: 0
    };
    block.transactions.push(rewardTransaction);

    const target = Array(this.difficulty + 1).join("0");
    
    while (true) {
      block.hash = await this.calculateHash(block);
      onProgress?.(block.nonce);
      
      if (block.hash.substring(0, this.difficulty) === target) {
        break;
      }
      block.nonce++;
      
      // Add small delay to make mining visible
      if (block.nonce % 1000 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    this.chain.push(block);
    this.pendingTransactions = [];
    return block;
  }

  addTransaction(transaction: Transaction): boolean {
    if (!transaction.from || !transaction.to || transaction.amount <= 0) {
      return false;
    }
    
    this.pendingTransactions.push(transaction);
    return true;
  }

  getBalance(address: string): number {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {
        if (transaction.from === address) {
          balance -= (transaction.amount + transaction.fee);
        }
        if (transaction.to === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      const target = Array(currentBlock.difficulty + 1).join("0");
      if (currentBlock.hash.substring(0, currentBlock.difficulty) !== target) {
        return false;
      }
    }
    return true;
  }

  getChain(): Block[] {
    return [...this.chain];
  }

  getPendingTransactions(): Transaction[] {
    return [...this.pendingTransactions];
  }

  getDifficulty(): number {
    return this.difficulty;
  }

  setDifficulty(difficulty: number): void {
    this.difficulty = Math.max(1, Math.min(6, difficulty));
  }

  getChainAsJSON(): string {
    return JSON.stringify(this.chain, null, 2);
  }

  getTotalTransactions(): number {
    return this.chain.reduce((total, block) => total + block.transactions.length, 0);
  }

  getAverageBlockTime(): number {
    if (this.chain.length < 2) return 0;
    
    const times = [];
    for (let i = 1; i < this.chain.length; i++) {
      times.push(this.chain[i].timestamp - this.chain[i - 1].timestamp);
    }
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async waitForInitialization(): Promise<void> {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}