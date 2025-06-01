import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/ba80c63a-8193-468a-aeee-9f39353b4e99/da4e84807be20560b6128922b55295de.png"; 

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-background/80 border-t border-border/20 section-padding pb-8 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link to="/" onClick={() => scrollToSection('hero')} className="flex items-center mb-4">
              <img className="h-[72px] w-auto" src={logoUrl} alt="Outwit Agency Logo - Futuristic Tech Solutions" />
            </Link>
            <p className="text-muted-foreground text-sm font-['Poppins',_sans-serif]">
              Architecting tomorrow's digital frontier. Web, Apps & AI Solutions Redefined.
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground mb-4 font-['Space_Grotesk',_sans-serif]">Navigate</p>
            <ul className="space-y-2 font-['Poppins',_sans-serif]">
              <li><button onClick={() => scrollToSection('services')} className="text-muted-foreground hover:text-primary transition-colors">Solutions</button></li>
              <li><button onClick={() => scrollToSection('game-zone')} className="text-muted-foreground hover:text-primary transition-colors">Tetris Protocol</button></li>
              <li><button onClick={() => scrollToSection('portfolio')} className="text-muted-foreground hover:text-primary transition-colors">Showcase</button></li>
              <li><button onClick={() => scrollToSection('contact')} className="text-muted-foreground hover:text-primary transition-colors">Connect</button></li>
            </ul>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground mb-4 font-['Space_Grotesk',_sans-serif]">Synergize</p>
            <div className="flex space-x-4 mb-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><span className="sr-only">Twitter</span><Twitter size={24} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><span className="sr-only">LinkedIn</span><Linkedin size={24} /></a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><span className="sr-only">GitHub</span><Github size={24} /></a>
              <a href="mailto:connect@outwit.agency" className="text-muted-foreground hover:text-primary transition-colors"><span className="sr-only">Email</span><Mail size={24} /></a>
            </div>
            <p className="text-muted-foreground text-sm font-['Poppins',_sans-serif]">connect@outwit.agency</p>
            <p className="text-muted-foreground text-sm font-['Poppins',_sans-serif]">Nexus Point, Digital Universe</p>
          </div>
        </div>
        <div className="border-t border-border/20 pt-8 text-center">
          <p className="text-sm text-muted-foreground font-['Poppins',_sans-serif]">
            &copy; {currentYear} Outwit Agency. All systems operational. Empowering the future.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;