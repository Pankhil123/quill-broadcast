import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/section/commodities" className="text-muted-foreground hover:text-primary transition-colors">
                  Commodities
                </Link>
              </li>
              <li>
                <Link to="/section/equities" className="text-muted-foreground hover:text-primary transition-colors">
                  Equities
                </Link>
              </li>
              <li>
                <Link to="/section/indices" className="text-muted-foreground hover:text-primary transition-colors">
                  Indices
                </Link>
              </li>
              <li>
                <Link to="/section/cryptocurrencies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cryptocurrencies
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/advertise" className="text-muted-foreground hover:text-primary transition-colors">
                  Advertise With Us
                </Link>
              </li>
              <li>
                <a href="mailto:contact@toadtoe.com" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us at - contact@toadtoe.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ToadToe. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
