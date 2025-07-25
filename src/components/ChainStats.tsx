import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Shield, Clock, TrendingUp, Download, CheckCircle, XCircle } from "lucide-react";

interface ChainStatsProps {
  totalBlocks: number;
  totalTransactions: number;
  averageBlockTime: number;
  isValid: boolean;
  difficulty: number;
  onExportJSON: () => void;
}

export const ChainStats = ({
  totalBlocks,
  totalTransactions,
  averageBlockTime,
  isValid,
  difficulty,
  onExportJSON
}: ChainStatsProps) => {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getHashRate = () => {
    // Simulated hash rate based on difficulty and block time
    const baseHashRate = Math.pow(2, difficulty) * 1000;
    return averageBlockTime > 0 ? baseHashRate / (averageBlockTime / 1000) : 0;
  };

  const formatHashRate = (hashRate: number) => {
    if (hashRate >= 1e9) return `${(hashRate / 1e9).toFixed(1)} GH/s`;
    if (hashRate >= 1e6) return `${(hashRate / 1e6).toFixed(1)} MH/s`;
    if (hashRate >= 1e3) return `${(hashRate / 1e3).toFixed(1)} KH/s`;
    return `${hashRate.toFixed(0)} H/s`;
  };

  return (
    <Card className="p-6 bg-gradient-block border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-neon-blue" />
          <h3 className="text-lg font-semibold">Chain Statistics</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isValid ? (
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Valid
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-3 h-3 mr-1" />
              Invalid
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Blocks */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-neon-green" />
            <span className="text-sm">Total Blocks</span>
          </div>
          <div className="text-2xl font-bold text-neon-green font-mono">
            {totalBlocks}
          </div>
        </div>

        {/* Total Transactions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-neon-blue" />
            <span className="text-sm">Total Transactions</span>
          </div>
          <div className="text-2xl font-bold text-neon-blue font-mono">
            {totalTransactions}
          </div>
        </div>

        {/* Average Block Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Avg Block Time</span>
          </div>
          <div className="text-xl font-bold text-cyber-orange font-mono">
            {averageBlockTime > 0 ? formatTime(averageBlockTime) : "N/A"}
          </div>
        </div>

        {/* Hash Rate */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Est. Hash Rate</span>
          </div>
          <div className="text-xl font-bold text-neon-purple font-mono">
            {averageBlockTime > 0 ? formatHashRate(getHashRate()) : "N/A"}
          </div>
        </div>
      </div>

      {/* Network Security */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Network Security</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-6 rounded-sm ${
                  i < difficulty 
                    ? 'bg-gradient-to-t from-destructive to-cyber-orange' 
                    : 'bg-muted/20'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-mono text-muted-foreground">
            Difficulty: {difficulty}/6
          </span>
        </div>
      </div>

      {/* Export Button */}
      <Button
        onClick={onExportJSON}
        variant="outline"
        className="w-full border-neon-green/30 text-neon-green hover:bg-neon-green/10"
      >
        <Download className="w-4 h-4 mr-2" />
        Export Chain as JSON
      </Button>
    </Card>
  );
};