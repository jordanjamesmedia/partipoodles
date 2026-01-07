import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Upload, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
import { z } from "zod";
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
  puppy?: any | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch parent dogs using Convex
  const parentDogs = useConvexQuery(api.parentDogs.list) || [];

  // Fetch litters using Convex
  const litters = useConvexQuery(api.litters.list) || [];
  const littersError = litters === undefined;

  // Convex mutations
  const createParentDog = useConvexMutation(api.parentDogs.create);
  const createLitter = useConvexMutation(api.litters.create);
  const createPuppy = useConvexMutation(api.puppies.create);
  const updatePuppy = useConvexMutation(api.puppies.update);
  const generateUploadUrl = useConvexMutation(api.files.generateUploadUrl);

  // Handle creating new parent dog
  const handleCreateParent = async (parentData: { name: string; gender: 'male' | 'female' }) => {
    try {
      const id = await createParentDog({
        name: parentData.name,
        gender: parentData.gender,
        color: "Unknown",
        date_of_birth: "2020-01-01",
        status: "active",
      });

      setShowAddParentDialog(false);
      setNewParentName('');

      // Auto-select the newly created parent in litter form
      if (newParentType === 'dam') {
        setNewLitterDamId(id as string);
      } else {
        setNewLitterSireId(id as string);
      }

      toast({
        title: "Success",
        description: `${parentData.name} added as ${newParentType}`,
      });
    } catch (error) {
      console.error("Error creating parent dog:", error);
      toast({
        title: "Error",
        description: "Failed to create parent dog",
        variant: "destructive",
      });
    }
  };

  // Handle creating new litter
  const handleCreateLitter = async (litterData: {
    name: string;
    dateOfBirth: Date;
    damId: string | null;
    sireId: string | null;
  }) => {
    try {
      const id = await createLitter({
        name: litterData.name,
        date_of_birth: litterData.dateOfBirth.toISOString().split('T')[0],
        dam_id: litterData.damId || undefined,
        sire_id: litterData.sireId || undefined,
        is_active: true,
      });

      setShowAddLitterDialog(false);
      setNewLitterName('');
      setNewLitterDateOfBirth('');
      setNewLitterDamId('');
      setNewLitterSireId('');

      // Auto-select the newly created litter
      form.setValue("litterId", id as string);

      toast({
        title: "Success",
        description: `Litter "${litterData.name}" created successfully`,
      });
    } catch (error) {
      console.error("Error creating litter:", error);
      toast({
        title: "Error",
        description: "Failed to create litter",
        variant: "destructive",
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Get upload URL from Convex
        const uploadUrl = await generateUploadUrl();

        // Upload file to Convex storage
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const { storageId } = await response.json();

        // Add storage ID to photos array
        const currentPhotos = (form.getValues("photos") as string[]) || [];
        form.setValue("photos", [...currentPhotos, storageId]);

        toast({
          title: "Success",
          description: `${file.name} uploaded successfully!`,
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove photo from the list
  const removePhoto = (index: number) => {
    const currentPhotos = (form.getValues("photos") as string[]) || [];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index);
    form.setValue("photos", updatedPhotos);
  };

  // Helper to get display URL for photos
  const getPhotoDisplayUrl = (photo: string) => {
    if (photo.startsWith('https://') || photo.startsWith('http://')) {
      return photo;
    }
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e0e0e0" width="100" height="100"/><text fill="%23666" font-size="10" x="50%" y="50%" text-anchor="middle" dy=".3em">Uploaded</text></svg>';
  };

  const form = useForm<PuppyFormData>({
    resolver: zodResolver(puppyFormSchema),
    defaultValues: {
      name: puppy?.name || "",
      color: puppy?.color || "",
      gender: puppy?.gender || "male",
      description: puppy?.description || "",
      priceMin: puppy?.price_min ? (puppy.price_min / 100).toString() : "",
      priceMax: puppy?.price_max ? (puppy.price_max / 100).toString() : "",
      status: puppy?.status || "available",
      photos: puppy?.photos || [],
      litterId: puppy?.litter_id || "",
      healthTesting: puppy?.health_testing || "",
      microchipId: puppy?.microchip_id || "",
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
        priceMin: puppy.price_min ? (puppy.price_min / 100).toString() : "",
        priceMax: puppy.price_max ? (puppy.price_max / 100).toString() : "",
        status: puppy.status || "available",
        photos: puppy.photos || [],
        litterId: puppy.litter_id || "",
        healthTesting: puppy.health_testing || "",
        microchipId: puppy.microchip_id || "",
      });
    }
  }, [puppy, form]);

  const onSubmit = async (data: PuppyFormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        name: data.name,
        color: data.color,
        gender: data.gender,
        description: data.description || undefined,
        price_min: data.priceMin ? Math.round(parseFloat(data.priceMin) * 100) : undefined,
        price_max: data.priceMax ? Math.round(parseFloat(data.priceMax) * 100) : undefined,
        status: data.status,
        photos: data.photos,
        litter_id: data.litterId as Id<"litters">,
        health_testing: data.healthTesting || undefined,
        microchip_id: data.microchipId || undefined,
      };

      if (puppy) {
        await updatePuppy({
          id: puppy._id as Id<"puppies">,
          ...submitData,
        });
        toast({
          title: "Success",
          description: "Puppy updated successfully",
        });
      } else {
        await createPuppy(submitData);
        toast({
          title: "Success",
          description: "Puppy created successfully",
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving puppy:", error);
      toast({
        title: "Error",
        description: puppy ? "Failed to update puppy" : "Failed to create puppy",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                  <SelectContent className="z-[300]">
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
                        litters.map((litter: any) => (
                          <SelectItem key={litter._id} value={litter._id}>
                            {litter.name} ({litter.date_of_birth ? new Date(litter.date_of_birth).toLocaleDateString() : 'No date'})
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
                  <SelectContent className="z-[300]">
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
                return (
                <div key={index} className="relative group">
                  <img
                    src={getPhotoDisplayUrl(photo)}
                    alt={`Puppy photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e0e0e0" width="100" height="100"/><text fill="%23666" font-size="10" x="50%" y="50%" text-anchor="middle" dy=".3em">Photo</text></svg>';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-remove-photo-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                    Photo {index + 1}
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {/* File upload input */}
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="puppy-photo-upload"
              data-testid="input-photo-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
              data-testid="button-upload-photo"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photos
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500">
              Select one or more photos to upload. Supported formats: JPG, PNG, GIF, WebP.
            </p>
          </div>
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
            disabled={isSubmitting || isUploading}
            data-testid="button-save-puppy"
          >
            {isSubmitting ? 'Saving...' : (puppy ? 'Update' : 'Create')} Puppy
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
                  handleCreateParent({
                    name: newParentName.trim(),
                    gender: newParentType === 'dam' ? 'female' : 'male',
                  });
                }
              }}
              disabled={!newParentName.trim()}
              data-testid="button-save-new-parent"
            >
              Add Parent
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
                <SelectContent className="z-[400]">
                  {parentDogs.filter((dog: any) => dog.gender === 'female').map((dog: any) => (
                    <SelectItem key={dog._id} value={dog._id}>
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
                <SelectContent className="z-[400]">
                  {parentDogs.filter((dog: any) => dog.gender === 'male').map((dog: any) => (
                    <SelectItem key={dog._id} value={dog._id}>
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

                handleCreateLitter({
                  name: newLitterName,
                  dateOfBirth: new Date(newLitterDateOfBirth),
                  damId: newLitterDamId || null,
                  sireId: newLitterSireId || null,
                });
              }}
              data-testid="button-create-litter"
            >
              Create Litter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
