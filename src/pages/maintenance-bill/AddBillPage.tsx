import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { showMessage } from '@/utils/Constant';
import { createBillApi } from '@/apis/bill';
import { getBlocksBySocietyApi, Block } from '@/apis/block';
import { getFloorsApi, Floor } from '@/apis/floor';
import { getUnitsApi, Unit } from '@/apis/unit';
import { getBuildingApi, normalizeBuildingResponse } from '@/apis/building';
import { getSocietyId } from '@/utils/societyUtils';
import { IconPlus, IconX } from '@tabler/icons-react';

const billSchema = Yup.object().shape({
  title: Yup.string().required('Bill Name is required'),
  description: Yup.string(),
  billDate: Yup.date().required('Bill Date is required'),
  dueDate: Yup.date().required('Due Date is required'),
  forMonth: Yup.number().min(1).max(12),
  year: Yup.number().required('Year is required').min(2020).max(2100),
  block: Yup.string(),
  floor: Yup.string(),
  units: Yup.array().of(Yup.string()).min(1, 'At least one unit is required'),
  amount: Yup.number().required('Amount is required').min(0, 'Amount must be greater than 0'),
  lateFee: Yup.number().min(0).default(0),
  isForOwner: Yup.boolean().default(false),
  isPublished: Yup.boolean().default(false),
});

type BillFormData = Yup.InferType<typeof billSchema>;

