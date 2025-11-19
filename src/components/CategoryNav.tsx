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
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <Link
                key={section.id}
                to={`/section/${section.id}`}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                {section.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
