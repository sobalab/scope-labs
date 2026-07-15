import { SectionCard } from '../primitives/SectionCard';
import { Chip } from '../primitives/Chip';

interface TechStackProps {
  techStack: string[];
}

export function TechStack({ techStack }: TechStackProps) {
  if (techStack.length === 0) return null;
  return (
    <SectionCard title="Tech stack">
      <div className="flex flex-wrap gap-2">
        {techStack.map((t) => (
          <Chip key={t} label={t} />
        ))}
      </div>
    </SectionCard>
  );
}
