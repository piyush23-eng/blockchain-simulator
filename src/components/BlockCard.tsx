import { Block } from "@/lib/blockchain";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Hash, Link as LinkIcon, Coins } from "lucide-react";

interface BlockCardProps {
  block: Block;
  isLatest?: boolean;
  isMining?: boolean;
}

export const BlockCard = ({ block, isLatest, isMining }: BlockCardProps) => {
  const formatHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className={`
      relative p-6 bg-gradient-block border-border/50 transition-all duration-300
      ${isLatest ? 'ring-2 ring-primary shadow-glow-neon' : ''}
      ${isMining ? 'animate-pulse shadow-glow-mining' : ''}
      hover:shadow-block hover:scale-105
    `}>
      {/* Block Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono">
            Block #{block.index}
          </Badge>
          {isLatest && (
            <Badge className="bg-gradient-primary text-primary-foreground">
              Latest
            </Badge>
          )}
          {isMining && (
            <Badge className="bg-gradient-mining text-white animate-pulse">
              Mining...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <Clock className="w-4 h-4" />
          {formatTimestamp(block.timestamp)}
        </div>
      </div>

      {/* Block Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-neon-green" />
          <span className="text-sm text-muted-foreground">Hash:</span>
          <code className="text-xs font-mono text-neon-green bg-muted/20 px-2 py-1 rounded">
            {formatHash(block.hash)}
          </code>
        </div>

        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-neon-blue" />
          <span className="text-sm text-muted-foreground">Previous:</span>
          <code className="text-xs font-mono text-neon-blue bg-muted/20 px-2 py-1 rounded">
            {formatHash(block.previousHash)}
          </code>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-cyber-orange" />
            <span className="text-sm text-muted-foreground">Transactions:</span>
            <Badge variant="outline" className="text-cyber-orange border-cyber-orange/30">
              {block.transactions.length}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Nonce:</span>
            <Badge variant="outline" className="font-mono">
              {block.nonce}
            </Badge>
          </div>
        </div>

        {/* Difficulty indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Difficulty:</span>
          <div className="flex gap-1">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < block.difficulty ? 'bg-destructive' : 'bg-muted/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Connection line to next block */}
      {!isLatest && (
        <div className="absolute -right-6 top-1/2 w-6 h-0.5 bg-gradient-primary transform -translate-y-1/2" />
      )}
    </Card>
  );
};