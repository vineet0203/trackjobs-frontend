import { NavLink, useNavigate } from 'react-router-dom';
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
  ClipboardCheck
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-start py-1.5 px-5 gap-4 w-full h-8 cursor-pointer transition-colors duration-200 no-underline ${isActive
                ? 'bg-[#165DAD] text-[#D3DFEB]'
                : 'text-white hover:bg-[#3281da]'
              }`
            }
          >
            <div className="flex flex-row items-center p-0 gap-2.5 h-5">
              <div className="w-5 h-5 flex items-center justify-center">
                {getIcon(item.icon)}
              </div>
              <span className="font-poppins font-normal text-sm leading-[18px] whitespace-nowrap">
                {item.label}
              </span>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;