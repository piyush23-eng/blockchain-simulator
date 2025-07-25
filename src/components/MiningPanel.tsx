import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pickaxe, Zap, Target, Clock } from "lucide-react";

interface MiningPanelProps {
  onMineBlock: (address: string) => Promise<void>;
  pendingTransactions: number;
  difficulty: number;
  onDifficultyChange: (difficulty: number) => void;
  isMining: boolean;
  miningProgress?: number;
  currentNonce?: number;
}

export const MiningPanel = ({
  onMineBlock,
  pendingTransactions,
  difficulty,
  onDifficultyChange,
  isMining,
  miningProgress = 0,
  currentNonce = 0
}: MiningPanelProps) => {
  const [minerAddress, setMinerAddress] = useState("miner_001");

  const handleMineBlock = async () => {
    if (!minerAddress) return;
    await onMineBlock(minerAddress);
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return "text-neon-green";
    if (level <= 4) return "text-cyber-orange";
    return "text-destructive";
  };

  const getDifficultyLabel = (level: number) => {
    if (level <= 2) return "Easy";
    if (level <= 4) return "Medium";
    return "Hard";
  };

  return (
    <Card className="p-6 bg-gradient-block border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Pickaxe className="w-5 h-5 text-cyber-orange" />
        <h3 className="text-lg font-semibold">Mining Control</h3>
        {isMining && (
          <Badge className="bg-gradient-mining text-white animate-pulse ml-auto">
            Mining in Progress...
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Miner Address */}
        <div className="space-y-2">
          <Label htmlFor="minerAddress" className="text-sm text-muted-foreground">Miner Address</Label>
          <Input
            id="minerAddress"
            value={minerAddress}
            onChange={(e) => setMinerAddress(e.target.value)}
            placeholder="Enter miner address"
            className="font-mono text-sm bg-input/50"
            disabled={isMining}
          />
        </div>

        {/* Mining Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-blue" />
              <span className="text-sm text-muted-foreground">Pending TXs</span>
            </div>
            <Badge variant="outline" className="text-neon-blue border-neon-blue/30">
              {pendingTransactions}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Difficulty</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${getDifficultyColor(difficulty)} border-current`}
              >
                {difficulty} ({getDifficultyLabel(difficulty)})
              </Badge>
            </div>
          </div>
        </div>

        {/* Difficulty Control */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Adjust Difficulty</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDifficultyChange(Math.max(1, difficulty - 1))}
              disabled={isMining || difficulty <= 1}
              className="px-3"
            >
              -
            </Button>
            <div className="flex gap-1 flex-1 justify-center">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border ${
                    i < difficulty 
                      ? 'bg-destructive border-destructive' 
                      : 'bg-transparent border-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDifficultyChange(Math.min(6, difficulty + 1))}
              disabled={isMining || difficulty >= 6}
              className="px-3"
            >
              +
            </Button>
          </div>
        </div>

        {/* Mining Progress */}
        {isMining && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground">Mining Progress</span>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={miningProgress} 
                className="h-2 bg-muted/20"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>Nonce: {currentNonce.toLocaleString()}</span>
                <span>{miningProgress.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Mine Button */}
        <Button
          onClick={handleMineBlock}
          disabled={isMining || !minerAddress || pendingTransactions === 0}
          className="w-full bg-gradient-mining hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Pickaxe className="w-4 h-4 mr-2" />
          {isMining ? "Mining..." : "Mine Block"}
        </Button>

        {pendingTransactions === 0 && !isMining && (
          <p className="text-xs text-muted-foreground text-center">
            Add transactions to the mempool before mining
          </p>
        )}
      </div>
    </Card>
  );
};