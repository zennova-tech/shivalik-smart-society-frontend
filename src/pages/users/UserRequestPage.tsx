import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { showMessage } from '@/utils/Constant';
import { IconCheck, IconX } from '@tabler/icons-react';
import { getGuestsApi, approveGuestApi, declineGuestApi, GuestUser } from '@/apis/userRegistration';
import { getFromLocalStorage } from '@/utils/localstorage';

// User Request Interface (mapped from GuestUser for display)
interface UserRequest {
  _id: string;
  userId: string;
  number: string;
  userName: string;
  userBlockName: string;
  userSociety: string;
  userUnitNumber: string;
  email?: string;
  mobileNumber?: string;
  status?: 'pending' | 'approved' | 'declined';
  createdAt?: string;
  updatedAt?: string;
}

export const UserRequestPage = () => {
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [societyName, setSocietyName] = useState<string>('');

  // Get society name from localStorage
  useEffect(() => {
    const getSocietyName = () => {
      try {
        const selectedSociety = getFromLocalStorage<any>('selectedSociety');
        const userInfo = getFromLocalStorage<any>('userInfo');
        
        if (selectedSociety?.name) {
          setSocietyName(selectedSociety.name);
        } else if (userInfo?.society?.name) {
          setSocietyName(userInfo.society.name);
        } else if (userInfo?.societyName) {
          setSocietyName(userInfo.societyName);
        }
      } catch (error) {
        console.error('Error getting society name:', error);
      }
    };
    
    getSocietyName();
  }, []);

  // Map GuestUser from API to UserRequest for display
  const mapGuestToUserRequest = useCallback((guest: GuestUser, index: number): UserRequest => {
    const fullName = guest.lastName 
      ? `${guest.firstName} ${guest.lastName}`.trim()
      : guest.firstName;
    
    return {
      _id: guest.userId || guest.unitId, // Use userId as primary ID
      userId: guest.userId,
      number: `UR${String(index + 1).padStart(3, '0')}`, // Generate request number
      userName: fullName,
      userBlockName: guest.blockName || '-',
      userSociety: societyName || '-', // Use society name from localStorage
      userUnitNumber: guest.unitNumber || '-',
      email: guest.email,
      mobileNumber: guest.mobileNumber ? `${guest.countryCode} ${guest.mobileNumber}` : undefined,
      status: 'pending', // All guests are pending by default
    };
  }, [societyName]);

  const fetchUserRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getGuestsApi({ page, limit });
      
      if (response.status && response.data) {
        // Map API response to UserRequest format
        const mappedRequests: UserRequest[] = response.data.items.map((guest, index) => 
          mapGuestToUserRequest(guest, (page - 1) * limit + index)
        );
        
        setUserRequests(mappedRequests);
        setTotal(response.data.total || 0);
      } else {
        setUserRequests([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('Error fetching user requests:', error);
      showMessage(error.message || 'Failed to fetch user requests', 'error');
      setUserRequests([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, mapGuestToUserRequest]);

  useEffect(() => {
    document.title = 'User Requests - Smart Society';
    fetchUserRequests();
  }, [fetchUserRequests]);

  const handleApprove = async (requestId: string) => {
    try {
      const response = await approveGuestApi(requestId);
      if (response.status) {
        showMessage(response.message || 'User request approved successfully', 'success');
        // Update the status locally
        setUserRequests(prev => 
          prev.map(req => req.userId === requestId ? { ...req, status: 'approved' as const } : req)
        );
        // Refresh the list
        fetchUserRequests();
      } else {
        showMessage(response.message || 'Failed to approve user request', 'error');
      }
    } catch (error: any) {
      console.error('Error approving user request:', error);
      showMessage(error.message || 'Failed to approve user request', 'error');
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to decline this user request?')) {
      return;
    }
    try {
      const response = await declineGuestApi(requestId);
      if (response.status) {
        showMessage(response.message || 'User request declined successfully', 'success');
        // Update the status locally
        setUserRequests(prev => 
          prev.map(req => req.userId === requestId ? { ...req, status: 'declined' as const } : req)
        );
        // Refresh the list
        fetchUserRequests();
      } else {
        showMessage(response.message || 'Failed to decline user request', 'error');
      }
    } catch (error: any) {
      console.error('Error declining user request:', error);
      showMessage(error.message || 'Failed to decline user request', 'error');
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusLower = (status || 'pending').toLowerCase();
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[statusLower] || 'bg-gray-100 text-gray-800'}>
        {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
      </Badge>
    );
  };

  const userRequestColumns: Column<UserRequest>[] = [
    {
      key: 'number',
      header: 'Number',
      render: (request: UserRequest) => {
        return <span className="font-medium">#{request.number}</span>;
      },
    },
    {
      key: 'userName',
      header: 'User Name',
      render: (request: UserRequest) => request.userName || '-',
    },
    {
      key: 'userBlockName',
      header: 'Block Name',
      render: (request: UserRequest) => request.userBlockName || '-',
    },
    {
      key: 'userSociety',
      header: 'Society',
      render: (request: UserRequest) => request.userSociety || '-',
    },
    {
      key: 'userUnitNumber',
      header: 'Unit Number',
      render: (request: UserRequest) => request.userUnitNumber || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (request: UserRequest) => getStatusBadge(request.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (request: UserRequest) => {
        const isPending = !request.status || request.status === 'pending';
        
        return (
          <div className="flex gap-2">
            {isPending && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApprove(request.userId)}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <IconCheck className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(request.userId)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  <IconX className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </>
            )}
            {!isPending && (
              <span className="text-sm text-muted-foreground">
                {request.status === 'approved' ? 'Approved' : 'Declined'}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto space-y-6 ">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-black">User Requests</h1>
          <p className="text-muted-foreground mt-1">Manage and approve user requests</p>
        </div>
      </div>

      {/* User Requests Table */}
      <Card className="bg-primary-white">
        <CardHeader>
          <CardTitle>User Requests</CardTitle>
          <CardDescription>
            Total: {total} user request(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={userRequestColumns}
            data={userRequests}
            loading={loading}
            emptyMessage="No user requests found"
          />
        </CardContent>
      </Card>
    </div>
  );
};

