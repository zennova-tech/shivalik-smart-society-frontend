import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  setSelectedSociety,
  fetchSocieties,
  resetRegistrationStatus,
} from '@/store/slices/registrationSlice';

export const SelectSocietyPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const { societies, status, registrationData } = useSelector((state: any) => state.registration);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchSocieties({ search: searchQuery }));
    }, 300); // Debounce search

    return () => {
      clearTimeout(timeoutId);
    };
  }, [dispatch, searchQuery]);

  const handleSelectSociety = (society: any) => {
    dispatch(
      setSelectedSociety({
        id: society._id,
        name: society.name,
      })
    );
    navigate('/user/register/block');
  };

  const filteredSocieties = societies.filter((society: any) =>
    society.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    society.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/user/register/type')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Society Management</h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Society</h2>
          <p className="text-gray-600 mb-6">
            Search and select your society to access management features.
          </p>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by society name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Societies List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {status === 'loading' ? (
              <div className="text-center py-8 text-gray-500">Loading societies...</div>
            ) : filteredSocieties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No societies found</div>
            ) : (
              filteredSocieties.map((society: any) => (
                <button
                  key={society._id}
                  onClick={() => handleSelectSociety(society)}
                  className="w-full p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors text-left flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{society.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{society.location}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      {society.membersCount > 0 ? (
                        <span>{society.membersCount} Members</span>
                      ) : (<span>0 Members</span>)}
                      {society.blocksCount > 0 ? (<span>{society.blocksCount} Blocks</span>) : (<span>0 Blocks</span>)}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

