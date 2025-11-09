import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  setSelectedUnit,
  fetchUnits,
  resetRegistrationStatus,
} from '@/store/slices/registrationSlice';
import { FloorGroup } from '@/types/RegistrationTypes';

export const SelectUnitPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { units, status, registrationData } = useSelector((state: any) => state.registration);

  useEffect(() => {
    if (registrationData.societyId && registrationData.blockId) {
      dispatch(
        fetchUnits({
          societyId: registrationData.societyId,
          blockId: registrationData.blockId,
        })
      );
    } else {
      navigate('/user/register/block');
    }
    return () => {
      dispatch(resetRegistrationStatus());
    };
  }, [dispatch, registrationData.societyId, registrationData.blockId, navigate]);

  const handleSelectUnit = (unit: any) => {
    if (unit.status === 'available') {
      dispatch(
        setSelectedUnit({
          id: unit._id,
          number: unit.unitNumber,
        })
      );
      navigate('/user/register/details');
    }
  };

  // Group units by floor
  const groupedUnits = useMemo(() => {
    const groups: Record<string, FloorGroup> = {};
    units.forEach((unit: any) => {
      const floorId = unit.floor?._id || 'unknown';
      const floorName = unit.floor?.name || 'Unknown Floor';
      const floorNumber = unit.floor?.number || 0;

      if (!groups[floorId]) {
        groups[floorId] = {
          floorId,
          floorName,
          floorNumber,
          units: [],
        };
      }
      groups[floorId].units.push(unit);
    });

    // Sort floors by number
    return Object.values(groups).sort((a, b) => a.floorNumber - b.floorNumber);
  }, [units]);

  return (
    <div className="min-h-screen w-full bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/user/register/block')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Select unit to register</h1>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-700">Occupied</span>
          </div>
        </div>

        {/* Units by Floor */}
        <div className="space-y-6">
          {status === 'loading' ? (
            <div className="text-center py-8 text-gray-500">Loading units...</div>
          ) : groupedUnits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No units found</div>
          ) : (
            groupedUnits.map((floor) => (
              <div key={floor.floorId} className="bg-gray-50 rounded-lg p-4">
                <div className="bg-black text-white px-4 py-2 rounded mb-4 inline-block">
                  {floor.floorNumber} Floor
                </div>
                <div className="flex flex-wrap gap-3">
                  {floor.units.map((unit) => {
                    const isAvailable = unit.status === 'available';
                    const isSelected = registrationData.unitId === unit._id;

                    return (
                      <button
                        key={unit._id}
                        onClick={() => handleSelectUnit(unit)}
                        disabled={!isAvailable}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          isSelected
                            ? 'ring-2 ring-blue-500 ring-offset-2'
                            : isAvailable
                            ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                            : 'bg-red-500 text-white cursor-not-allowed opacity-60'
                        }`}
                      >
                        {unit.unitNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

