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
import { getBlocksApi, Block } from '@/apis/block';
import { getFloorsApi, Floor } from '@/apis/floor';
import { getUnitsApi, Unit } from '@/apis/unit';
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
  amount: Yup.number().min(0),
  amountForOwner: Yup.number().min(0),
  amountForTenant: Yup.number().min(0),
  lateFee: Yup.number().min(0).default(0),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BillFormData>({
    resolver: yupResolver(billSchema),
    defaultValues: {
      isPublished: false,
      lateFee: 0,
      forMonth: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  });

  const watchAmountForOwner = watch('amountForOwner');
  const watchAmountForTenant = watch('amountForTenant');
  const watchAmount = watch('amount');

  useEffect(() => {
    document.title = 'Add Bill - Smart Society';
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

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const response = await getBlocksApi({ limit: 500, status: 'active' });
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
      const response = await getFloorsApi({ block: blockId, limit: 500 });
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
      setSubmitting(true);
      const payload = {
        ...data,
        units: selectedUnits,
        block: selectedBlockId || undefined,
        floor: selectedFloorId || undefined,
      };

      await createBillApi(payload);
      showMessage('Bill created successfully', 'success');
      
      // Reset form
      setSelectedUnits([]);
      setSelectedBlockId('');
      setSelectedFloorId('');
      setValue('title', '');
      setValue('description', '');
      setValue('amount', undefined);
      setValue('amountForOwner', undefined);
      setValue('amountForTenant', undefined);
      setValue('lateFee', 0);
      setValue('isPublished', false);
    } catch (error: any) {
      console.error('Error creating bill:', error);
      showMessage(error.message || 'Failed to create bill', 'error');
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
          <h1 className="text-3xl font-bold">Add Bill</h1>
          <p className="text-muted-foreground mt-1">Create a new maintenance bill</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
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
                  <SelectTrigger>
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
                placeholder="Enter bill description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block">Select Block</Label>
                <Select value={selectedBlockId || undefined} onValueChange={handleBlockChange}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                <Label htmlFor="amount">Total Bill Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="Enter total amount"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty if using owner/tenant amounts
                </p>
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
              <h3 className="text-lg font-semibold">Bill for</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amountForOwner">Amount for Owner</Label>
                  <Input
                    id="amountForOwner"
                    type="number"
                    step="0.01"
                    {...register('amountForOwner', { valueAsNumber: true })}
                    placeholder="Enter amount for owner"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amountForTenant">Amount for Tenant</Label>
                  <Input
                    id="amountForTenant"
                    type="number"
                    step="0.01"
                    {...register('amountForTenant', { valueAsNumber: true })}
                    placeholder="Enter amount for tenant"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                If owner/tenant amounts are specified, they will be used instead of total amount
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

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedUnits([]);
                  setSelectedBlockId('');
                  setSelectedFloorId('');
                }}
              >
                Reset
              </Button>
              <Button type="submit" disabled={submitting}>
                <IconPlus className="h-4 w-4 mr-2" />
                {submitting ? 'Creating...' : 'Create Bill & Publish'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

