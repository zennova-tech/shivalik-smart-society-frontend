import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showMessage } from '@/utils/Constant';
import { createComplaintApi } from '@/apis/complaint';
import { IconPlus } from '@tabler/icons-react';

const complaintSchema = Yup.object().shape({
  category: Yup.string().required('Category is required'),
  location: Yup.string(),
  priority: Yup.string().oneOf(['low', 'medium', 'high', 'urgent']).default('medium'),
  description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
});

type ComplaintFormData = Yup.InferType<typeof complaintSchema>;

export const AddComplaintPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ComplaintFormData>({
    resolver: yupResolver(complaintSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const watchedPriority = watch('priority');
  const watchedCategory = watch('category');

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setSubmitting(true);
      const payload = {
        category: data.category,
        location: data.location || undefined,
        priority: (data.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        description: data.description,
      };

      await createComplaintApi(payload);
      showMessage('Complaint created successfully', 'success');
      
      // Reset form
      reset({
        category: '',
        location: '',
        priority: 'medium',
        description: '',
      });
      
      // Navigate back to complaints list
      navigate('/maintenance-bill/complaints');
    } catch (error: any) {
      console.error('Error creating complaint:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create complaint';
      showMessage(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    'Maintenance',
    'Security',
    'Cleaning',
    'Water Supply',
    'Electricity',
    'Parking',
    'Noise',
    'Other',
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-black">Raise Complaint</h1>
          <p className="text-muted-foreground mt-1">Create a new complaint</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
            <CardDescription>Enter the complaint information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watchedCategory || undefined}
                  onValueChange={(value) => setValue('category', value)}
                >
                  <SelectTrigger className="bg-primary-white opacity-100">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="e.g., A-101, Block B"
                  className={errors.location ? 'border-red-500' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={watchedPriority || 'medium'}
                  onValueChange={(value) => setValue('priority', value as any)}
                >
                  <SelectTrigger className="bg-primary-white opacity-100">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-500">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter complaint description"
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/maintenance-bill/complaints')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
                className="bg-primary-black hover:bg-gray-800 text-white"
              >
                {submitting ? (
                  <>
                    <span className="mr-2">Submitting...</span>
                  </>
                ) : (
                  <>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Submit Complaint
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

