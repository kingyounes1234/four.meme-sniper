import { Web3 } from 'web3';
import dotenv from 'dotenv';

dotenv.config();

export interface BuyConfig {
    bnbAmount: string;           // Amount in BNB (e.g., "0.001")
    minTokensOut: string;        // Minimum tokens to receive (slippage protection)
    gasLimit: number;            // Gas limit for transaction
    gasPriceGwei: string;        // Gas price in Gwei for speed
    maxRetries: number;          // Max retry attempts on failure
    useHighPriorityGas: boolean; // Use higher gas for faster execution
}

const DEFAULT_BUY_CONFIG: BuyConfig = {
    bnbAmount: '0.001',
    minTokensOut: '0',
    gasLimit: 500000,            // Increased for safety
    gasPriceGwei: '3',           // 3 Gwei for faster execution
    maxRetries: 2,
    useHighPriorityGas: true,
};

export class TokenBuyer {
    private web3: Web3;
    private contract: any;
    private contractAddress: string;
    private privateKey: string;
    private walletAddress: string;
    private config: BuyConfig;
    private nonceCache: number | null = null;
    private lastNonceUpdate: number = 0;

    constructor(config?: Partial<BuyConfig>) {
        const rpcUrl = process.env.RPC_URL || "https://bsc-dataseed1.binance.org/";
        this.web3 = new Web3(rpcUrl);
        
        this.contractAddress = '0x5c952063c7fc8610FFDB798152D69F0B9550762b';
        
        const abi = [
          // four.meme contract abi
        ];
        
        this.contract = new this.web3.eth.Contract(abi, this.contractAddress);
        
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("Missing PRIVATE_KEY in .env file");
        }
        this.privateKey = privateKey;
        
        const walletAddress = process.env.WALLET_ADDRESS;
        if (!walletAddress) {
            throw new Error("Missing WALLET_ADDRESS in .env file");
        }
        this.walletAddress = walletAddress;
        
        this.config = { ...DEFAULT_BUY_CONFIG, ...config };
        
        console.log(' TokenBuyer initialized');
        console.log(`   Wallet: ${this.walletAddress}`);
        console.log(`   Buy amount: ${this.config.bnbAmount} BNB`);
        console.log(`   Gas price: ${this.config.gasPriceGwei} Gwei`);
    }

 
    private async getNonce(): Promise<number> {
        const now = Date.now();
        if (this.nonceCache !== null && (now - this.lastNonceUpdate) < 5000) {
            const nonce = this.nonceCache;
            this.nonceCache++; 
            return nonce;
        }
        
        const nonce = await this.web3.eth.getTransactionCount(this.walletAddress, 'pending');
        const nonceNum = Number(nonce);
        this.nonceCache = nonceNum + 1;
        this.lastNonceUpdate = now;
        return nonceNum;
    }

    private async getOptimizedGasPrice(): Promise<string> {
        if (!this.config.useHighPriorityGas) {
            return this.web3.utils.toWei(this.config.gasPriceGwei, 'gwei');
        }
        
        try {
        //get current gass and add price logic
        } catch (error) {
            console.warn('⚠️  Failed to get current gas price, using configured value');
            return this.web3.utils.toWei(this.config.gasPriceGwei, 'gwei');
        }
    }


    async buyToken(tokenAddress: string, recipientAddress?: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
        const startTime = Date.now();
        const recipient = recipientAddress || this.walletAddress;
        
        console.log(`\n Initiating buy for token: ${tokenAddress}`);
        
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    console.log(`🔄 Retry attempt ${attempt}/${this.config.maxRetries}`);
                }
                
                const bnbAmountWei = this.web3.utils.toWei(this.config.bnbAmount, 'ether');
                const nonce = await this.getNonce();
                const gasPrice = await this.getOptimizedGasPrice();
                
                const txData = this.contract.methods.buyTokenAMAP(
                    tokenAddress,
                    recipient,
                    bnbAmountWei,
                    this.config.minTokensOut
                ).encodeABI();

                const tx = {
                    from: this.walletAddress,
                    to: this.contractAddress,
                    value: bnbAmountWei,
                    data: txData,
                    gas: this.config.gasLimit,
                    gasPrice: gasPrice,
                    nonce: nonce,
                    chainId: 56
                };

                const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.privateKey);
                
                if (!signedTx.rawTransaction) {
                    throw new Error('Failed to sign transaction');
                }

                const txHash = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction)
                 

                return { 
                    success: true, 
                    txHash: txHash.toString()
                };
                
            } catch (error: any) {
                const errorMsg = error?.message || String(error);
                console.error(`❌ Buy attempt ${attempt} failed:`, errorMsg);
                
                if (errorMsg.includes('insufficient funds') || 
                    errorMsg.includes('nonce too low') ||
                    errorMsg.includes('PRIVATE_KEY')) {
                    return { 
                        success: false, 
                        error: errorMsg 
                    };
                }
                
                if (errorMsg.includes('nonce')) {
                    this.nonceCache = null;
                }
                
                if (attempt === this.config.maxRetries) {
                    return { 
                        success: false, 
                        error: errorMsg 
                    };
                }
                
                await new Promise(resolve => setTimeout(resolve, attempt * 500));
            }
        }
        
        return { 
            success: false, 
            error: 'Max retries exceeded' 
        };
    }

    updateConfig(config: Partial<BuyConfig>): void {
        this.config = { ...this.config, ...config };
        console.log('  Buy configuration updated');
    }

 
    getConfig(): BuyConfig {
        return { ...this.config };
    }
}

export { DEFAULT_BUY_CONFIG };