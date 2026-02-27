import { useNavigate, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut, selectCurrentUser } from "../store/authSlice";
import {
  Mail,
  Settings,
  LogIn,
  Monitor,
  Database,
  Tag,
  ShieldCheck,
  Server,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useGetServersManagementQuery } from "../store/apiSlice";

interface NavSubItem {
  name?: string;
  path?: string;
  type?: "header" | "divider";
  isAdmin?: boolean;
  submenu?: any[];
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  isAdmin?: boolean;
  dropdown?: NavSubItem[];
}

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector(selectCurrentUser);
  const { data: servers = [] } = useGetServersManagementQuery();

  // Flatten all IPs from all servers for the submenus
  const allIps = servers.flatMap((s) => {
    const serverIp = { name: s.ip, path: s.ip };
    const additionalIps = (s.ips || []).map((ipObj: any) => ({
      name: ipObj.ip,
      path: ipObj.ip,
    }));
    return [serverIp, ...additionalIps];
  });

  const isSender = userInfo?.designation === "Sender";
  const isAdmin = userInfo?.designation === "Admin";

  const navItems: NavItem[] = [
    { name: "SMTP", path: "/smtp", icon: Mail, isAdmin: true },
    {
      name: "TOOLS",
      path: "#",
      icon: Settings,
      dropdown: [{ name: "Data File List", path: "/data-count" }],
    },
    {
      name: "LOGIN",
      path: "#",
      icon: LogIn,
      dropdown: [{ name: "CREATE CREDENTIALS", path: "/credentials" }],
      isAdmin: true,
    },
    { name: "SCREEN", path: "/screen", icon: Monitor },
    {
      name: "INTERFACE",
      path: "#",
      icon: Mail,
      dropdown: [
        { type: "header", name: "MAIN SERVER" },
        { name: "NEW INTERFACE", path: "/interface" },
        { name: "SMTP TESTER", path: "/smtp-tester" },
        { name: "FSOCK MANUAL INTERFACE", path: "/fsock-manual" },
        { name: "NEW INTERFACE AUTO", path: "/interface-new" },
        { name: "FSOCK SEND SMTP", path: "/fsock-send-smtp" },
        { name: "FSOCK SEND SMTP AUTO", path: "/fsock-send-smtp-auto" },
        { type: "divider", isAdmin: true },
        { type: "header", name: "SENDING IP", isAdmin: true },
        {
          name: "NEW INTERFACE",
          isAdmin: true,
          submenu: allIps.map((ip) => ({
            name: ip.name,
            path: `http://${ip.path}/interface/header.php`,
            external: true,
          })),
        },
        {
          name: "SMTP TESTER",
          isAdmin: true,
          submenu: allIps.map((ip) => ({
            name: ip.name,
            path: `http://${ip.path}/smtp_tester/`,
            external: true,
          })),
        },
        {
          name: "FSOCK MANUAL INTERFACE",
          isAdmin: true,
          submenu: allIps.map((ip) => ({
            name: ip.name,
            path: `http://${ip.path}/ESP_Module_fsock/`,
            external: true,
          })),
        },
        {
          name: "NEW INTERFACE AUTO",
          isAdmin: true,
          submenu: allIps.map((ip) => ({
            name: ip.name,
            path: `http://${ip.path}/interface_new/header.php`,
            external: true,
          })),
        },
        {
          name: "FSOCK SEND SMTP",
          isAdmin: true,
          submenu: allIps.map((ip) => ({
            name: ip.name,
            path: `http://${ip.path}/ESP_Module_fsock_send_smtp/`,
            external: true,
          })),
        },
        {
          name: "FSOCK SEND SMTP AUTO",
          isAdmin: true,
          submenu: allIps.map((ip) => ({
            name: ip.name,
            path: `http://${ip.path}/ESP_Module_fsock_send_smtp_auto/`,
            external: true,
          })),
        },
      ],
    },
    {
      name: "TESTIDS PORTAL",
      path: "#",
      icon: Settings,
      dropdown: [
        { name: "Testids Management", path: "/testids-man" },
        { name: "Testids Screen", path: "/testids-screen" },
        { name: "Testids Mailbox", path: "/testids-mailbox" },
      ],
      isAdmin: true,
    },
    {
      name: "DATA",
      path: "#",
      icon: Database,
      dropdown: [
        { name: "DATA DOWNLOAD PORTAL", path: "/data-download", isAdmin: true },
        { name: "DATA UPLOAD PORTAL", path: "/data-upload", isAdmin: true },
        { name: "DATA SPLIT PORTAL", path: "/data-split" },
        { name: "DATA MERGE PORTAL", path: "/data-merge", isAdmin: true },
        { name: "BOUNCE FETCH", path: "/bounce-fetch", isAdmin: true },
        { name: "COMPLAIN FETCH", path: "/complain-fetch", isAdmin: true },
        { name: "BOUNCE UPDATE", path: "/bounce-update", isAdmin: true },
        { name: "COMPLAIN UPDATE", path: "/complain-update", isAdmin: true },
        {
          name: "Fetch Opener & Clicker Data",
          path: "/fetch-opener-clicker",
          isAdmin: true,
        },
        {
          name: "DELETE DATAFILE FROM DB",
          path: "/delete-datafile",
          isAdmin: true,
        },
      ],
    },
    {
      name: "OFFER",
      path: "#",
      icon: Tag,
      dropdown: [
        { name: "ADD OFFER", path: "/offers" },
        { name: "ALL OFFER", path: "/all-offers" },
        { name: "ALL LINKS PORTAL", path: "/all-links" },
        { name: "IMAGE TRANSFER", path: "/image-portal" },
      ],
      isAdmin: true,
    },
    {
      name: "SUPPRESSION",
      path: "#",
      icon: ShieldCheck,
      dropdown: [
        { name: "SUPPRESSION", path: "/suppression" },
        { name: "COMPLAINER SUPPRESSION", path: "/complainer-suppression" },
      ],
      isAdmin: true,
    },
    {
      name: "Server Setup",
      path: "#",
      icon: Server,
      dropdown: [
        { name: "Server Setup Centos", path: "/server-setup" },
        { name: "Server Setup Ubuntu", path: "/server-setup-ubuntu" },
        { name: "Sending IP Setup", path: "/sending-ip-setup" },
      ],
      isAdmin: true,
    },
  ];

  // Filter items based on isAdmin
  const filteredNavItems = navItems.filter((item) => {
    if (item.isAdmin && !isAdmin) return false;
    return true;
  });
  return (
    <nav className="legacy-navbar navbar-icon-top">
      <NavLink to="/" className="navbar-brand">
        <div className="brand-icon">MJ</div>
        <div className="brand-text-wrapper">
          <span className="brand-title">MAILING</span>
          <span className="brand-subtitle">MJ TECH PORTAL</span>
        </div>
      </NavLink>

      <div className="flex items-center gap-1 flex-1">
        {filteredNavItems.map((item) => (
          <div
            key={item.name}
            className={`dropdown ${item.dropdown ? "has-dropdown" : ""}`}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive && item.path !== "#" ? "active" : ""}`
              }
              onClick={(e) => item.path === "#" && e.preventDefault()}
            >
              <item.icon size={16} />
              <span className="mt-1 whitespace-nowrap">{item.name}</span>
            </NavLink>

            {item.dropdown && (
              <div className="dropdown-menu">
                {(item.dropdown as NavSubItem[])
                  .filter((sub) => !sub.isAdmin || isAdmin)
                  .map((sub, idx: number) => {
                    if (sub.type === "header")
                      return (
                        <div key={idx} className="dropdown-header">
                          {sub.name}
                        </div>
                      );
                    if (sub.type === "divider")
                      return <div key={idx} className="dropdown-divider"></div>;
                    if (sub.submenu) {
                      return (
                        <div key={idx} className="dropdown-submenu">
                          <div className="dropdown-item">
                            {sub.name} <ChevronRight size={12} />
                          </div>
                          <div className="dropdown-menu">
                            {sub.submenu.length > 0 ? (
                              sub.submenu.map((ipItem: any, i: number) => (
                                <a
                                  key={i}
                                  href={ipItem.path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="dropdown-item"
                                >
                                  {ipItem.name}
                                </a>
                              ))
                            ) : (
                              <div className="dropdown-item text-gray-400 italic">
                                No IPs found
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <NavLink
                        key={idx}
                        to={sub.path || "#"}
                        className="dropdown-item"
                      >
                        {sub.name}
                      </NavLink>
                    );
                  })}
              </div>
            )}
          </div>
        ))}
      </div>

      {userInfo && (
        <div className="flex items-center gap-4 ml-4">
          <span className="text-light font-bold text-lg uppercase sm:block">
            {userInfo.name || userInfo.email}
          </span>
          <button
            onClick={() => {
              dispatch(logOut());
              navigate("/login?action=logout");
            }}
            className="bg-red-600 hover:bg-red-700 text-dark text-10px font-bold px-3 py-1-5 rounded border border-light flex items-center gap-1 transition-colors"
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
