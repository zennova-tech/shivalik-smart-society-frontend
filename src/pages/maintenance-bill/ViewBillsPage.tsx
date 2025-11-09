import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { showMessage } from '@/utils/Constant';
import { getBillsApi, publishBillApi, updateBillApi } from '@/apis/bill';
import { getBlocksBySocietyApi, Block } from '@/apis/block';
import { getFloorsApi, Floor } from '@/apis/floor';
import { Bill, GetBillsParams } from '@/types/BillTypes';
import { IconRefresh, IconEye, IconCheck, IconX } from '@tabler/icons-react';

export const ViewBillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  // Filters
  const [status, setStatus] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  useEffect(() => {
    document.title = 'View Maintenance & Bills - Smart Society';
    fetchBlocks();
    fetchBills();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [page, status, selectedBlock, selectedFloor, search, fromDate, toDate]);

  useEffect(() => {
    if (selectedBlock) {
      fetchFloors(selectedBlock);
    } else {
      setFloors([]);
      setSelectedFloor('');
    }
  }, [selectedBlock]);

  const fetchBlocks = async () => {
    try {
      const response = await getBlocksBySocietyApi({ limit: 500, status: 'active' });
      setBlocks(response.items || []);
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
    }
  };

  const fetchFloors = async (blockId: string) => {
    try {
      const response = await getFloorsApi({ block: blockId, limit: 500, status: 'active' });
      setFloors(response.items || []);
    } catch (error: any) {
      console.error('Error fetching floors:', error);
      showMessage('Failed to fetch floors', 'error');
    }
  };

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params: GetBillsParams = {
        page,
        limit,
      };

      if (status) params.status = status as any;
      if (selectedBlock) params.block = selectedBlock;
      if (selectedFloor) params.floor = selectedFloor;
      if (search) params.search = search;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const response = await getBillsApi(params);
      setBills(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching bills:', error);
      showMessage(error.message || 'Failed to fetch bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (billId: string) => {
    try {
      await publishBillApi(billId);
      showMessage('Bill published successfully', 'success');
      fetchBills();
    } catch (error: any) {
      console.error('Error publishing bill:', error);
      showMessage(error.message || 'Failed to publish bill', 'error');
    }
  };

  const handleMarkAsPaid = async (billId: string) => {
    try {
      await updateBillApi({
        id: billId,
        status: 'paid',
        paidDate: new Date().toISOString(),
      });
      showMessage('Bill marked as paid', 'success');
      fetchBills();
    } catch (error: any) {
      console.error('Error updating bill:', error);
      showMessage(error.message || 'Failed to update bill', 'error');
    }
  };

  const getStatusBadge = (bill: Bill) => {
    const isDue = new Date(bill.dueDate) < new Date() && bill.status !== 'paid';
    const actualStatus = isDue ? 'due' : bill.status;

    const variants: Record<string, any> = {
      pending: 'default',
      paid: 'default',
      due: 'destructive',
      cancelled: 'secondary',
    };

    return <Badge variant={variants[actualStatus] || 'default'}>{actualStatus}</Badge>;
  };

  const handleResetFilters = () => {
    setStatus('');
    setSelectedBlock('');
    setSelectedFloor('');
    setSearch('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const billColumns = [
    {
      accessorKey: 'title',
      header: 'Bill Name',
    },
    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }: any) => {
        const unit = row.original.unit;
        return unit ? unit.unitNumber : '-';
      },
    },
    {
      accessorKey: 'block',
      header: 'Block',
      cell: ({ row }: any) => {
        const block = row.original.block;
        if (!block) return '-';
        if (typeof block === 'string') return block;
        return block.name || '-';
      },
    },
    {
      accessorKey: 'floor',
      header: 'Floor',
      cell: ({ row }: any) => {
        const floor = row.original.floor;
        if (!floor) return '-';
        if (typeof floor === 'string') return floor;
        return floor.name || `Floor ${floor.number}` || '-';
      },
    },
    {
      accessorKey: 'user',
      header: 'Member/Tenant',
      cell: ({ row }: any) => {
        const user = row.original.user;
        return user ? `${user.firstName} ${user.lastName || ''}`.trim() : '-';
      },
    },
    {
      accessorKey: 'billDate',
      header: 'Bill Date',
      cell: ({ row }: any) => {
        if (!row.original.billDate) return '-';
        return new Date(row.original.billDate).toLocaleDateString();
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }: any) => {
        if (!row.original.dueDate) return '-';
        return new Date(row.original.dueDate).toLocaleDateString();
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => {
        const amount = row.original.amount || 0;
        return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    },
    {
      accessorKey: 'lateFee',
      header: 'Late Fee',
      cell: ({ row }: any) => {
        const lateFee = row.original.lateFee || 0;
        return `₹${lateFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
    },
    {
      accessorKey: 'isForOwner',
      header: 'Bill For',
      cell: ({ row }: any) => {
        const isForOwner = row.original.isForOwner;
        return (
          <Badge variant={isForOwner ? 'default' : 'secondary'}>
            {isForOwner ? 'Owner' : 'Tenant'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getStatusBadge(row.original),
    },
    {
      accessorKey: 'isPublished',
      header: 'Published',
      cell: ({ row }: any) => {
        return row.original.isPublished ? (
          <Badge variant="default">Published</Badge>
        ) : (
          <Badge variant="secondary">Draft</Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const bill = row.original;
        return (
          <div className="flex gap-2">
            {!bill.isPublished && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePublish(bill._id)}
              >
                <IconCheck className="h-4 w-4 mr-1" />
                Publish
              </Button>
            )}
            {bill.status !== 'paid' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAsPaid(bill._id)}
              >
                Mark as Paid
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">View Maintenance & Bills</h1>
          <p className="text-muted-foreground mt-1">View and manage all generated bills</p>
        </div>
        <Button onClick={fetchBills} variant="outline">
          <IconRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter bills by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                <Select value={status || undefined} onValueChange={(value) => setStatus(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="due">Due</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {status && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus('')}
                    className="px-2"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Block</Label>
              <div className="flex gap-2">
                <Select value={selectedBlock || undefined} onValueChange={(value) => setSelectedBlock(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Blocks" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks.map((block) => (
                      <SelectItem key={block._id} value={block._id}>
                        {block.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedBlock && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBlock('');
                      setSelectedFloor('');
                    }}
                    className="px-2"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Floor</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedFloor || undefined}
                  onValueChange={(value) => setSelectedFloor(value)}
                  disabled={!selectedBlock}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="All Floors" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor._id} value={floor._id}>
                        {floor.name || `Floor ${floor.number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFloor && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFloor('')}
                    className="px-2"
                    disabled={!selectedBlock}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Member/Tenant Search</Label>
              <Input
                placeholder="Search by name or unit"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleResetFilters} variant="outline" className="w-full">
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>
            Total: {total} bill(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={billColumns}
            data={bills}
            loading={loading}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

