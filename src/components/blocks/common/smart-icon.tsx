import Activity from 'lucide-react/dist/esm/icons/activity';
import BookOpenText from 'lucide-react/dist/esm/icons/book-open-text';
import Box from 'lucide-react/dist/esm/icons/box';
import Brain from 'lucide-react/dist/esm/icons/brain';
import CaseSensitive from 'lucide-react/dist/esm/icons/case-sensitive';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Coins from 'lucide-react/dist/esm/icons/coins';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Download from 'lucide-react/dist/esm/icons/download';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Folder from 'lucide-react/dist/esm/icons/folder';
import Github from 'lucide-react/dist/esm/icons/github';
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle';
import Home from 'lucide-react/dist/esm/icons/home';
import ImageUp from 'lucide-react/dist/esm/icons/image-up';
import Key from 'lucide-react/dist/esm/icons/key';
import Layers from 'lucide-react/dist/esm/icons/layers';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Maximize from 'lucide-react/dist/esm/icons/maximize';
import Newspaper from 'lucide-react/dist/esm/icons/newspaper';
import Ratio from 'lucide-react/dist/esm/icons/ratio';
import Settings from 'lucide-react/dist/esm/icons/settings';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Type from 'lucide-react/dist/esm/icons/type';
import User from 'lucide-react/dist/esm/icons/user';
import Users from 'lucide-react/dist/esm/icons/users';
import Zap from 'lucide-react/dist/esm/icons/zap';

const LUCIDE_ICONS: Record<string, any> = {
  Activity,
  BookOpenText,
  Box,
  Brain,
  CaseSensitive,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Folder,
  Github,
  Home,
  ImageUp,
  Key,
  Layers,
  Mail,
  Maximize,
  Newspaper,
  Ratio,
  Settings,
  ShieldCheck,
  Sparkles,
  Type,
  User,
  Users,
  Zap,
};

export function SmartIcon({
  name,
  size = 24,
  className,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  const IconComponent = LUCIDE_ICONS[name] || HelpCircle;
  return <IconComponent size={size} className={className} {...props} />;
}
