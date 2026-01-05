import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertPuppySchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Camera, X, Plus } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useState, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Puppy, InsertPuppy, ParentDog, Litter, InsertLitter } from "@shared/schema";
import { z } from "zod";
import type { UploadResult } from "@uppy/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const puppyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  gender: z.enum(["male", "female"]),
  litterId: z.string().min(1, "Litter is required"), // Now required
  description: z.string().optional(),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  status: z.enum(["available", "reserved", "sold"]).default("available"),
  photos: z.array(z.string()).default([]),
  healthTesting: z.string().optional(),
  microchipId: z.string().optional(),
});

type PuppyFormData = z.infer<typeof puppyFormSchema>;

interface PuppyFormProps {
  puppy?: Puppy | null;
  onClose: () => void;
}

export default function PuppyForm({ puppy, onClose }: PuppyFormProps) {
  const { toast } = useToast();
  const [showAddParentDialog, setShowAddParentDialog] = useState(false);
  const [newParentType, setNewParentType] = useState<'dam' | 'sire'>('dam');
  const [newParentName, setNewParentName] = useState('');
  const [showAddLitterDialog, setShowAddLitterDialog] = useState(false);
  const [newLitterName, setNewLitterName] = useState('');
  const [newLitterDateOfBirth, setNewLitterDateOfBirth] = useState('');
  const [newLitterDamId, setNewLitterDamId] = useState('');
  const [newLitterSireId, setNewLitterSireId] = useState('');

  // Fetch parent dogs
  const { data: parentDogs = [], refetch: refetchParentDogs } = useQuery({
    queryKey: ['/api/admin/parent-dogs'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/parent-dogs");
      return response.json() as Promise<ParentDog[]>;
    },
  });

  // Fetch litters
  const { data: litters = [], refetch: refetchLitters, error: littersError } = useQuery({
    queryKey: ['/api/admin/litters'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/litters");
      const data = await response.json() as Litter[];
      console.log('Litters data:', data);
      return data;
    },
  });

  // Mutation for creating new parent dog
  const createParentMutation = useMutation({
    mutationFn: async (parentData: { name: string; gender: 'male' | 'female' }) => {
      const response = await apiRequest("POST", "/api/admin/parent-dogs", {
        name: parentData.name,
        gender: parentData.gender,
        color: "Unknown", // Default color, can be edited later
        dateOfBirth: new Date("2020-01-01"), // Default date, can be edited later
        status: "active",
      });
      return response.json() as Promise<ParentDog>;
    },
    onSuccess: (newParent) => {
      refetchParentDogs();
      setShowAddParentDialog(false);
      setNewParentName('');
      
      // Auto-select the newly created parent in litter form
      if (newParentType === 'dam') {
        setNewLitterDamId(newParent.id);
      } else {
        setNewLitterSireId(newParent.id);
      }
      
      toast({
        title: "Success",
        description: `${newParent.name} added as ${newParentType}`,
      });
    },
    onError: (error) => {
      console.error("Error creating parent dog:", error);
      toast({
        title: "Error",
        description: "Failed to create parent dog",
        variant: "destructive",
      });
    },
  });

  // Mutation for creating new litter
  const createLitterMutation = useMutation({
    mutationFn: async (litterData: InsertLitter) => {
      const response = await apiRequest("POST", "/api/admin/litters", litterData);
      return response;
    },
    onSuccess: async (response) => {
      const newLitter = await response.json() as Litter;
      refetchLitters();
      setShowAddLitterDialog(false);
      setNewLitterName('');
      setNewLitterDateOfBirth('');
      setNewLitterDamId('');
      setNewLitterSireId('');
      
      // Auto-select the newly created litter
      form.setValue("litterId", newLitter.id);
      
      toast({
        title: "Success",
        description: `Litter "${newLitter.name}" created successfully`,
      });
    },
    onError: (error) => {
      console.error("Error creating litter:", error);
      toast({
        title: "Error",
        description: "Failed to create litter",
        variant: "destructive",
      });
    },
  });

  // Handle photo upload completion
  const handlePhotoUpload = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFiles = result.successful;
      const newPhotoUrls: string[] = [];
      
      for (const uploadedFile of uploadedFiles) {
        const uploadURL = uploadedFile.uploadURL;
        if (uploadURL) {
          try {
            // Set ACL policy for the uploaded object
            await apiRequest("PUT", "/api/gallery-photos", {
              photoURL: uploadURL,
            });
            newPhotoUrls.push(uploadURL);
          } catch (error) {
            console.error("Error setting photo ACL:", error);
            toast({
              title: "Upload Warning",
              description: "Photo uploaded but may not be publicly accessible",
              variant: "destructive",
            });
          }
        }
      }
      
      // Convert GCS URLs to object paths and add to form
      const normalizedUrls = newPhotoUrls.map(url => {
        if (url.includes('storage.googleapis.com')) {
          const matches = url.match(/\/\.private\/uploads\/([^?]+)/);
          if (matches) {
            return `/objects/uploads/${matches[1]}`;
          }
        }
        return url;
      });
      
      const currentPhotos = (form.getValues("photos") as string[]) || [];
      const updatedPhotos = [...currentPhotos, ...normalizedUrls];
      form.setValue("photos", updatedPhotos);
      
      toast({
        title: "Success",
        description: `${newPhotoUrls.length} photo(s) uploaded successfully`,
      });
    } else {
      toast({
        title: "Upload Failed",
        description: "No files were uploaded successfully",
        variant: "destructive",
      });
    }
  };

  // Remove photo from the list
  const removePhoto = (index: number) => {
    const currentPhotos = (form.getValues("photos") as string[]) || [];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    form.setValue("photos", updatedPhotos);
  };

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get upload URL",
        variant: "destructive",
      });
      throw error;
    }
  };

  const form = useForm<PuppyFormData>({
    resolver: zodResolver(puppyFormSchema),
    defaultValues: {
      name: puppy?.name || "",
      color: puppy?.color || "",
      gender: puppy?.gender || "male",
      description: puppy?.description || "",
      priceMin: puppy?.priceMin ? (puppy.priceMin / 100).toString() : "",
      priceMax: puppy?.priceMax ? (puppy.priceMax / 100).toString() : "",
      status: puppy?.status || "available",
      photos: puppy?.photos || [],
      litterId: puppy?.litterId || "",
      healthTesting: puppy?.healthTesting || "",
      microchipId: puppy?.microchipId || "",
    },
  });

  // Update form when puppy data changes (especially important for photos)
  useEffect(() => {
    if (puppy) {
      form.reset({
        name: puppy.name || "",
        color: puppy.color || "",
        gender: puppy.gender || "male",
        description: puppy.description || "",
        priceMin: puppy.priceMin ? (puppy.priceMin / 100).toString() : "",
        priceMax: puppy.priceMax ? (puppy.priceMax / 100).toString() : "",
        status: puppy.status || "available",
        photos: puppy.photos || [],
        litterId: puppy.litterId || "",
        healthTesting: puppy.healthTesting || "",
        microchipId: puppy.microchipId || "",
      });
    }
  }, [puppy, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertPuppy) => {
      await apiRequest("POST", "/api/admin/puppies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/puppies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/puppies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "Success",
        description: "Puppy created successfully",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create puppy",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertPuppy) => {
      await apiRequest("PUT", `/api/admin/puppies/${puppy!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/puppies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/puppies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statistics"] });
      toast({
        title: "Success",
        description: "Puppy updated successfully",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update puppy",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PuppyFormData) => {
    const submitData: InsertPuppy = {
      name: data.name,
      color: data.color,
      gender: data.gender,
      description: data.description || null,
      priceMin: data.priceMin ? Math.round(parseFloat(data.priceMin) * 100) : undefined,
      priceMax: data.priceMax ? Math.round(parseFloat(data.priceMax) * 100) : undefined,
      status: data.status,
      photos: data.photos,
      litterId: data.litterId, // Now required
      healthTesting: data.healthTesting || null,
      microchipId: data.microchipId || null,
    };

    if (puppy) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Puppy name" 
                    {...field} 
                    data-testid="input-puppy-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Red, Apricot & Cream, Black, Sable" 
                    {...field}
                    data-testid="input-puppy-color"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-puppy-gender">
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
        </div>

        {/* Litter Information */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Litter Information</h3>
          <FormField
            control={form.control}
            name="litterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Litter</FormLabel>
                <div className="flex gap-2">
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-litter">
                        <SelectValue placeholder="Select a litter..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[300]">
                      {litters.length === 0 ? (
                        <SelectItem value="no-litters" disabled>
                          {littersError ? "Error loading litters" : "No litters available"}
                        </SelectItem>
                      ) : (
                        litters.map((litter) => (
                          <SelectItem key={litter.id} value={litter.id}>
                            {litter.name} ({new Date(litter.dateOfBirth).toLocaleDateString()})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddLitterDialog(true)}
                    data-testid="button-add-litter"
                  >
                    Add New
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="priceMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Price (AUD)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="2000.00" 
                      {...field}
                      data-testid="input-puppy-price-min"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priceMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Price (AUD)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="3000.00" 
                      {...field}
                      data-testid="input-puppy-price-max"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-puppy-status">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
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
                  rows={3}
                  placeholder="Describe the puppy's personality, traits, and characteristics..."
                  {...field}
                  data-testid="textarea-puppy-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dam and sire information is handled through litter selection */}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="healthTesting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Health Testing</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Embark DNA Testing Complete" 
                    {...field}
                    data-testid="input-puppy-health"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="microchipId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Microchip ID</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Microchip identification number" 
                    {...field}
                    data-testid="input-puppy-microchip"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Photo Upload Section */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Puppy Photos</h3>
          </div>
          
          {/* Display current photos */}
          {form.watch("photos").length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {form.watch("photos").map((photo, index) => {
                // Convert object URLs to public serving URLs for display
                const displayUrl = photo.startsWith('/objects/uploads/') 
                  ? photo.replace('/objects/uploads/', '/public-objects/uploads/')
                  : photo;
                  
                return (
                <div key={index} className="relative group">
                  <img
                    src={displayUrl}
                    alt={`Puppy photo ${index + 1}`}
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
                );
              })}
            </div>
          )}
          
          <ObjectUploader
            maxNumberOfFiles={5}
            maxFileSize={10485760} // 10MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handlePhotoUpload}
            buttonClassName="w-full bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
          >
            <Camera className="mr-2 h-4 w-4" />
            {form.watch("photos").length > 0 ? "Add More Photos" : "Add Photos"}
          </ObjectUploader>
        </div>

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel-puppy"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-save-puppy"
          >
            {puppy ? 'Update' : 'Create'} Puppy
          </Button>
        </div>
      </form>
    </Form>

    {/* Add Parent Dog Dialog */}
    <Dialog open={showAddParentDialog} onOpenChange={setShowAddParentDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New {newParentType === 'dam' ? 'Dam (Mother)' : 'Sire (Father)'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={newParentName}
              onChange={(e) => setNewParentName(e.target.value)}
              placeholder={`Enter ${newParentType} name`}
              data-testid="input-new-parent-name"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowAddParentDialog(false);
                setNewParentName('');
              }}
              data-testid="button-cancel-add-parent"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (newParentName.trim()) {
                  createParentMutation.mutate({
                    name: newParentName.trim(),
                    gender: newParentType === 'dam' ? 'female' : 'male',
                  });
                }
              }}
              disabled={!newParentName.trim() || createParentMutation.isPending}
              data-testid="button-save-new-parent"
            >
              {createParentMutation.isPending ? 'Adding...' : 'Add Parent'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Add New Litter Dialog */}
    <Dialog open={showAddLitterDialog} onOpenChange={setShowAddLitterDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Litter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Litter Name *</label>
            <Input
              placeholder="e.g., Pippa x Po Litter, Spring 2024 Litter"
              value={newLitterName}
              onChange={(e) => setNewLitterName(e.target.value)}
              data-testid="input-new-litter-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Date of Birth *</label>
            <Input
              type="date"
              value={newLitterDateOfBirth}
              onChange={(e) => setNewLitterDateOfBirth(e.target.value)}
              data-testid="input-new-litter-dob"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Dam (Mother)</label>
            <div className="flex gap-2">
              <Select onValueChange={setNewLitterDamId} value={newLitterDamId}>
                <SelectTrigger data-testid="select-new-litter-dam">
                  <SelectValue placeholder="Select dam..." />
                </SelectTrigger>
                <SelectContent>
                  {parentDogs.filter(dog => dog.gender === 'female').map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setNewParentType('dam');
                  setShowAddParentDialog(true);
                }}
                data-testid="button-add-dam-litter"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Sire (Father)</label>
            <div className="flex gap-2">
              <Select onValueChange={setNewLitterSireId} value={newLitterSireId}>
                <SelectTrigger data-testid="select-new-litter-sire">
                  <SelectValue placeholder="Select sire..." />
                </SelectTrigger>
                <SelectContent>
                  {parentDogs.filter(dog => dog.gender === 'male').map((dog) => (
                    <SelectItem key={dog.id} value={dog.id}>
                      {dog.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setNewParentType('sire');
                  setShowAddParentDialog(true);
                }}
                data-testid="button-add-sire-litter"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddLitterDialog(false)}
              data-testid="button-cancel-new-litter"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!newLitterName || !newLitterDateOfBirth) {
                  toast({
                    title: "Error",
                    description: "Please fill in required fields",
                    variant: "destructive",
                  });
                  return;
                }
                
                createLitterMutation.mutate({
                  name: newLitterName,
                  dateOfBirth: new Date(newLitterDateOfBirth),
                  damId: newLitterDamId || null,
                  sireId: newLitterSireId || null,
                  isActive: true,
                });
              }}
              disabled={createLitterMutation.isPending}
              data-testid="button-create-litter"
            >
              {createLitterMutation.isPending ? "Creating..." : "Create Litter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