export const AddBillPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('');
  const [defaultBuildingId, setDefaultBuildingId] = useState<string | null>(null);
  const [loadingBuilding, setLoadingBuilding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BillFormData>({
    resolver: yupResolver(billSchema),
    defaultValues: {
      isPublished: false,
      isForOwner: false,
      lateFee: 0,
      forMonth: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  const watchAmount = watch('amount');
  const watchIsForOwner = watch('isForOwner');

  useEffect(() => {
    document.title = 'Add Bill - Smart Society';
    fetchDefaultBuilding();
    fetchBlocks();
  }, []);

  useEffect(() => {
    if (selectedBlockId) {
      fetchFloors(selectedBlockId);
      setSelectedFloorId('');
      setValue('floor', '');
    } else {
      setFloors([]);
      setSelectedFloorId('');
    }
  }, [selectedBlockId, setValue]);

  useEffect(() => {
    if (selectedFloorId) {
      fetchUnits(selectedFloorId);
    } else if (selectedBlockId) {
      fetchUnitsByBlock(selectedBlockId);
    } else {
      setUnits([]);
    }
  }, [selectedFloorId, selectedBlockId]);

  const fetchDefaultBuilding = async () => {
    try {
      setLoadingBuilding(true);
      const societyId = getSocietyId();
      if (!societyId) {
        showMessage('Society ID not found. Please select a society first.', 'error');
        return;
      }

      const buildingResponse = await getBuildingApi(societyId);
      
      // Normalize building response to handle both 'item' (singular) and 'items' (plural) formats
      const buildings = normalizeBuildingResponse(buildingResponse);

      const activeBuilding = buildings.find((b: any) => b.status === 'active') || buildings[0];
      
      if (activeBuilding) {
        const buildingId = activeBuilding._id || activeBuilding.id;
        setDefaultBuildingId(buildingId);
      } else {
        showMessage('No building found for this society. Please create a building first.', 'error');
      }
    } catch (error: any) {
      console.error('Error fetching building:', error);
      showMessage('Failed to fetch building. Please ensure a building exists for this society.', 'error');
    } finally {
      setLoadingBuilding(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await getBlocksBySocietyApi({ limit: 500, status: 'active' });
      setBlocks(response.items || []);
    } catch (error: any) {
      console.error('Error fetching blocks:', error);
      showMessage('Failed to fetch blocks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async (blockId: string) => {
    try {
      setLoading(true);
      const response = await getFloorsApi({ block: blockId, limit: 500, status: 'active' });
      setFloors(response.items || []);
    } catch (error: any) {
      console.error('Error fetching floors:', error);
      showMessage('Failed to fetch floors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async (floorId: string) => {
    try {
      setLoading(true);
      const response = await getUnitsApi({ floor: floorId, limit: 500 });
      setUnits(response.items || []);
    } catch (error: any) {
      console.error('Error fetching units:', error);
      showMessage('Failed to fetch units', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsByBlock = async (blockId: string) => {
    try {
      setLoading(true);
      const response = await getUnitsApi({ block: blockId, limit: 500 });
      setUnits(response.items || []);
    } catch (error: any) {
      console.error('Error fetching units:', error);
      showMessage('Failed to fetch units', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockChange = (blockId: string) => {
    if (blockId === 'none' || !blockId) {
      setSelectedBlockId('');
      setValue('block', undefined);
      setSelectedUnits([]);
      setValue('units', []);
    } else {
      setSelectedBlockId(blockId);
      setValue('block', blockId);
      setSelectedUnits([]);
      setValue('units', []);
    }
  };

  const handleFloorChange = (floorId: string) => {
    if (floorId === 'none' || !floorId) {
      setSelectedFloorId('');
      setValue('floor', undefined);
      setSelectedUnits([]);
      setValue('units', []);
    } else {
      setSelectedFloorId(floorId);
      setValue('floor', floorId);
      setSelectedUnits([]);
      setValue('units', []);
    }
  };

  const handleUnitToggle = (unitId: string) => {
    const newSelectedUnits = selectedUnits.includes(unitId)
      ? selectedUnits.filter((id) => id !== unitId)
      : [...selectedUnits, unitId];
    setSelectedUnits(newSelectedUnits);
    setValue('units', newSelectedUnits);
  };

  const handleSelectAllUnits = () => {
    if (selectedUnits.length === units.length) {
      setSelectedUnits([]);
      setValue('units', []);
    } else {
      const allUnitIds = units.map((u) => u._id);
      setSelectedUnits(allUnitIds);
      setValue('units', allUnitIds);
    }
  };

  const onSubmit = async (data: BillFormData) => {
    try {
      if (!defaultBuildingId) {
        showMessage('Building ID not found. Please ensure a building exists for this society.', 'error');
        return;
      }

      if (!selectedUnits || selectedUnits.length === 0) {
        showMessage('Please select at least one unit', 'error');
        return;
      }

      setSubmitting(true);
      const payload = {
        title: data.title,
        description: data.description,
        billDate: data.billDate ? new Date(data.billDate).toISOString() : new Date().toISOString(),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString(),
        forMonth: data.forMonth,
        year: data.year,
        units: selectedUnits,
        block: selectedBlockId || undefined,
        floor: selectedFloorId || undefined,
        building: defaultBuildingId,
        amount: data.amount,
        lateFee: data.lateFee || 0,
        isForOwner: data.isForOwner || false,
        isPublished: data.isPublished || false,
      };

      await createBillApi(payload);
      showMessage('Bill created successfully', 'success');
      
      // Reset form
      reset({
        title: '',
        description: '',
        billDate: undefined,
        dueDate: undefined,
        forMonth: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: undefined,
        lateFee: 0,
        isForOwner: false,
        isPublished: false,
      });
      setSelectedUnits([]);
      setSelectedBlockId('');
      setSelectedFloorId('');
      setValue('block', undefined);
      setValue('floor', undefined);
      setValue('units', []);
    } catch (error: any) {
      console.error('Error creating bill:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create bill';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map((month) => ({
    value: month.toString(),
    label: new Date(2000, month - 1).toLocaleString('default', { month: 'long' }),
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-black">Add Maintenance Bill</h1>
          <p className="text-muted-foreground mt-1">Create a new maintenance bill for units</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="bg-primary-white">
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
            <CardDescription>Enter the bill information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Bill Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter bill name"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billDate">
                  Bill Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="billDate"
                  type="date"
                  {...register('billDate')}
                  className={errors.billDate ? 'border-red-500' : ''}
                />
                {errors.billDate && (
                  <p className="text-sm text-red-500">{errors.billDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                  className={errors.dueDate ? 'border-red-500' : ''}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="forMonth">For Month</Label>
                <Select
                  value={watch('forMonth')?.toString() || undefined}
                  onValueChange={(val) => {
                    if (val) {
                      setValue('forMonth', parseInt(val));
                    } else {
                      setValue('forMonth', undefined);
                    }
                  }}
                >
                  <SelectTrigger className="bg-primary-white opacity-100">
                    <SelectValue placeholder="Select month (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">
                  Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="year"
                  type="number"
                  {...register('year', { valueAsNumber: true })}
                  min="2020"
                  max="2100"
                  className={errors.year ? 'border-red-500' : ''}
                />
                {errors.year && (
                  <p className="text-sm text-red-500">{errors.year.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Bill Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter bill description (optional)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block">Select Block</Label>
                <Select value={selectedBlockId || undefined} onValueChange={handleBlockChange}>
                  <SelectTrigger className="bg-primary-white opacity-100">
                    <SelectValue placeholder="Select block (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks.map((block) => (
                      <SelectItem key={block._id} value={block._id}>
                        {block.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Select Floor</Label>
                <Select
                  value={selectedFloorId || undefined}
                  onValueChange={handleFloorChange}
                  disabled={!selectedBlockId}
                >
                  <SelectTrigger className="bg-primary-white opacity-100">
                    <SelectValue placeholder="Select floor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor._id} value={floor._id}>
                        {floor.name || `Floor ${floor.number}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="units">
                  Select Units <span className="text-red-500">*</span>
                </Label>
                {units.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllUnits}
                  >
                    {selectedUnits.length === units.length ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {units.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {selectedBlockId
                      ? 'No units found. Please select a block and floor.'
                      : 'Please select a block to view units.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {units.map((unit) => (
                      <div key={unit._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={unit._id}
                          checked={selectedUnits.includes(unit._id)}
                          onCheckedChange={() => handleUnitToggle(unit._id)}
                        />
                        <Label
                          htmlFor={unit._id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {unit.unitNumber}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.units && (
                <p className="text-sm text-red-500">{errors.units.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Bill Amount <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="Enter bill amount"
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                  <p className="text-sm text-red-500">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lateFee">Late Fee</Label>
                <Input
                  id="lateFee"
                  type="number"
                  step="0.01"
                  {...register('lateFee', { valueAsNumber: true })}
                  placeholder="Enter late fee"
                  defaultValue={0}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isForOwner"
                  checked={watchIsForOwner}
                  onCheckedChange={(checked) => setValue('isForOwner', checked === true)}
                />
                <Label htmlFor="isForOwner" className="cursor-pointer font-medium">
                  This bill is for Owner
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {watchIsForOwner
                  ? 'Bill will be assigned to the unit owner'
                  : 'Bill will be assigned to the tenant (if tenant exists)'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={watch('isPublished')}
                onCheckedChange={(checked) => setValue('isPublished', checked === true)}
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Publish bill immediately
              </Label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset({
                    title: '',
                    description: '',
                    billDate: undefined,
                    dueDate: undefined,
                    forMonth: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    amount: undefined,
                    lateFee: 0,
                    isForOwner: false,
                    isPublished: false,
                  });
                  setSelectedUnits([]);
                  setSelectedBlockId('');
                  setSelectedFloorId('');
                  setValue('block', undefined);
                  setValue('floor', undefined);
                  setValue('units', []);
                }}
                disabled={submitting}
              >
                Reset
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !defaultBuildingId}
                className="bg-primary-black hover:bg-gray-800 text-white"
              >
                {submitting ? (
                  <>
                    <span className="mr-2">Creating...</span>
                  </>
                ) : (
                  <>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add Bill
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};
