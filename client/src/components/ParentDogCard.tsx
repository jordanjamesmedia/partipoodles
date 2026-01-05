import { Calendar, Award, Heart } from "lucide-react";

// Support both Convex (snake_case) and legacy (camelCase) field names
interface ParentDogData {
  _id?: string;
  id?: string;
  name: string;
  registered_name?: string | null;
  registeredName?: string | null;
  color?: string | null;
  gender: string;
  date_of_birth?: string | null;
  dateOfBirth?: string | Date | null;
  description?: string | null;
  photos?: string[] | null;
  status: string;
  health_testing?: string | null;
  healthTesting?: string | null;
  achievements?: string | null;
  weight?: number | null;
  height?: number | null;
}

interface ParentDogCardProps {
  parentDog: ParentDogData;
}

export default function ParentDogCard({ parentDog }: ParentDogCardProps) {
  // Normalize field names (support both snake_case and camelCase)
  const dogId = parentDog._id || parentDog.id || '';
  const registeredName = parentDog.registered_name || parentDog.registeredName;
  const dateOfBirth = parentDog.date_of_birth || parentDog.dateOfBirth;
  const healthTesting = parentDog.health_testing || parentDog.healthTesting;
  const color = parentDog.color || '';
  const status = parentDog.status || 'active';

  // Convert storage URL to serving endpoint with compression support
  const convertToPublicUrl = (storageUrl: string, options?: {
    quality?: number;
    width?: number;
    height?: number;
  }) => {
    let publicUrl = storageUrl;
    
    // Convert /objects/uploads/ to /public-objects/uploads/ for proper serving
    if (storageUrl.startsWith('/objects/uploads/')) {
      publicUrl = storageUrl.replace('/objects/uploads/', '/public-objects/uploads/');
    } else if (storageUrl.includes('storage.googleapis.com')) {
      const matches = storageUrl.match(/\/\.private\/uploads\/([^?]+)/);
      if (matches) {
        publicUrl = `/public-objects/uploads/${matches[1]}`;
      }
    }
    
    // Add compression parameters for better performance
    if (options && (options.quality || options.width || options.height)) {
      const params = new URLSearchParams();
      
      if (options.quality && options.quality !== 80) {
        params.append('quality', options.quality.toString());
      }
      if (options.width) {
        params.append('width', options.width.toString());
      }
      if (options.height) {
        params.append('height', options.height.toString());
      }
      
      if (params.toString()) {
        publicUrl += `?${params.toString()}`;
      }
    }
    
    return publicUrl;
  };

  // Use first photo if available with compression for card display
  const mainPhoto = parentDog.photos && parentDog.photos.length > 0 
    ? convertToPublicUrl(parentDog.photos[0], { width: 400, quality: 75 })
    : null;

  const formatWeight = (weightInGrams: number | null) => {
    if (!weightInGrams) return "Weight not recorded";
    const kg = (weightInGrams / 1000).toFixed(1);
    return `${kg} kg`;
  };

  const formatHeight = (heightInCm: number | null) => {
    if (!heightInCm) return "Height not recorded";
    return `${heightInCm} cm`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800';
      case 'retired':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800';
      case 'planned':
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800';
      default:
        return 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active Breeder';
      case 'retired':
        return 'Retired';
      case 'planned':
        return 'Future Breeder';
      default:
        return status;
    }
  };

  return (
    <div className="parent-dog-card border border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white" data-testid={`parent-dog-card-${dogId}`}>
      {mainPhoto && (
        <div className="relative">
          <img 
            src={mainPhoto}
            alt={`${parentDog.name} - ${color} ${parentDog.gender}`}
            className="w-full h-64 object-cover"
            data-testid={`parent-dog-image-${dogId}`}
          />
          <div className="absolute top-4 left-4">
            <span className={getStatusBadgeClass(status)} data-testid={`parent-dog-status-${dogId}`}>
              {getStatusText(status)}
            </span>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {!mainPhoto && (
          <div className="mb-4">
            <span className={getStatusBadgeClass(status)} data-testid={`parent-dog-status-${dogId}`}>
              {getStatusText(status)}
            </span>
          </div>
        )}
        <div className="mb-2">
          <h3 className="text-2xl font-serif font-bold text-gray-800" data-testid={`parent-dog-name-${dogId}`}>
            {parentDog.name}
          </h3>
          {registeredName && (
            <p className="text-sm text-gray-600 italic" data-testid={`parent-dog-registered-name-${dogId}`}>
              Registered: {registeredName}
            </p>
          )}
        </div>
        
        <div className="text-lg font-medium text-primary mb-4" data-testid={`parent-dog-color-${dogId}`}>
          {color} {parentDog.gender === 'male' ? 'Male' : 'Female'}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
          {dateOfBirth && (
            <div className="flex items-center" data-testid={`parent-dog-dob-${dogId}`}>
              <Calendar className="mr-1 h-4 w-4" />
              Born {new Date(dateOfBirth).toLocaleDateString('en-AU', {
                month: 'short',
                year: 'numeric'
              })}
            </div>
          )}
          <div className="flex items-center" data-testid={`parent-dog-weight-${dogId}`}>
            <Heart className="mr-1 h-4 w-4" />
            {formatWeight(parentDog.weight ?? null)}
          </div>
        </div>
        
        {parentDog.description && (
          <p className="text-gray-600 mb-4 line-clamp-3" data-testid={`parent-dog-description-${dogId}`}>
            {parentDog.description}
          </p>
        )}
        
        {parentDog.achievements && (
          <div className="flex items-start mb-4">
            <Award className="mr-2 h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 line-clamp-2" data-testid={`parent-dog-achievements-${dogId}`}>
              {parentDog.achievements}
            </p>
          </div>
        )}
        
        {healthTesting && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 mb-1">Health Testing</h4>
            <p className="text-sm text-green-700" data-testid={`parent-dog-health-${dogId}`}>
              {healthTesting}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}