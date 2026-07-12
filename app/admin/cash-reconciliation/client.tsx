"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  AlertTriangle,
  HandCoins,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

interface Rider {
  id: string;
  name: string;
  phone: string;
  cashInHand: number;
  codEligible: boolean;
}

interface Variance {
  id: string;
  orderId: string;
  riderName: string;
  expectedAmount: number;
  enteredAmount: number;
  varianceAmount: number;
  createdAt: string;
}

interface Remittance {
  id: string;
  riderName: string;
  amount: number;
  method: string;
  referenceId: string | null;
  createdAt: string;
}

interface CashReconciliationClientProps {
  ridersWithCash: Rider[];
  openVariances: Variance[];
  remittances: Remittance[];
}

export function CashReconciliationClient({ ridersWithCash, openVariances, remittances }: CashReconciliationClientProps) {
  const queryClient = useQueryClient();
  const [remittanceDialog, setRemittanceDialog] = useState<Rider | null>(null);
  const [remitAmount, setRemitAmount] = useState("");
  const [remitMethod, setRemitMethod] = useState<string>("UPI_TO_PLATFORM");
  const [remitRef, setRemitRef] = useState("");

  const confirmRemittanceMutation = useMutation({
    mutationFn: async (remittanceId: string) => {
      const res = await fetch("/api/admin/confirm-remittance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remittanceId }),
      });
      if (!res.ok) throw new Error("Failed to confirm remittance");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cash-reconciliation"] });
      toast.success("Remittance confirmed");
    },
    onError: (err) => toast.error(err.message),
  });

  const resolveVarianceMutation = useMutation({
    mutationFn: async ({ varianceId, note }: { varianceId: string; note: string }) => {
      const res = await fetch("/api/admin/resolve-variance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ varianceId, note }),
      });
      if (!res.ok) throw new Error("Failed to resolve variance");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cash-reconciliation"] });
      toast.success("Variance resolved");
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleCodEligibilityMutation = useMutation({
    mutationFn: async ({ riderId, codEligible }: { riderId: string; codEligible: boolean }) => {
      const res = await fetch("/api/admin/toggle-cod-eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId, codEligible }),
      });
      if (!res.ok) throw new Error("Failed to toggle COD eligibility");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cash-reconciliation"] });
      toast.success("COD eligibility updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleRemitSubmit = async () => {
    if (!remittanceDialog || !remitAmount || !remitRef) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const res = await fetch("/api/admin/record-remittance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riderId: remittanceDialog.id,
          amount: Number(remitAmount),
          method: remitMethod,
          referenceId: remitRef,
        }),
      });
      if (!res.ok) throw new Error("Failed to record remittance");
      toast.success("Remittance recorded");
      queryClient.invalidateQueries({ queryKey: ["admin-cash-reconciliation"] });
      setRemittanceDialog(null);
      setRemitAmount("");
      setRemitRef("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to record remittance");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cash Reconciliation</h1>
        <p className="text-sm text-muted-foreground">Track COD cash, variances, and remittances</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Outstanding COD Cash by Rider
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ridersWithCash.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No outstanding cash — all riders are settled</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rider</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Cash in Hand</TableHead>
                    <TableHead>COD Eligible</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ridersWithCash.map((rider) => (
                    <TableRow key={rider.id}>
                      <TableCell className="font-medium">{rider.name}</TableCell>
                      <TableCell className="text-xs">{rider.phone}</TableCell>
                      <TableCell>
                        <span className="font-bold text-amber-600">₹{rider.cashInHand.toFixed(0)}</span>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => toggleCodEligibilityMutation.mutate({ riderId: rider.id, codEligible: !rider.codEligible })}
                          className="flex items-center gap-1"
                        >
                          {rider.codEligible ? (
                            <Badge className="bg-green-100 text-green-700 cursor-pointer">Eligible</Badge>
                          ) : (
                            <Badge variant="destructive" className="cursor-pointer">Blocked</Badge>
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="text-xs gap-1"
                            onClick={() => setRemittanceDialog(rider)}
                          >
                            <HandCoins className="h-3 w-3" /> Record Remittance
                          </Button>
                          {!rider.codEligible && (
                            <Button size="sm" variant="outline" className="text-xs gap-1"
                              onClick={() => toggleCodEligibilityMutation.mutate({ riderId: rider.id, codEligible: true })}
                            >
                              <CheckCircle className="h-3 w-3" /> Unblock
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Open COD Variances — Needs Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openVariances.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No open variances — all collected amounts match expectations</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Entered</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openVariances.map((v) => (
                    <VarianceRow key={v.id} variance={v} onResolve={(note) => resolveVarianceMutation.mutate({ varianceId: v.id, note })} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Pending Remittances
          </CardTitle>
        </CardHeader>
        <CardContent>
          {remittances.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No pending remittances</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rider</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {remittances.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.riderName}</TableCell>
                      <TableCell>₹{r.amount.toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.method.replace(/_/g, " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{r.referenceId ?? "—"}</TableCell>
                      <TableCell className="text-xs">{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs gap-1"
                          onClick={() => confirmRemittanceMutation.mutate(r.id)}
                          disabled={confirmRemittanceMutation.isPending}
                        >
                          {confirmRemittanceMutation.isPending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Confirm
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!remittanceDialog} onOpenChange={(open) => { if (!open) setRemittanceDialog(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Cash Remittance</DialogTitle>
            <DialogDescription>
              Record cash collected from {remittanceDialog?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="remit-amount">Amount (₹)</Label>
              <Input
                id="remit-amount"
                type="number"
                placeholder="Enter amount"
                value={remitAmount}
                onChange={(e) => setRemitAmount(e.target.value)}
                max={remittanceDialog?.cashInHand}
              />
              {remittanceDialog && (
                <p className="text-xs text-muted-foreground">
                  Outstanding: ₹{remittanceDialog.cashInHand.toFixed(0)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="remit-method">Method</Label>
              <Select value={remitMethod} onValueChange={setRemitMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI_TO_PLATFORM">UPI to Platform</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="ADMIN_COLLECTED_CASH">Admin Collected Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remit-ref">Reference ID (UTR/Txn ID)</Label>
              <Input
                id="remit-ref"
                placeholder="e.g. UTR123456789"
                value={remitRef}
                onChange={(e) => setRemitRef(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemittanceDialog(null)}>Cancel</Button>
            <Button onClick={handleRemitSubmit}>Record Remittance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VarianceRow({ variance, onResolve }: { variance: Variance; onResolve: (note: string) => void }) {
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">#{variance.orderId.slice(0, 8)}</TableCell>
      <TableCell>{variance.riderName}</TableCell>
      <TableCell>₹{variance.expectedAmount.toFixed(0)}</TableCell>
      <TableCell>₹{variance.enteredAmount.toFixed(0)}</TableCell>
      <TableCell>
        <span className={`font-semibold ${variance.varianceAmount > 0 ? "text-red-600" : "text-green-600"}`}>
          {variance.varianceAmount > 0 ? "-" : "+"}₹{Math.abs(variance.varianceAmount).toFixed(0)}
        </span>
      </TableCell>
      <TableCell className="text-xs">{new Date(variance.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        {resolving ? (
          <div className="flex gap-2">
            <Input
              placeholder="Resolution note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-8 w-40 text-xs"
            />
            <Button size="sm" variant="outline" className="text-xs" onClick={() => { onResolve(note); setResolving(false); setNote(""); }}>
              <CheckCircle className="h-3 w-3 mr-1" /> Resolve
            </Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setResolving(false)}>
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="text-xs" onClick={() => setResolving(true)}>
            Resolve
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}