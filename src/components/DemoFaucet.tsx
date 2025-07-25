import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Coins, Gift, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DemoFaucetProps {
  onAddFaucetTransaction: (address: string, amount: number) => void;
  getBalance: (address: string) => number;
}

export const DemoFaucet = ({ onAddFaucetTransaction, getBalance }: DemoFaucetProps) => {
  const [faucetAddress, setFaucetAddress] = useState("");
  const [lastFaucetTime, setLastFaucetTime] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  const FAUCET_AMOUNT = 100;
  const COOLDOWN_TIME = 30000; // 30 seconds

  const canUseFaucet = (address: string) => {
    const lastTime = lastFaucetTime[address] || 0;
    return Date.now() - lastTime > COOLDOWN_TIME;
  };

  const handleFaucetRequest = () => {
    if (!faucetAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter an address",
        variant: "destructive"
      });
      return;
    }

    if (!canUseFaucet(faucetAddress)) {
      const remaining = Math.ceil((COOLDOWN_TIME - (Date.now() - lastFaucetTime[faucetAddress])) / 1000);
      toast({
        title: "Cooldown Active",
        description: `Please wait ${remaining} seconds before requesting again`,
        variant: "destructive"
      });
      return;
    }

    onAddFaucetTransaction(faucetAddress, FAUCET_AMOUNT);
    setLastFaucetTime(prev => ({
      ...prev,
      [faucetAddress]: Date.now()
    }));

    toast({
      title: "Demo Coins Sent!",
      description: `${FAUCET_AMOUNT} coins added to ${faucetAddress}`,
      className: "border-neon-green/30 bg-card"
    });
  };

  const quickAddresses = [
    "alice",
    "bob", 
    "charlie",
    "demo_user"
  ];

  const handleQuickFaucet = (address: string) => {
    setFaucetAddress(address);
    if (canUseFaucet(address)) {
      onAddFaucetTransaction(address, FAUCET_AMOUNT);
      setLastFaucetTime(prev => ({
        ...prev,
        [address]: Date.now()
      }));

      toast({
        title: "Demo Coins Sent!",
        description: `${FAUCET_AMOUNT} coins added to ${address}`,
        className: "border-neon-green/30 bg-card"
      });
    }
  };

  return (
    <Card className="p-6 bg-gradient-block border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-cyber-orange" />
        <h3 className="text-lg font-semibold">Demo Faucet</h3>
        <Badge className="bg-cyber-orange/20 text-cyber-orange border-cyber-orange/30 ml-auto">
          Free Coins!
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Quick Demo Accounts */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Quick Demo Accounts</Label>
          <div className="grid grid-cols-2 gap-2">
            {quickAddresses.map((address) => (
              <Button
                key={address}
                variant="outline"
                size="sm"
                onClick={() => handleQuickFaucet(address)}
                disabled={!canUseFaucet(address)}
                className="flex items-center justify-between p-3 h-auto"
              >
                <div className="flex flex-col items-start">
                  <span className="font-mono text-xs">{address}</span>
                  <span className="text-xs text-muted-foreground">
                    {getBalance(address).toFixed(1)} coins
                  </span>
                </div>
                <Coins className="w-4 h-4 text-cyber-orange" />
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Address Faucet */}
        <div className="space-y-2">
          <Label htmlFor="faucetAddress" className="text-sm text-muted-foreground">
            Custom Address
          </Label>
          <div className="flex gap-2">
            <Input
              id="faucetAddress"
              value={faucetAddress}
              onChange={(e) => setFaucetAddress(e.target.value)}
              placeholder="Enter address for demo coins"
              className="font-mono text-sm bg-input/50"
            />
            <Button
              onClick={handleFaucetRequest}
              disabled={!faucetAddress.trim() || !canUseFaucet(faucetAddress)}
              className="bg-gradient-primary hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <Zap className="w-4 h-4 mr-2" />
              Get {FAUCET_AMOUNT}
            </Button>
          </div>
          
          {faucetAddress && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Coins className="w-3 h-3" />
              Current Balance: {getBalance(faucetAddress).toFixed(2)} coins
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-3 h-3" />
            <span className="font-semibold">Demo Faucet Info:</span>
          </div>
          <ul className="space-y-1 ml-5">
            <li>• Get {FAUCET_AMOUNT} free coins per address</li>
            <li>• 30 second cooldown between requests</li>
            <li>• Perfect for testing transactions</li>
            <li>• Mine blocks to earn more coins!</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};