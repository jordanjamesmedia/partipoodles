import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { z } from "zod";

// Form validation schema
const parentDogFormSchema = z.object({
  name: z.string().min(1, "Call name is required"),
  registeredName: z.string().optional(),
  gender: z.enum(["male", "female"]),
  color: z.string().min(1, "Color is required"),
  dateOfBirth: z.string().optional(),
  weight: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  status: z.enum(["active", "retired", "planned"]),
  description: z.string().optional(),
  healthTesting: z.string().optional(),
  achievements: z.string().optional(),
  pedigree: z.string().optional(),
  photos: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof parentDogFormSchema>;

interface ParentDogFormProps {
  parentDog?: {
    id: Id<"parent_dogs">;
    name: string;
    registeredName?: string | null;
    gender: "male" | "female";
    color: string;
    dateOfBirth?: Date | null;
    weight?: number | null;
    height?: number | null;
    status: string;
    description?: string | null;
    healthTesting?: string | null;
    achievements?: string | null;
    pedigree?: string | null;
    photos?: string[];
  };
  onSuccess?: () => void;
}

export default function ParentDogForm({ parentDog, onSuccess }: ParentDogFormProps) {
  const { toast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(parentDog?.photos || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex mutations
  const createParentDog = useMutation(api.parentDogs.create);
  const updateParentDog = useMutation(api.parentDogs.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const form = useForm<FormData>({
    resolver: zodResolver(parentDogFormSchema),
    defaultValues: {
      name: parentDog?.name || "",
      registeredName: parentDog?.registeredName || "",
      gender: parentDog?.gender || "male",
      color: parentDog?.color || "",
      dateOfBirth: parentDog?.dateOfBirth ? format(parentDog.dateOfBirth, "yyyy-MM-dd") : "",
      weight: parentDog?.weight || null,
      height: parentDog?.height || null,
      status: (parentDog?.status as "active" | "retired" | "planned") || "active",
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
        setUploadedPhotos(prev => [...prev, storageId]);

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

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => {
      const updated = prev.filter((_, i) => i !== index);
      form.setValue('photos', updated);
      return updated;
    });
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const submitData = {
        name: data.name,
        registered_name: data.registeredName || undefined,
        gender: data.gender,
        color: data.color,
        date_of_birth: data.dateOfBirth || undefined,
        description: data.description || undefined,
        photos: uploadedPhotos,
        status: data.status,
        health_testing: data.healthTesting || undefined,
        achievements: data.achievements || undefined,
        pedigree: data.pedigree || undefined,
        weight: data.weight || undefined,
        height: data.height || undefined,
      };

      if (parentDog) {
        await updateParentDog({
          id: parentDog.id,
          ...submitData,
        });
        toast({ title: "Success", description: "Parent dog updated successfully!" });
      } else {
        await createParentDog(submitData);
        toast({ title: "Success", description: "Parent dog created successfully!" });
        form.reset();
        setUploadedPhotos([]);
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving parent dog:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save parent dog",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get display URL for photos (handles both storage IDs and full URLs)
  const getPhotoDisplayUrl = (photo: string) => {
    // If it's already a full URL, use it
    if (photo.startsWith('https://') || photo.startsWith('http://')) {
      return photo;
    }
    // For storage IDs, they'll be resolved by the Convex query when displayed
    // For preview in the form, we can't resolve them client-side, so show placeholder
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e0e0e0" width="100" height="100"/><text fill="%23666" font-size="10" x="50%" y="50%" text-anchor="middle" dy=".3em">Uploaded</text></svg>';
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
                  <FormLabel>Registered Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Champion Poodles Bella of Oak Grove"
                      {...field}
                      value={field.value || ""}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-gender">
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
                      {...field}
                      value={field.value || ""}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[300]">
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
                      value={field.value ?? ""}
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
                      value={field.value ?? ""}
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
                      src={getPhotoDisplayUrl(photo)}
                      alt={`Parent dog photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23e0e0e0" width="100" height="100"/><text fill="%23666" font-size="10" x="50%" y="50%" text-anchor="middle" dy=".3em">Photo %23' + (index + 1) + '</text></svg>';
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
                ))}
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
                id="photo-upload"
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
              <p className="text-sm text-gray-500">
                Select one or more photos to upload. Supported formats: JPG, PNG, GIF, WebP.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1"
              data-testid="button-save-parent-dog"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {parentDog ? "Update Parent Dog" : "Create Parent Dog"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
