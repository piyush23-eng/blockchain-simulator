import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Transaction } from "@/lib/blockchain";
import { Send, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
  getBalance: (address: string) => number;
}

export const TransactionForm = ({ onAddTransaction, getBalance }: TransactionFormProps) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState("0.1");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!from || !to || !amount) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    const amountNum = parseFloat(amount);
    const feeNum = parseFloat(fee);
    
    if (amountNum <= 0) {
      toast({
        title: "Error", 
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (from !== "system") {
      const balance = getBalance(from);
      if (balance < amountNum + feeNum) {
        toast({
          title: "Insufficient Balance",
          description: `Available: ${balance.toFixed(2)}, Required: ${(amountNum + feeNum).toFixed(2)}`,
          variant: "destructive"
        });
        return;
      }
    }

    const transaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      amount: amountNum,
      timestamp: Date.now(),
      fee: feeNum
    };

    onAddTransaction(transaction);
    
    toast({
      title: "Transaction Added",
      description: `${amountNum} coins from ${from} to ${to}`,
      className: "border-neon-green/30 bg-card"
    });

    // Reset form
    setFrom("");
    setTo("");
    setAmount("");
    setFee("0.1");
  };

  return (
    <Card className="p-6 bg-gradient-block border-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Send className="w-5 h-5 text-neon-green" />
        <h3 className="text-lg font-semibold">Create Transaction</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from" className="text-sm text-muted-foreground">From Address</Label>
            <Input
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="sender_address"
              className="font-mono text-sm bg-input/50"
            />
            {from && from !== "system" && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Wallet className="w-3 h-3" />
                Balance: {getBalance(from).toFixed(2)} coins
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="to" className="text-sm text-muted-foreground">To Address</Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient_address"
              className="font-mono text-sm bg-input/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm text-muted-foreground">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="font-mono text-sm bg-input/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fee" className="text-sm text-muted-foreground">Fee</Label>
            <Input
              id="fee"
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="0.10"
              step="0.01"
              min="0"
              className="font-mono text-sm bg-input/50"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4 mr-2" />
          Add to Mempool
        </Button>
      </form>
    </Card>
  );
};