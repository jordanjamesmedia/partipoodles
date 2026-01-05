import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Heart, 
  Mail, 
  Images, 
  Users, 
  ArrowLeft,
  LogOut,
  Crown,
  User
} from "lucide-react";

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const sidebarItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: location === "/admin" || location === "/admin/dashboard",
    },
    {
      href: "/admin/puppies",
      label: "Manage Puppies",
      icon: Heart,
      isActive: location === "/admin/puppies",
    },
    {
      href: "/admin/parent-dogs",
      label: "Parent Dogs",
      icon: Crown,
      isActive: location === "/admin/parent-dogs",
    },
    {
      href: "/admin/litters",
      label: "Manage Litters",
      icon: Crown,
      isActive: location === "/admin/litters",
    },
    {
      href: "/admin/inquiries",
      label: "Customer Inquiries",
      icon: Mail,
      isActive: location === "/admin/inquiries",
    },
    {
      href: "/admin/gallery",
      label: "Photo Gallery",
      icon: Images,
      isActive: location === "/admin/gallery",
    },
    {
      href: "/admin/customers",
      label: "Customer CRM",
      icon: Users,
      isActive: location === "/admin/customers",
    },
    {
      href: "/admin/profile",
      label: "My Profile",
      icon: User,
      isActive: location === "/admin/profile",
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-64 bg-gray-800 text-white h-full flex flex-col">
      <div className="p-4 lg:p-6">
        <h2 className="text-lg lg:text-xl font-bold" data-testid="sidebar-title">Puppy Portal</h2>
      </div>
      
      <nav className="flex-1 px-2 lg:px-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <span 
                className={`admin-nav-item ${item.isActive ? 'active' : ''}`}
                data-testid={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={onNavigate}
              >
                <Icon className="mr-3 h-4 w-4 lg:h-5 lg:w-5" />
                <span className="text-sm lg:text-base">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 lg:p-6 space-y-2 border-t border-gray-700">
        <Link href="/">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 text-sm lg:text-base"
            data-testid="button-back-to-site"
            onClick={onNavigate}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Site
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700 text-sm lg:text-base"
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
