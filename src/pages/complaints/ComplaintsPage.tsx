import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { showMessage } from '@/utils/Constant';
import { getComplaintsApi, updateComplaintApi, deleteComplaintApi } from '@/apis/complaint';
import { Complaint, GetComplaintsParams } from '@/apis/complaint';
import { IconRefresh, IconEye, IconCheck, IconX, IconAlertCircle, IconClock, IconPlus } from '@tabler/icons-react';

export const ComplaintsPage = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  // Filters
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    overdue: 0,
  });
  const [statsLoaded, setStatsLoaded] = useState(false);

  useEffect(() => {
    document.title = 'Complaints Management - Smart Society';
    fetchComplaints();
    fetchStatistics();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [page, status, priority, category, search]);

  const fetchStatistics = async () => {
    try {
      const response = await getComplaintsApi({ limit: 1000 });
      const allItems = response.items || [];
      const now = new Date();
      
      setStats({
        total: allItems.length,
        pending: allItems.filter((c) => c.status === 'open' || c.status === 'in_progress').length,
        resolved: allItems.filter((c) => c.status === 'resolved' || c.status === 'closed').length,
        overdue: allItems.filter((c) => {
          if (!c.createdAt) return false;
          const createdAt = new Date(c.createdAt);
          const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return (c.status === 'open' || c.status === 'in_progress') && daysDiff > 7;
        }).length,
      });
      setStatsLoaded(true);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params: GetComplaintsParams = {
        page: 1, // Always fetch first page for filtering
        limit: 1000, // Fetch more items for client-side filtering
      };

      // Don't send status if it's 'pending' or 'overdue' - we'll filter client-side
      if (status && status !== 'pending' && status !== 'overdue') {
        params.status = status as any;
      }
      
      if (priority) params.priority = priority as any;
      if (search) params.q = search;

      const response = await getComplaintsApi(params);
      let items = response.items || [];

      // Apply client-side filters
      if (status === 'pending') {
        items = items.filter((c) => c.status === 'open' || c.status === 'in_progress');
      } else if (status === 'overdue') {
        const now = new Date();
        items = items.filter((c) => {
          if (!c.createdAt) return false;
          const createdAt = new Date(c.createdAt);
          const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          return (c.status === 'open' || c.status === 'in_progress') && daysDiff > 7;
        });
      }
      
      if (category) {
        items = items.filter((c) => c.category === category);
      }

      // Apply pagination after filtering
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = items.slice(startIndex, endIndex);

      setComplaints(paginatedItems);
      setTotal(items.length);
      
      // Refresh statistics after actions
      if (!statsLoaded) {
        fetchStatistics();
      }
    } catch (error: any) {
      console.error('Error fetching complaints:', error);
      showMessage(error.message || 'Failed to fetch complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      await updateComplaintApi({
        id: complaintId,
        status: newStatus as any,
        ...(newStatus === 'resolved' ? { resolvedAt: new Date().toISOString() } : {}),
      });
      showMessage('Complaint status updated successfully', 'success');
      fetchComplaints();
      fetchStatistics(); // Refresh statistics
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      showMessage(error.message || 'Failed to update complaint', 'error');
    }
  };

  const handleDelete = async (complaintId: string) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }
    try {
      await deleteComplaintApi(complaintId);
      showMessage('Complaint deleted successfully', 'success');
      fetchComplaints();
      fetchStatistics(); // Refresh statistics
    } catch (error: any) {
      console.error('Error deleting complaint:', error);
      showMessage(error.message || 'Failed to delete complaint', 'error');
    }
  };

  const handleView = (complaint: Complaint) => {
    // For now, just show an alert. Can be enhanced with a modal later
    const createdBy = typeof complaint.createdBy === 'object' && complaint.createdBy
      ? `${complaint.createdBy.firstName} ${complaint.createdBy.lastName || ''}`.trim()
      : 'N/A';
    const location = complaint.location || 'N/A';
    const createdAt = complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A';
    const resolvedAt = complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : 'N/A';
    
    alert(
      `Complaint Details:\n\nCategory: ${complaint.category}\nLocation: ${location}\nPriority: ${complaint.priority}\nStatus: ${complaint.status}\nDescription: ${complaint.description}\nCreated By: ${createdBy}\nCreated At: ${createdAt}\nResolved At: ${resolvedAt}`
    );
  };

  const getStatusBadge = (complaint: Complaint) => {
    const statusLower = complaint.status.toLowerCase();
    const variants: Record<string, any> = {
      open: 'default',
      in_progress: 'default',
      resolved: 'default',
      closed: 'secondary',
      archived: 'secondary',
    };

    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      archived: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[statusLower] || 'bg-gray-100 text-gray-800'}>
        {complaint.status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityLower = priority.toLowerCase();
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[priorityLower] || 'bg-gray-100 text-gray-800'}>
        {priority}
      </Badge>
    );
  };

  const handleResetFilters = () => {
    setStatus('');
    setPriority('');
    setCategory('');
    setSearch('');
    setPage(1);
  };

  const getFilteredCount = (filterStatus: string) => {
    if (filterStatus === '') return stats.total;
    if (filterStatus === 'pending') return stats.pending;
    if (filterStatus === 'resolved') return stats.resolved;
    if (filterStatus === 'overdue') return stats.overdue;
    return 0;
  };

  const complaintColumns = [
    {
      accessorKey: '_id',
      header: 'Complaint #',
      cell: ({ row }: any) => {
        const id = row.original._id;
        return `#${id.substring(id.length - 6).toUpperCase()}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getStatusBadge(row.original),
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }: any) => getPriorityBadge(row.original.priority),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }: any) => row.original.location || '-',
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => row.original.category,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }: any) => {
        const desc = row.original.description || '';
        return desc.length > 50 ? `${desc.substring(0, 50)}...` : desc;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: any) => {
        if (!row.original.createdAt) return '-';
        return new Date(row.original.createdAt).toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const complaint = row.original;
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleView(complaint)}
            >
              <IconEye className="h-4 w-4" />
            </Button>
            {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(complaint._id, 'resolved')}
              >
                <IconCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(complaint._id)}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Get unique categories from all complaints (fetch separately for dropdown)
  const [allCategories, setAllCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getComplaintsApi({ limit: 1000 });
        const categories = Array.from(new Set((response.items || []).map((c) => c.category)));
        setAllCategories(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-black">Complaints Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all complaints</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { fetchComplaints(); fetchStatistics(); }} variant="outline">
            <IconRefresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={() => navigate('/maintenance-bill/complaints/add')}
            className="bg-primary-black hover:bg-gray-800 text-white"
          >
            <IconPlus className="h-4 w-4 mr-2" />
            Raise Complaint
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <IconAlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <IconClock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
              </div>
              <IconX className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={status === '' ? 'default' : 'ghost'}
          onClick={() => setStatus('')}
          className="rounded-b-none"
        >
          All ({getFilteredCount('')})
        </Button>
        <Button
          variant={status === 'pending' ? 'default' : 'ghost'}
          onClick={() => setStatus('pending')}
          className="rounded-b-none"
        >
          Pending ({getFilteredCount('pending')})
        </Button>
        <Button
          variant={status === 'resolved' ? 'default' : 'ghost'}
          onClick={() => setStatus('resolved')}
          className="rounded-b-none"
        >
          Resolved ({getFilteredCount('resolved')})
        </Button>
        <Button
          variant={status === 'overdue' ? 'default' : 'ghost'}
          onClick={() => {
            // Overdue is a calculated status - filter by open/in_progress and date
            setStatus('overdue');
          }}
          className="rounded-b-none"
        >
          Overdue ({getFilteredCount('overdue')})
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter complaints by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category || undefined} onValueChange={(value) => setCategory(value)}>
                <SelectTrigger className="bg-primary-white opacity-100">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status || undefined} onValueChange={(value) => setStatus(value)}>
                <SelectTrigger className="bg-primary-white opacity-100">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority || undefined} onValueChange={(value) => setPriority(value)}>
                <SelectTrigger className="bg-primary-white opacity-100">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search by number, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleResetFilters} variant="outline">
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints</CardTitle>
          <CardDescription>
            Showing {complaints.length} of {total} complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={complaintColumns}
            data={complaints}
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

