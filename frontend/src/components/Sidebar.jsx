import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Mail, BarChart2, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Campaigns', href: '/campaigns', icon: Mail },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-2xl font-bold text-white">Email Campaign</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                          ${isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }
                        `}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <div className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
                  {user?.firstName?.[0]}
                </span>
                <span className="sr-only">Your profile</span>
                <div>
                  <p className="text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white w-full"
              >
                <LogOut className="h-6 w-6 shrink-0" />
                Sign out
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;