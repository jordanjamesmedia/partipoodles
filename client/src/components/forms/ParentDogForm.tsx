import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { insertParentDogSchema, type InsertParentDog, type ParentDog } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2, Upload, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import type { UploadResult } from '@uppy/core';
import { ObjectUploader } from "@/components/ObjectUploader";

interface ParentDogFormProps {
  parentDog?: ParentDog;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  registeredName: string;
  gender: "male" | "female";
  color: string;
  dateOfBirth: Date | null | undefined;
  weight: number | null;
  height: number | null;
  status: "active" | "retired" | "planned";
  description: string;
  healthTesting: string;
  achievements: string;
  pedigree: string;
  photos: string[];
}

function convertToPublicUrl(url: string): string {
  // Convert /objects/uploads/ to /public-objects/uploads/ for proper serving
  if (url.startsWith('/objects/uploads/')) {
    return url.replace('/objects/uploads/', '/public-objects/uploads/');
  }
  
  // If it's a full GCS URL, convert it
  if (url.includes('storage.googleapis.com')) {
    const matches = url.match(/\/\.private\/uploads\/([^?]+)/);
    if (matches) {
      return `/public-objects/uploads/${matches[1]}`;
    }
  }
  
  return url;
}

export default function ParentDogForm({ parentDog, onSuccess }: ParentDogFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(parentDog?.photos || []);

  const form = useForm<FormData>({
    resolver: zodResolver(insertParentDogSchema),
    defaultValues: {
      name: parentDog?.name || "",
      registeredName: parentDog?.registeredName || "",
      gender: parentDog?.gender || "male",
      color: parentDog?.color || "",
      dateOfBirth: parentDog?.dateOfBirth ? new Date(parentDog.dateOfBirth) : undefined,
      weight: parentDog?.weight || null,
      height: parentDog?.height || null,
      status: parentDog?.status || "active",
      description: parentDog?.description || "",
      healthTesting: parentDog?.healthTesting || "",
      achievements: parentDog?.achievements || "",
      pedigree: parentDog?.pedigree || "",
      photos: uploadedPhotos,
    }
  });

  // Update form when photos change
  useEffect(() => {
    form.setValue('photos', uploadedPhotos);
  }, [uploadedPhotos, form]);

  const createMutation = useMutation({
    mutationFn: (data: InsertParentDog) => apiRequest('POST', '/api/admin/parent-dogs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/parent-dogs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parent-dogs'] });
      toast({ title: "Success", description: "Parent dog created successfully!" });
      form.reset();
      setUploadedPhotos([]);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create parent dog",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InsertParentDog>) => 
      apiRequest('PUT', `/api/admin/parent-dogs/${parentDog!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/parent-dogs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/parent-dogs'] });
      toast({ title: "Success", description: "Parent dog updated successfully!" });
      console.log('Update successful, calling onSuccess callback');
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update parent dog",
        variant: "destructive" 
      });
    },
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleGetUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      throw error;
    }
  };

  const handleUploadComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      // Extract object path from the upload URL
      let objectPath = '';
      if (uploadURL && typeof uploadURL === 'string') {
        try {
          const url = new URL(uploadURL);
          const pathSegments = url.pathname.split('/');
          // Find the bucket and extract the object path
          const bucketIndex = pathSegments.findIndex(segment => segment.startsWith('repl-default-bucket'));
          if (bucketIndex !== -1 && pathSegments[bucketIndex + 2] === 'uploads') {
            const objectId = pathSegments[bucketIndex + 3];
            objectPath = `/objects/uploads/${objectId}`;
          }
        } catch (e) {
          console.error('Error parsing upload URL:', e);
        }
      }

      if (objectPath) {
        setUploadedPhotos(prev => {
          const updated = [...prev, objectPath];
          form.setValue('photos', updated);
          return updated;
        });
        toast({
          title: "Success",
          description: "Photo uploaded successfully!",
        });
      } else {
        toast({
          title: "Warning",
          description: "Photo uploaded but path could not be determined",
          variant: "destructive"
        });
      }
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => {
      const updated = prev.filter((_, i) => i !== index);
      form.setValue('photos', updated);
      return updated;
    });
  };

  const onSubmit = (data: FormData) => {
    console.log('Form data before processing:', data);
    
    const submitData: InsertParentDog = {
      ...data,
      weight: data.weight || null,
      height: data.height || null,
      dateOfBirth: data.dateOfBirth ? data.dateOfBirth : null,
      photos: uploadedPhotos,
    };

    console.log('Submit data after processing:', submitData);

    if (parentDog) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Bella"
                      {...field} 
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registeredName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registered Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Champion Poodles Bella of Oak Grove"
                      {...field} 
                      data-testid="input-registered-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colour *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Black and White Parti"
                      {...field} 
                      data-testid="input-color"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value) : null;
                        console.log('Date input changed:', date);
                        field.onChange(date);
                      }}
                      data-testid="input-date-of-birth"
                      max={format(new Date(), "yyyy-MM-dd")}
                      min="1900-01-01"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.1"
                      placeholder="e.g., 22.5"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      data-testid="input-weight"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.1"
                      placeholder="e.g., 58.0"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      data-testid="input-height"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the parent dog's temperament, characteristics, etc..."
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                    data-testid="textarea-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="healthTesting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Testing</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Hip scores, eye clearances, genetic testing, etc..."
                    className="min-h-[80px]"
                    {...field}
                    value={field.value || ""}
                    data-testid="textarea-health-testing"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="achievements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Show Achievements</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Titles, awards, show results..."
                    className="min-h-[80px]"
                    {...field}
                    value={field.value || ""}
                    data-testid="textarea-achievements"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pedigree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pedigree Information</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Sire, Dam, notable ancestors..."
                    className="min-h-[80px]"
                    {...field}
                    value={field.value || ""}
                    data-testid="textarea-pedigree"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Photo Upload Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <FormLabel className="text-base font-semibold">Dog Photos</FormLabel>
            
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={convertToPublicUrl(photo)}
                      alt={`Parent dog photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-remove-photo-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <ObjectUploader
              maxNumberOfFiles={10}
              maxFileSize={10485760}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="w-full"
            >
              <div className="flex items-center justify-center gap-2 py-2">
                <Upload className="h-4 w-4" />
                <span>Upload Photos</span>
              </div>
            </ObjectUploader>

            <p className="text-sm text-gray-500">
              Upload up to 10 photos (max 10MB each). Supported formats: JPG, PNG, GIF
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              data-testid="button-save-parent-dog"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {parentDog ? "Update Parent Dog" : "Create Parent Dog"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}