import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { showMessage } from '@/utils/Constant';
import {
  uploadCustomerIdsApi,
  fetchUtilityBillsApi,
  getUtilityBillsApi,
  getCustomerMappingsApi,
  updateUtilityBillApi,
} from '@/apis/billing';
import {
  UtilityBill,
  UnitCustomerMapping,
  GetUtilityBillsParams,
} from '@/types/BillingTypes';
import { IconUpload, IconDownload, IconRefresh, IconFileSpreadsheet } from '@tabler/icons-react';

export const BillingPage = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [customerMappings, setCustomerMappings] = useState<UnitCustomerMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Filters
  const [utilityType, setUtilityType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  // Fetch month and year for fetching bills
  const [fetchMonth, setFetchMonth] = useState<number>(new Date().getMonth() + 1);
  const [fetchYear, setFetchYear] = useState<number>(new Date().getFullYear());
  const [fetchUtilityType, setFetchUtilityType] = useState<string>('electricity');

  useEffect(() => {
    document.title = 'Billing - Smart Society';
    if (activeTab === 'bills') {
      fetchUtilityBills();
    } else if (activeTab === 'mappings') {
      fetchCustomerMappings();
    }
  }, [activeTab, page, utilityType, status, month, year]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ];
      if (!validTypes.includes(file.type)) {
        showMessage('Please upload a valid Excel file (.xlsx or .xls)', 'error');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      showMessage('Please select a file to upload', 'error');
      return;
    }

    try {
      setUploading(true);
      const response = await uploadCustomerIdsApi(uploadFile);
      
      if (response && response.success && response.success.length > 0) {
        showMessage(
          `Successfully uploaded ${response.success.length} customer ID(s). ${response.errors?.length || 0} error(s).`,
          (response.errors && response.errors.length > 0) ? 'warning' : 'success'
        );
        
        if (response.errors && response.errors.length > 0) {
          console.error('Upload errors:', response.errors);
        }
        
        setUploadFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        showMessage('No customer IDs were uploaded. Please check your file format.', 'error');
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      showMessage(error.message || 'Failed to upload customer IDs', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFetchBills = async () => {
    try {
      setFetching(true);
      const response = await fetchUtilityBillsApi({
        month: fetchMonth,
        year: fetchYear,
        utilityType: fetchUtilityType as 'electricity' | 'water' | 'gas',
      });

      showMessage(
        `Successfully fetched ${response.fetched} bills. ${response.errors} errors.`,
        response.errors > 0 ? 'warning' : 'success'
      );

      if (response.errors > 0 && response.errorsList.length > 0) {
        console.error('Fetch errors:', response.errorsList);
      }

      // Refresh bills list
      fetchUtilityBills();
    } catch (error: any) {
      console.error('Error fetching bills:', error);
      showMessage(error.message || 'Failed to fetch utility bills', 'error');
    } finally {
      setFetching(false);
    }
  };

  const fetchUtilityBills = async () => {
    try {
      setLoading(true);
      const params: GetUtilityBillsParams = {
        page,
        limit,
      };

      if (utilityType) params.utilityType = utilityType as any;
      if (status) params.status = status as any;
      if (month) params.month = month;
      if (year) params.year = year;

      const response = await getUtilityBillsApi(params);
      setUtilityBills(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching utility bills:', error);
      showMessage(error.message || 'Failed to fetch utility bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerMappings = async () => {
    try {
      setLoading(true);
      const response = await getCustomerMappingsApi({
        page,
        limit,
      });
      setCustomerMappings(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('Error fetching customer mappings:', error);
      showMessage(error.message || 'Failed to fetch customer mappings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (billId: string) => {
    try {
      await updateUtilityBillApi({
        id: billId,
        status: 'paid',
        paidDate: new Date().toISOString(),
      });
      showMessage('Bill marked as paid', 'success');
      fetchUtilityBills();
    } catch (error: any) {
      console.error('Error updating bill:', error);
      showMessage(error.message || 'Failed to update bill', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      paid: 'default',
      overdue: 'destructive',
      cancelled: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getUtilityTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      electricity: 'bg-yellow-500',
      water: 'bg-blue-500',
      gas: 'bg-orange-500',
      internet: 'bg-purple-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type}</Badge>;
  };

  const utilityBillColumns = [
    {
      accessorKey: 'unit.unitNumber',
      header: 'Unit',
    },
    {
      accessorKey: 'utilityType',
      header: 'Type',
      cell: ({ row }: any) => getUtilityTypeBadge(row.original.utilityType),
    },
    {
      accessorKey: 'customerId',
      header: 'Customer ID',
    },
    {
      accessorKey: 'billPeriod',
      header: 'Period',
      cell: ({ row }: any) => {
        const { month, year } = row.original.billPeriod;
        return `${month}/${year}`;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: any) => `₹${row.original.amount.toLocaleString()}`,
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'dataSource.fetchStatus',
      header: 'Fetch Status',
      cell: ({ row }: any) => {
        const status = row.original.dataSource?.fetchStatus;
        return <Badge variant={status === 'success' ? 'default' : 'destructive'}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const bill = row.original;
        if (bill.status === 'pending') {
          return (
            <Button
              size="sm"
              onClick={() => handleMarkAsPaid(bill._id)}
            >
              Mark as Paid
            </Button>
          );
        }
        return null;
      },
    },
  ];

  const mappingColumns = [
    {
      accessorKey: 'unit.unitNumber',
      header: 'Unit',
    },
    {
      accessorKey: 'customerIds.electricity',
      header: 'Electricity ID',
    },
    {
      accessorKey: 'customerIds.water',
      header: 'Water ID',
    },
    {
      accessorKey: 'customerIds.gas',
      header: 'Gas ID',
    },
    {
      accessorKey: 'autoFetchEnabled',
      header: 'Auto Fetch',
      cell: ({ row }: any) => {
        const enabled = row.original.autoFetchEnabled;
        return (
          <div className="flex flex-col gap-1">
            {enabled.electricity && <Badge variant="outline">Electricity</Badge>}
            {enabled.water && <Badge variant="outline">Water</Badge>}
            {enabled.gas && <Badge variant="outline">Gas</Badge>}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage utility bills and customer ID mappings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Customer IDs</TabsTrigger>
          <TabsTrigger value="bills">Utility Bills</TabsTrigger>
          <TabsTrigger value="mappings">Customer Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Customer IDs</CardTitle>
              <CardDescription>
                Upload an Excel file with customer IDs for each unit. The file should have the following columns:
                <br />
                <strong>Column A:</strong> Unit Number
                <br />
                <strong>Column B:</strong> Electricity Customer ID (optional)
                <br />
                <strong>Column C:</strong> Water Customer ID (optional)
                <br />
                <strong>Column D:</strong> Gas Customer ID (optional)
                <br />
                <strong>Column E:</strong> Internet Customer ID (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Excel File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
                {uploadFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconFileSpreadsheet className="h-4 w-4" />
                    {uploadFile.name}
                  </div>
                )}
              </div>
              <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
                <IconUpload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Customer IDs'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fetch Utility Bills</CardTitle>
              <CardDescription>
                Fetch utility bills from government APIs for a specific month and year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fetch-utility-type">Utility Type</Label>
                  <Select value={fetchUtilityType} onValueChange={setFetchUtilityType}>
                    <SelectTrigger id="fetch-utility-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fetch-month">Month</Label>
                  <Select
                    value={fetchMonth.toString()}
                    onValueChange={(val) => setFetchMonth(parseInt(val))}
                  >
                    <SelectTrigger id="fetch-month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fetch-year">Year</Label>
                  <Input
                    id="fetch-year"
                    type="number"
                    value={fetchYear}
                    onChange={(e) => setFetchYear(parseInt(e.target.value))}
                    min="2020"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>
              <Button onClick={handleFetchBills} disabled={fetching}>
                <IconRefresh className="h-4 w-4 mr-2" />
                {fetching ? 'Fetching...' : 'Fetch Bills'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utility Bills</CardTitle>
              <CardDescription>View and manage utility bills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Utility Type</Label>
                  <Select value={utilityType} onValueChange={setUtilityType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                      <SelectItem value="internet">Internet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select
                    value={month.toString()}
                    onValueChange={(val) => setMonth(parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Months</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min="2020"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>
              <DataTable
                columns={utilityBillColumns}
                data={utilityBills}
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
        </TabsContent>

        <TabsContent value="mappings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Mappings</CardTitle>
              <CardDescription>View customer ID mappings for each unit</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={mappingColumns}
                data={customerMappings}
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

