import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../../../../utils/constants';
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Calendar,
  Receipt,
  Clock,
  BookOpen,
  BarChart3,
  Settings,
  Clock10,
  Calendar1Icon,
  Book,
  Quote,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSubmenu = (path) => {
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Check if a parent's submenu should be considered active
  const isParentActive = (item) => {
    if (!item.children) return false;
    return item.children.some((child) => location.pathname.startsWith(child.path));
  };

  const icons = {
    dashboard: <LayoutDashboard size={18} />,
    customers: <Users size={18} />,
    quotes: <Quote size={18} />,
    jobs: <Briefcase size={18} />,
    schedule: <Calendar size={18} />,
    invoices: <Receipt size={18} />,
    timesheets: <Calendar1Icon size={18} />,
    booking: <Calendar size={18} />,
    employees: <Users size={18} />,
    onboarding: <ClipboardCheck size={18} />,
    reports: <BarChart3 size={18} />,
    settings: <Settings size={18} />,
  };

  const getIcon = (iconName) => icons[iconName] || icons.dashboard;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#3574BB] font-poppins z-50">
      {/* Sidebar Header */}
      <div className="w-full h-[76px] bg-[#3574BB] flex items-center pl-5">
        <h1 className="font-poppins font-semibold text-[25px] leading-[18px] text-white">TRAKJOBS</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col items-start p-0 gap-3 w-full mt-0.5">
        {NAV_ITEMS.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = openMenus[item.path] || isParentActive(item);

          return (
            <div key={item.path} className="w-full">
              {/* Main nav item */}
              <NavLink
                to={item.path}
                onClick={(e) => {
                  if (hasChildren) {
                    toggleSubmenu(item.path);
                  }
                }}
                className={({ isActive }) =>
                  `flex flex-col items-start py-1.5 px-5 gap-4 w-full h-8 cursor-pointer transition-colors duration-200 no-underline ${(isActive || isParentActive(item))
                    ? 'bg-[#165DAD] text-[#D3DFEB]'
                    : 'text-white hover:bg-[#3281da]'
                  }`
                }
              >
                <div className="flex flex-row items-center p-0 gap-2.5 h-5 w-full">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {getIcon(item.icon)}
                  </div>
                  <span className="font-poppins font-normal text-sm leading-[18px] whitespace-nowrap flex-1">
                    {item.label}
                  </span>
                  {hasChildren && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  )}
                </div>
              </NavLink>

              {/* Sub-items */}
              {hasChildren && isExpanded && (
                <div className="flex flex-col w-full">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `flex flex-col items-start py-1 pl-12 pr-5 w-full h-7 cursor-pointer transition-colors duration-200 no-underline ${isActive
                          ? 'bg-[#165DAD] text-[#D3DFEB]'
                          : 'text-white/70 hover:bg-[#3281da] hover:text-white'
                        }`
                      }
                    >
                      <div className="flex flex-row items-center p-0 gap-2 h-5">
                        <div className="w-4 h-4 flex items-center justify-center">
                          {getIcon(child.icon)}
                        </div>
                        <span className="font-poppins font-normal text-xs leading-[16px] whitespace-nowrap">
                          {child.label}
                        </span>
                      </div>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;