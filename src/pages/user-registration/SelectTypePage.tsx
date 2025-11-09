import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setRegistrationType } from '@/store/slices/registrationSlice';
import { RegistrationType } from '@/types/RegistrationTypes';

export const SelectTypePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSelectType = (type: RegistrationType) => {
    dispatch(setRegistrationType(type));
    navigate('/user/register/society');
  };

  return (
    <div className="min-h-screen w-full bg-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Select Type</h1>
        </div>

        {/* Selection Cards */}
        <div className="space-y-4">
          {/* Owner Card */}
          <button
            onClick={() => handleSelectType('Owner')}
            className="w-full p-6 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100 text-center"
          >
            <div className="text-4xl mb-3">🏠</div>
            <div className="text-lg font-semibold text-gray-900">Owner</div>
          </button>

          {/* Tenant Card */}
          <button
            onClick={() => handleSelectType('Tenant')}
            className="w-full p-6 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors bg-white hover:bg-gray-50 text-center"
          >
            <div className="text-4xl mb-3">🤝</div>
            <div className="text-lg font-semibold text-gray-900">Tenant</div>
          </button>
        </div>
      </div>
    </div>
  );
};

