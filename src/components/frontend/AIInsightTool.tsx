
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { aiDataInsightSummary } from '@/ai/flows/ai-data-insight-summary-flow';
import { DataRecord } from '@/lib/datanexus/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIInsightToolProps {
  selectedData: DataRecord[];
}

export function AIInsightTool({ selectedData }: AIInsightToolProps) {
  const [insight, setInsight] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const generateInsight = async () => {
    if (selectedData.length === 0) return;
    setLoading(true);
    try {
      const dataStrings = selectedData.map(r => 
        `ID: ${r.id}, Name: ${r.name}, Type: ${r.type}, Status: ${r.status}, Value: ${r.value}, Description: ${r.description}`
      );
      const result = await aiDataInsightSummary({ data: dataStrings });
      setInsight(result.summary);
    } catch (error) {
      console.error('AI Insight Error:', error);
      setInsight('Failed to generate insights at this time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <BrainCircuit className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Data Insights</CardTitle>
              <CardDescription>Generative analysis of selected records</CardDescription>
            </div>
          </div>
          <Button 
            onClick={generateInsight} 
            disabled={loading || selectedData.length === 0}
            size="sm"
            className="bg-accent hover:bg-accent/80 text-accent-foreground"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insight ? (
          <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-white/50">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{insight}</p>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-sm italic">
              {selectedData.length > 0 
                ? "Click generate to analyze selected data" 
                : "Select records in the table to analyze"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
