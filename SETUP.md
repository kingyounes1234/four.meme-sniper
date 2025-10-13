# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create a `.env` file in the root directory:

```env
# Required: Your wallet credentials
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=0xYourWalletAddress

# Optional: RPC endpoint (default provided)
RPC_URL=https://bsc-dataseed1.binance.org/

# Auto-buy settings
AUTO_BUY_ENABLED=true
BUY_AMOUNT_BNB=0.001
BUY_GAS_PRICE_GWEI=3

# Performance (default, high, ultra)
TOKEN_VOLUME=default
```

### Step 3: Configure Whitelist

Edit `src/list/whitelist.json` with creator addresses you want to monitor:

```json
[
  {
    "creator": "0x09EE10B94326b9418De029Cc90dC6d76dF7C102e"
  }
]
```

### Step 4: Run the Bot

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

---

## 🎯 How It Works

1. **Monitoring**: Bot connects to BSC WebSocket and monitors Four.meme contract
2. **Detection**: When a new token is created, checks if creator is whitelisted
3. **Action**: If whitelisted, automatically buys the token (if enabled)
4. **Speed**: Optimized for fastest execution (0.3-1.3 seconds from detection to purchase)

---

## ⚙️ Configuration Options

### Auto-Buy Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `AUTO_BUY_ENABLED` | `false` | Enable automatic buying |
| `BUY_AMOUNT_BNB` | `0.001` | BNB amount per purchase |
| `BUY_GAS_PRICE_GWEI` | `3` | Gas price (higher = faster) |

### Gas Price Recommendations

- **Normal**: 3-5 Gwei (economical, 3-5 second confirmation)
- **Fast**: 5-8 Gwei (priority, 1-3 second confirmation)
- **Urgent**: 10+ Gwei (highest priority, sub-second confirmation)

### Performance Modes

- **default**: Standard mode for normal usage (10K tx cache)
- **high**: High-volume mode (50K tx cache, 500 batch size)
- **ultra**: Ultra high-volume mode (100K tx cache, 1000 batch size)

---

## 🔐 Security Best Practices

1. ✅ **Never commit** your `.env` file
2. ✅ **Use a dedicated wallet** for trading (not your main wallet)
3. ✅ **Start with small amounts** to test (e.g., 0.001 BNB)
4. ✅ **Monitor gas prices** on BSCScan before running
5. ✅ **Keep sufficient BNB** for gas fees (0.001-0.01 BNB per tx)

---

## 📊 Expected Performance

### Speed Benchmarks

- Event detection: **~100-500ms**
- Whitelist check: **<1ms** (cached)
- Transaction signing: **~50-100ms**
- Transaction submission: **~200-800ms**
- **Total**: **~350-1400ms** from event to purchase

### Optimization Features

✅ Nonce caching (reduces RPC calls)
✅ Whitelist caching (instant lookups)
✅ Dynamic gas boosting (20% priority)
✅ Asynchronous execution (non-blocking)
✅ Retry logic (exponential backoff)
✅ HTTP RPC for transactions (faster than WebSocket)

---

## 🐛 Troubleshooting

### "Missing PRIVATE_KEY in .env"
- Add your private key to `.env` file (without 0x prefix)

### "Missing WALLET_ADDRESS in .env"
- Add your wallet address to `.env` file (with 0x prefix)

### Transactions failing
- Check you have sufficient BNB balance
- Increase `BUY_GAS_PRICE_GWEI` for faster inclusion
- Check BSCScan for network congestion

### No tokens detected
- Verify whitelist addresses are correct (checksummed)
- Check BSC WebSocket connection is stable
- Monitor console for connection status

---

## 📝 Example Output

```
🚀 Real-time whitelist monitoring enabled!
💡 Only whitelisted tokens will be saved and alerted

🤖 AUTO-BUY MODE ENABLED
⚡ Will automatically buy whitelisted tokens!

✅ Connected to BSC Mainnet (Block: 45678901)
✅ Listening for TokenCreate events on Four.meme contract

🚨🚨🚨 WHITELISTED CREATOR ALERT! 🚨🚨🚨
🎯 ✅ WHITELISTED CREATOR DETECTED! 🎯
Symbol: MOON
Name: MoonToken
Address: 0x1234...5678
Creator: 0x09EE...102e
TX: 0xabcd...ef01
Block: 45678902

🤖 AUTO-BUY TRIGGERED!
💸 Initiating buy for token: 0x1234...5678
⚡ Transaction sent in 456ms
📤 TX Hash: 0xdef0...1234
✅ Transaction confirmed in block 45678903 (1234ms total)

✅ BUY SUCCESS for MOON
   Token: 0x1234...5678
   TX: 0xdef0...1234
```

---

## 💰 Cost Estimation

### Per Transaction

- **Gas fee**: ~0.0005-0.002 BNB (depending on gas price)
- **Buy amount**: Configurable (default 0.001 BNB)
- **Total per buy**: ~0.0015-0.003 BNB

### Example Scenarios

- **10 buys/day** @ 0.002 BNB each = 0.02 BNB/day
- **50 buys/day** @ 0.002 BNB each = 0.1 BNB/day

---

## 🎓 Advanced Usage

### Custom Buy Configuration

You can modify buy settings programmatically in `src/index.ts`:

```typescript
const buyConfig: Partial<BuyConfig> = {
    bnbAmount: '0.005',          // 5x default amount
    gasPriceGwei: '10',          // Urgent priority
    useHighPriorityGas: true,    // Auto gas boost
    maxRetries: 3,               // More retry attempts
    gasLimit: 600000,            // Higher gas limit
};
```

### Multiple Whitelists

You can maintain different whitelist files and swap them:

```bash
cp whitelists/presale.json src/list/whitelist.json
npm run dev
```

---

## 📞 Support

For issues or questions:
1. Check console output for error messages
2. Verify all environment variables are set
3. Test with monitor-only mode first (`AUTO_BUY_ENABLED=false`)
4. Ensure you have sufficient BNB for gas + purchases

**Happy Trading! 🚀**

