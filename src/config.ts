
export interface PerformanceConfig {
    maxProcessedTxs: number;
    maxTokensInMemory: number;
    
    batchSize: number;
    saveInterval: number; 
    
    analysisBatchSize: number;
    progressUpdateInterval: number;
    
    maxFileSize: number; 
    enableCompression: boolean;
    
    
    whitelistCacheEnabled: boolean;
    tokenCacheEnabled: boolean;
    cacheExpiryTime: number; 
}

export const DEFAULT_CONFIG: PerformanceConfig = {
    maxProcessedTxs: 10000,
    maxTokensInMemory: 50000,
    
    batchSize: 100,
    saveInterval: 5000,
    
    analysisBatchSize: 1000,
    progressUpdateInterval: 1000,
    
    maxFileSize: 100 * 1024 * 1024, 
    whitelistCacheEnabled: true,
    tokenCacheEnabled: false,
    cacheExpiryTime: 3600000, 
};

export const HIGH_VOLUME_CONFIG: PerformanceConfig = {
    // Optimized for high-volume scenarios (1000+ tokens/hour)
    maxProcessedTxs: 50000,
    maxTokensInMemory: 100000,
    
    batchSize: 500,
    saveInterval: 2000, // 2 seconds for faster saves
    
    analysisBatchSize: 5000,
    progressUpdateInterval: 5000,
    
    maxFileSize: 500 * 1024 * 1024, // 500MB
    enableCompression: true,
    
    whitelistCacheEnabled: true,
    tokenCacheEnabled: true,
    cacheExpiryTime: 1800000, // 30 minutes
};

export const ULTRA_HIGH_VOLUME_CONFIG: PerformanceConfig = {
    // Optimized for ultra-high-volume scenarios (10000+ tokens/hour)
    maxProcessedTxs: 100000,
    maxTokensInMemory: 200000,
    
    batchSize: 1000,
    saveInterval: 1000, // 1 second for very fast saves
    
    analysisBatchSize: 10000,
    progressUpdateInterval: 10000,
    
    maxFileSize: 1024 * 1024 * 1024, // 1GB
    enableCompression: true,
    
    whitelistCacheEnabled: true,
    tokenCacheEnabled: true,
    cacheExpiryTime: 900000, // 15 minutes
};

// Configuration selector based on environment or manual setting
export function getConfig(): PerformanceConfig {
    const volume = process.env.TOKEN_VOLUME || 'default';
    
    switch (volume.toLowerCase()) {
        case 'high':
            return HIGH_VOLUME_CONFIG;
        case 'ultra':
        case 'ultra-high':
            return ULTRA_HIGH_VOLUME_CONFIG;
        default:
            return DEFAULT_CONFIG;
    }
}

// Performance monitoring utilities
export class PerformanceMonitor {
    private startTime: number;
    private tokenCount: number = 0;
    private lastReportTime: number;
    
    constructor() {
        this.startTime = Date.now();
        this.lastReportTime = this.startTime;
    }
    
    recordToken(): void {
        this.tokenCount++;
    }
    
    getStats(): {
        totalTokens: number;
        uptime: number;
        tokensPerSecond: number;
        tokensPerMinute: number;
        tokensPerHour: number;
    } {
        const now = Date.now();
        const uptime = (now - this.startTime) / 1000; 
        
        return {
            totalTokens: this.tokenCount,
            uptime,
            tokensPerSecond: this.tokenCount / uptime,
            tokensPerMinute: (this.tokenCount / uptime) * 60,
            tokensPerHour: (this.tokenCount / uptime) * 3600,
        };
    }
    
    shouldReport(): boolean {
        const now = Date.now();
        const timeSinceLastReport = now - this.lastReportTime;
        
        if (timeSinceLastReport >= 30000) { 
            this.lastReportTime = now;
            return true;
        }
        
        return false;
    }
    
    report(): void {
        const stats = this.getStats();
        console.log(`   Performance Stats:`);
        console.log(`   Total tokens: ${stats.totalTokens}`);
        console.log(`   Uptime: ${Math.round(stats.uptime)}s`);
        console.log(`   Rate: ${stats.tokensPerSecond.toFixed(2)} tokens/sec`);
        console.log(`   Rate: ${stats.tokensPerMinute.toFixed(0)} tokens/min`);
        console.log(`   Rate: ${stats.tokensPerHour.toFixed(0)} tokens/hour`);
    }
}

export function getMemoryUsage(): {
    used: number;
    total: number;
    percentage: number;
} {
    const usage = process.memoryUsage();
    const used = usage.heapUsed / 1024 / 1024; 
    const total = usage.heapTotal / 1024 / 1024;
    
    return {
        used: Math.round(used * 100) / 100,
        total: Math.round(total * 100) / 100,
        percentage: Math.round((used / total) * 100),
    };
}

export function validateConfig(config: PerformanceConfig): string[] {
    const errors: string[] = [];
    
    if (config.maxProcessedTxs < 100) {
        errors.push('maxProcessedTxs should be at least 100');
    }
    
    if (config.batchSize < 1) {
        errors.push('batchSize should be at least 1');
    }
    
    if (config.saveInterval < 100) {
        errors.push('saveInterval should be at least 100ms');
    }
    
    if (config.maxFileSize < 1024 * 1024) {
        errors.push('maxFileSize should be at least 1MB');
    }
    
    return errors;
}
