import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Database, 
  Settings, 
  LogOut,
  Send,
  ShieldCheck,
  Globe
} from 'lucide-react';

const Sidebar = () => (
  <div className="w-64 bg-[#336699] border-r border-white/20 h-screen sticky top-0 flex flex-col p-4">
    <div className="flex items-center gap-2 px-2 mb-8 border-b border-white/20 pb-4">
      <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
        <Send className="text-white w-5 h-5" />
      </div>
      <span className="text-lg font-bold text-white tracking-widest">ESP</span>
    </div>

    <nav className="flex-1 space-y-1">
      <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
      <NavItem to="/credentials" icon={<Users size={18} />} label="Credentials" />
      <NavItem to="/interface" icon={<Mail size={18} />} label="Interface" />
      <NavItem to="/data-count" icon={<Database size={18} />} label="Data Count" />
      <NavItem to="/suppression" icon={<ShieldCheck size={18} />} label="Suppression" />
      <NavItem to="/server-setup" icon={<Globe size={18} />} label="Server Setup" />
    </nav>

    <div className="pt-4 border-t border-white/20">
      <NavItem to="/settings" icon={<Settings size={18} />} label="Settings" />
      <button className="w-full flex items-center gap-3 px-4 py-2 rounded text-white/70 hover:bg-red-600 hover:text-white mt-1 transition-colors">
        <LogOut size={18} />
        <span className="font-bold text-xs uppercase">Logout</span>
      </button>
    </div>
  </div>
);

const NavItem = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => 
      `w-full flex items-center gap-3 px-4 py-2 rounded transition-all ${
        isActive 
          ? 'bg-white/20 text-white font-bold ring-1 ring-white/30' 
          : 'text-white/70 hover:bg-white/10 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
  </NavLink>
);

export default Sidebar;
