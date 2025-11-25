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
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl shadow-lg border-2 border-primary/20 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap gap-4 justify-center">
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <Link
                key={section.id}
                to={`/section/${section.id}`}
                className={`px-6 py-3 rounded-lg font-bold text-base uppercase tracking-wide transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/50 scale-105'
                    : 'bg-card text-foreground border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md'
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
