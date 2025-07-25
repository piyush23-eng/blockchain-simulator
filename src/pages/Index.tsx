import { useState, useEffect, useCallback } from "react";
import { BlockchainSimulator, Transaction, Block } from "@/lib/blockchain";
import { BlockCard } from "@/components/BlockCard";
import { TransactionForm } from "@/components/TransactionForm";
import { MiningPanel } from "@/components/MiningPanel";
import { ChainStats } from "@/components/ChainStats";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Activity, Blocks, Code, GitBranch } from "lucide-react";

const Index = () => {
  const [blockchain] = useState(() => new BlockchainSimulator());
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const [currentNonce, setCurrentNonce] = useState(0);
  const [chainJSON, setChainJSON] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Initialize blockchain
  useEffect(() => {
    const initBlockchain = async () => {
      await blockchain.waitForInitialization();
      setBlocks(blockchain.getChain());
      setPendingTransactions(blockchain.getPendingTransactions());
      setChainJSON(blockchain.getChainAsJSON());
      setIsInitialized(true);
    };
    initBlockchain();
  }, [blockchain]);

  const refreshData = useCallback(() => {
    setBlocks(blockchain.getChain());
    setPendingTransactions(blockchain.getPendingTransactions());
    setChainJSON(blockchain.getChainAsJSON());
  }, [blockchain]);

  const handleAddTransaction = useCallback((transaction: Transaction) => {
    const success = blockchain.addTransaction(transaction);
    if (success) {
      refreshData();
    }
  }, [blockchain, refreshData]);

  const handleMineBlock = useCallback(async (minerAddress: string) => {
    if (isMining) return;
    
    setIsMining(true);
    setMiningProgress(0);
    setCurrentNonce(0);

    try {
      await blockchain.mineBlock(minerAddress, (nonce) => {
        setCurrentNonce(nonce);
        // Simulate progress based on difficulty and nonce
        const expectedNonces = Math.pow(16, blockchain.getDifficulty());
        const progress = Math.min((nonce / expectedNonces) * 100, 99);
        setMiningProgress(progress);
      });

      setMiningProgress(100);
      refreshData();
      
      toast({
        title: "Block Mined Successfully!",
        description: `New block added to the chain`,
        className: "border-neon-green/30 bg-card"
      });
    } catch (error) {
      toast({
        title: "Mining Failed",
        description: "An error occurred during mining",
        variant: "destructive"
      });
    } finally {
      setIsMining(false);
      setMiningProgress(0);
      setCurrentNonce(0);
    }
  }, [blockchain, isMining, refreshData, toast]);

  const handleDifficultyChange = useCallback((difficulty: number) => {
    blockchain.setDifficulty(difficulty);
    refreshData();
  }, [blockchain, refreshData]);

  const handleExportJSON = useCallback(() => {
    const jsonStr = blockchain.getChainAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockchain-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Blockchain Exported",
      description: "JSON file downloaded successfully",
      className: "border-neon-green/30 bg-card"
    });
  }, [blockchain, toast]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Initializing Blockchain...</h2>
          <p className="text-muted-foreground">Creating genesis block</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Blocks className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Blockchain Simulator
            </h1>
            <p className="text-muted-foreground">
              Interactive proof-of-work blockchain with transaction management
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-neon-green border-neon-green/30">
            <Activity className="w-3 h-3 mr-1" />
            {blockchain.isChainValid() ? "Chain Valid" : "Chain Invalid"}
          </Badge>
          <Badge variant="outline" className="text-neon-blue border-neon-blue/30">
            Blocks: {blocks.length}
          </Badge>
          <Badge variant="outline" className="text-cyber-orange border-cyber-orange/30">
            Pending: {pendingTransactions.length}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="visualizer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-card/50">
          <TabsTrigger value="visualizer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Blocks className="w-4 h-4 mr-2" />
            Visualizer
          </TabsTrigger>
          <TabsTrigger value="mining" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="w-4 h-4 mr-2" />
            Mining
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <GitBranch className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="json" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Code className="w-4 h-4 mr-2" />
            JSON Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualizer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 bg-gradient-block border-border/50">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Blocks className="w-5 h-5 text-neon-green" />
                  Blockchain Visualization
                </h3>
                <ScrollArea className="h-96">
                  <div className="flex gap-6 pb-4">
                    {blocks.map((block, index) => (
                      <div key={block.index} className="flex-shrink-0">
                        <BlockCard
                          block={block}
                          isLatest={index === blocks.length - 1}
                          isMining={isMining && index === blocks.length - 1}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>

            <div className="space-y-6">
              <TransactionForm
                onAddTransaction={handleAddTransaction}
                getBalance={(address) => blockchain.getBalance(address)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="mining" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MiningPanel
              onMineBlock={handleMineBlock}
              pendingTransactions={pendingTransactions.length}
              difficulty={blockchain.getDifficulty()}
              onDifficultyChange={handleDifficultyChange}
              isMining={isMining}
              miningProgress={miningProgress}
              currentNonce={currentNonce}
            />
            
            <ChainStats
              totalBlocks={blocks.length}
              totalTransactions={blockchain.getTotalTransactions()}
              averageBlockTime={blockchain.getAverageBlockTime()}
              isValid={blockchain.isChainValid()}
              difficulty={blockchain.getDifficulty()}
              onExportJSON={handleExportJSON}
            />
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <ChainStats
            totalBlocks={blocks.length}
            totalTransactions={blockchain.getTotalTransactions()}
            averageBlockTime={blockchain.getAverageBlockTime()}
            isValid={blockchain.isChainValid()}
            difficulty={blockchain.getDifficulty()}
            onExportJSON={handleExportJSON}
          />
        </TabsContent>

        <TabsContent value="json" className="space-y-6">
          <Card className="p-6 bg-gradient-block border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-neon-green" />
                Blockchain JSON Export
              </h3>
              <Button
                onClick={handleExportJSON}
                variant="outline"
                className="border-neon-green/30 text-neon-green hover:bg-neon-green/10"
              >
                Download JSON
              </Button>
            </div>
            <Textarea
              value={chainJSON}
              readOnly
              className="font-mono text-xs bg-muted/20 border-border/50 min-h-96"
              placeholder="Blockchain JSON will appear here..."
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
