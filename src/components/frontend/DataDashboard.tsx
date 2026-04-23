
'use client';

import React from 'react';
import { DataRecord } from '@/lib/datanexus/types';
import { fetchAllRecords, removeRecord } from '@/app/actions/data-actions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Database,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataForm } from './DataForm';
import { AIInsightTool } from './AIInsightTool';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export function DataDashboard() {
  const [records, setRecords] = React.useState<DataRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingRecord, setEditingRecord] = React.useState<DataRecord | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAllRecords();
    setRecords(data);
    setLoading(false);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await removeRecord(id);
      loadData();
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const filteredRecords = records.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRecords = records.filter(r => selectedIds.has(r.id));

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen p-4 md:p-8">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 space-y-6">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg">
            <Database className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">DataBridge</h1>
        </div>
        
        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-white shadow-sm border border-border/50">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-white">
            <Database className="h-4 w-4" />
            Connections
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-white">
            <ShieldCheck className="h-4 w-4" />
            Security
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-white">
            <Settings className="h-4 w-4" />
            System
          </Button>
        </nav>

        <div className="pt-4 border-t">
          <AIInsightTool selectedData={selectedRecords} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Operational Data</h2>
            <p className="text-sm text-muted-foreground">Manage and monitor active datanexus nodes.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="bg-white">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingRecord ? 'Edit Record' : 'Create New Record'}</DialogTitle>
                </DialogHeader>
                <DataForm 
                  initialData={editingRecord} 
                  onSuccess={() => {
                    setIsFormOpen(false);
                    setEditingRecord(null);
                    loadData();
                  }} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-md border-none bg-white">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search records..." 
                    className="pl-9 bg-background/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Showing {filteredRecords.length} results
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="rounded-xl border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Record Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={6} className="h-12 text-center text-muted-foreground animate-pulse">
                            Loading node data...
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id} className="group hover:bg-muted/10 transition-colors">
                          <TableCell>
                            <Checkbox 
                              checked={selectedIds.has(record.id)} 
                              onCheckedChange={() => toggleSelect(record.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{record.name}</TableCell>
                          <TableCell>
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                              {record.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.status === 'active' ? 'default' : record.status === 'inactive' ? 'secondary' : 'outline'}
                              className={`capitalize shadow-none ${
                                record.status === 'active' ? 'bg-accent/20 text-accent-foreground border-accent/20' : ''
                              }`}
                            >
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-primary font-semibold">
                            ${record.value.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  setEditingRecord(record);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(record.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
