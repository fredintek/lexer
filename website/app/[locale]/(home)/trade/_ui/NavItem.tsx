import { ChevronDown } from "lucide-react";

const NavItem = ({
  label,
  hasDropdown,
  active = false,
}: {
  label: string;
  hasDropdown?: boolean;
  active?: boolean;
}) => (
  <li
    className={`flex items-center cursor-pointer hover:text-orange-500 transition relative py-1 ${active ? "text-orange-500" : ""}`}
  >
    <span>{label}</span>
    {hasDropdown && <ChevronDown size={14} className="ml-1 opacity-60" />}
    {active && (
      <div className="absolute bottom-3.5 left-0 w-full h-0.5 bg-orange-500" />
    )}
  </li>
);

export default NavItem;
