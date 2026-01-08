import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Mail, Users, Images, Plus, Crown, Eye, Camera } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const puppies = useQuery(api.puppies.list);
  const litters = useQuery(api.litters.list);
  const inquiries = useQuery(api.inquiries.list);
  const customers = useQuery(api.customers.list);
  const galleryPhotos = useQuery(api.galleryPhotos.list);

  const statsLoading = puppies === undefined || inquiries === undefined || customers === undefined || galleryPhotos === undefined;
  const inquiriesLoading = inquiries === undefined;

  // Puppy stats
  const availablePuppies = puppies?.filter(p => p.status === "available").length || 0;
  const reservedPuppies = puppies?.filter(p => p.status === "reserved").length || 0;
  const soldPuppies = puppies?.filter(p => p.status === "sold").length || 0;

  // Other stats
  const pendingInquiries = inquiries?.filter(i => i.status === "new" || i.status === "pending").length || 0;
  const totalCustomers = customers?.length || 0;
  const totalGalleryPhotos = galleryPhotos?.length || 0;
  const publicPhotos = galleryPhotos?.filter(p => p.is_public).length || 0;
  const pendingPhotos = totalGalleryPhotos - publicPhotos;

  // Litter stats
  const activeLitters = litters?.filter(l => l.is_active !== false).length || 0;

  const recentInquiriesSlice = (inquiries || []).slice(0, 5);

  return (
    <AdminLayout>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8" data-testid="text-dashboard-title">Puppy Portal Overview</h1>
          
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Available Puppies</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-primary" data-testid="text-available-puppies">
                        {availablePuppies}
                      </p>
                    )}
                  </div>
                  <div className="bg-primary/20 p-3 rounded-lg">
                    <Heart className="text-primary h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Pending Inquiries</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-secondary" data-testid="text-pending-inquiries">
                        {pendingInquiries}
                      </p>
                    )}
                  </div>
                  <div className="bg-secondary/20 p-3 rounded-lg">
                    <Mail className="text-secondary h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Total Customers</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-green-600" data-testid="text-total-customers">
                        {totalCustomers}
                      </p>
                    )}
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="text-green-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">Photos in Gallery</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold text-purple-600" data-testid="text-gallery-photos">
                        {totalGalleryPhotos}
                      </p>
                    )}
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Images className="text-purple-600 h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
      {/* Quick Actions */}
      <Card className="mb-6 lg:mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/puppies">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Puppy
              </Button>
            </Link>
            <Link href="/admin/litters">
              <Button variant="outline">
                <Crown className="mr-2 h-4 w-4" />
                Manage Litters
              </Button>
            </Link>
            <Link href="/admin/inquiries">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                View Inquiries
                {pendingInquiries > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingInquiries}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/gallery">
              <Button variant="outline">
                <Camera className="mr-2 h-4 w-4" />
                Photo Gallery
                {pendingPhotos > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingPhotos} pending
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        {/* Recent Inquiries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Inquiries</CardTitle>
            <Link href="/admin/inquiries">
              <Button variant="ghost" size="sm">
                <Eye className="mr-1 h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {inquiriesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : recentInquiriesSlice.length > 0 ? (
              <div className="space-y-4">
                {recentInquiriesSlice.map((inquiry) => (
                  <div key={inquiry._id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-semibold" data-testid={`text-customer-${inquiry._id}`}>
                        {inquiry.customer_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate max-w-xs" data-testid={`text-inquiry-${inquiry._id}`}>
                        {inquiry.message}
                      </p>
                    </div>
                    <span className={`status-badge status-${inquiry.status}`}>
                      {inquiry.status === 'new' || inquiry.status === 'pending' ? 'New' : inquiry.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent inquiries</p>
            )}
          </CardContent>
        </Card>

        {/* Puppy Status Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Puppy Status Overview</CardTitle>
            <Link href="/admin/puppies">
              <Button variant="ghost" size="sm">
                <Eye className="mr-1 h-4 w-4" />
                Manage
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Available</span>
                <span className="status-badge status-available">
                  {availablePuppies} {availablePuppies === 1 ? 'puppy' : 'puppies'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Reserved</span>
                <span className="status-badge status-reserved">
                  {reservedPuppies} {reservedPuppies === 1 ? 'puppy' : 'puppies'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sold</span>
                <span className="status-badge status-sold">
                  {soldPuppies} {soldPuppies === 1 ? 'puppy' : 'puppies'}
                </span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Active Litters</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {activeLitters}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gallery Status</CardTitle>
            <Link href="/admin/gallery">
              <Button variant="ghost" size="sm">
                <Eye className="mr-1 h-4 w-4" />
                Manage
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Public Photos</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {publicPhotos}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Awaiting Approval</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${pendingPhotos > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                  {pendingPhotos}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Photos</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-medium">
                  {totalGalleryPhotos}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Customer Overview</CardTitle>
            <Link href="/admin/customers">
              <Button variant="ghost" size="sm">
                <Eye className="mr-1 h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Total Customers</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {totalCustomers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Prospective</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {customers?.filter(c => c.status === 'prospective' || !c.status).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Current</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {customers?.filter(c => c.status === 'current').length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
