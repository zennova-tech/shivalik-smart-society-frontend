import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  setSelectedBlock,
  fetchBlocks,
  resetRegistrationStatus,
} from '@/store/slices/registrationSlice';

export const SelectBlockPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { blocks, status, registrationData } = useSelector((state: any) => state.registration);

  useEffect(() => {
    if (registrationData.societyId) {
      dispatch(fetchBlocks({ societyId: registrationData.societyId }));
    } else {
      navigate('/user/register/society');
    }
    return () => {
      dispatch(resetRegistrationStatus());
    };
  }, [dispatch, registrationData.societyId, navigate]);

  const handleSelectBlock = (block: any) => {
    dispatch(
      setSelectedBlock({
        id: block._id,
        name: block.name,
      })
    );
    navigate('/user/register/unit');
  };

  return (
    <div className="min-h-screen w-full bg-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/user/register/society')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Select Block</h1>
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-2 gap-4">
          {status === 'loading' ? (
            <div className="col-span-2 text-center py-8 text-gray-500">Loading blocks...</div>
          ) : blocks.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-gray-500">No blocks found</div>
          ) : (
            blocks.map((block: any) => (
              <button
                key={block._id}
                onClick={() => handleSelectBlock(block)}
                className={`p-8 rounded-lg border-2 transition-colors text-center ${
                  registrationData.blockId === block._id
                    ? 'border-gray-400 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl font-bold text-gray-900">{block.name}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

