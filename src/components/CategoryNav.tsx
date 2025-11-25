import { Link } from 'react-router-dom';

const SECTIONS = [
  { id: 'commodities', name: 'Commodities' },
  { id: 'cryptocurrencies', name: 'Cryptocurrencies' },
  { id: 'indices', name: 'Indices' },
  { id: 'equities', name: 'Equities' },
  { id: 'others', name: 'Others' },
];

interface CategoryNavProps {
  activeSection?: string;
}

export function CategoryNav({ activeSection }: CategoryNavProps) {
  return (
    <nav className="max-w-6xl mx-auto mb-12">
      <div className="flex flex-wrap gap-4 justify-center bg-muted/30 p-6 rounded-lg">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <Link
              key={section.id}
              to={`/section/${section.id}`}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground hover:bg-primary/10'
              }`}
            >
              {section.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
