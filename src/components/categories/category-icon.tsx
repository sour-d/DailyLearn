import {
  Book,
  Code,
  Brain,
  Globe,
  Database,
  Server,
  Layout,
  Terminal,
  Cpu,
  Layers,
  Puzzle,
  Lightbulb,
  Pencil,
  FileText,
  Bookmark,
  Hash,
  type LucideProps,
} from "lucide-react";
import type { CategoryIconName } from "@/lib/constants";

const iconMap: Record<CategoryIconName, React.ComponentType<LucideProps>> = {
  book: Book,
  code: Code,
  brain: Brain,
  globe: Globe,
  database: Database,
  server: Server,
  layout: Layout,
  terminal: Terminal,
  cpu: Cpu,
  layers: Layers,
  puzzle: Puzzle,
  lightbulb: Lightbulb,
  pencil: Pencil,
  "file-text": FileText,
  bookmark: Bookmark,
  hash: Hash,
};

interface CategoryIconProps extends LucideProps {
  iconName: string;
}

export function CategoryIcon({ iconName, ...props }: CategoryIconProps) {
  const Icon = iconMap[iconName as CategoryIconName] ?? Book;
  return <Icon {...props} />;
}
