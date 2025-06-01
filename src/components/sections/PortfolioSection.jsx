import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExternalLink, Eye, ServerCrash, Loader2, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient.js';

const titleAnimation = {
  initial: { opacity: 0, y: 25, filter: 'blur(3px)' }, // Softer entry
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.25 }, // Trigger sooner
  transition: { duration: 0.65, ease: [0.35, 0, 0.65, 1] } // Smoother ease
};

const initialPortfolioItems = [
  { id: 'local-1', title: 'Fallback E-commerce X', category: 'Web App', description: 'Local fallback: Scalable e-commerce with advanced features...', image_url: 'https://images.unsplash.com/photo-1677693972403-db681288b5da?q=80&w=800', liveLink: '#', caseStudyLink: '#', published: true },
  { id: 'local-2', title: 'Fallback Corporate Z', category: 'Website', description: 'Local fallback: Modern corporate website...', image_url: 'https://images.unsplash.com/photo-1601036205615-923fd920e481?q=80&w=800', liveLink: '#', caseStudyLink: '#', published: true },
];

const PortfolioItemCard = ({ item, onPreview }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(6px)' }} // Softer entry
    whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, amount: 0.2 }} // Trigger slightly earlier
    transition={{ duration: 0.55, ease: [0.3, 0, 0.6, 1] }} // Smoother ease
    className="group animated-border-card"
  >
    <Card 
      className="overflow-hidden h-full flex flex-col cursor-pointer glassmorphism-deep group-hover:shadow-primary/30 group-hover:shadow-xl transition-all duration-350 ease-out hover:border-transparent" // Softer shadow, adjusted duration
      onClick={() => onPreview(item)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img   
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105 group-hover:filter group-hover:brightness-105" // Slightly less scale/brightness
         src={item.image_url || "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800"} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex items-center justify-center"> {/* Softer gradient */}
          <Layers className="h-14 w-14 text-white/70 transform group-hover:scale-105 transition-transform duration-350 filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" /> {/* Adjusted icon style */}
        </div>
         <div className="absolute top-2.5 right-2.5 bg-primary/70 text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-350 font-['Space_Grotesk',_sans-serif]"> {/* Adjusted positioning and padding */}
          {item.category}
        </div>
      </div>
      <CardContent className="p-5 flex-grow flex flex-col"> {/* Slightly reduced padding */}
        <h3 className="text-xl md:text-2xl font-semibold mb-1.5 text-gradient font-['Space_Grotesk',_sans-serif] holographic-title" data-text={item.title}>{item.title}</h3> {/* Reduced margin */}
        <p className="text-sm text-foreground/75 mb-3.5 flex-grow font-['Poppins',_sans-serif]">{item.description.substring(0,110)}...</p> {/* Adjusted length and margin */}
        <Button variant="link" className="text-primary p-0 self-start hover:text-secondary font-['Space_Grotesk',_sans-serif] text-sm"> {/* Smaller button text */}
          View Project <Eye className="ml-1.5 h-3.5 w-3.5" /> {/* Adjusted icon size and margin */}
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

const PortfolioSection = () => {
  const [filter, setFilter] = useState('All');
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('projects')
          .select('*')
          .eq('published', true) 
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        
        setPortfolioItems(data || []);
      } catch (err) {
        console.error("Error fetching portfolio items:", err);
        setError("Failed to load projects. Displaying fallback content.");
        setPortfolioItems(initialPortfolioItems.filter(item => item.published)); 
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioItems();
  }, []);

  useEffect(() => {
    if (filter === 'All') {
      setFilteredItems(portfolioItems);
    } else {
      setFilteredItems(portfolioItems.filter(item => item.category === filter));
    }
  }, [filter, portfolioItems]);

  const categories = ['All', 'Website', 'Web App', 'AI Solution']; 

  const handlePreview = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <section id="portfolio" className="section-padding bg-background/95 relative overflow-hidden">
      <div className="absolute inset-0 data-stream-bg opacity-25"></div> {/* Reduced opacity */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          {...titleAnimation}
          className="text-center mb-12 md:mb-16" // Increased bottom margin
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 font-['Space_Grotesk',_sans-serif] holographic-title" data-text="Showcase"> {/* Adjusted font sizes */}
            Our <span className="text-gradient">Showcase</span>
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl lg:max-w-3xl mx-auto font-['Poppins',_sans-serif]"> {/* Adjusted max-width */}
            Explore a curated selection of projects that demonstrate our innovative approach and commitment to excellence.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-10 md:mb-12"> {/* Using gap for responsiveness */}
          {categories.map(category => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              onClick={() => setFilter(category)}
              className={`transition-all duration-250 font-['Space_Grotesk',_sans-serif] text-xs sm:text-sm md:text-base px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full ${filter === category ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md button-hover-glow' : 'border-primary/60 text-primary hover:bg-primary/5 hover:border-primary button-hover-glow'}`} // Adjusted styles for responsiveness
            >
              {category}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-10 md:py-12"> {/* Adjusted padding */}
            <Loader2 className="h-12 w-12 sm:h-14 sm:w-14 text-primary animate-spin" />
            <p className="ml-4 text-lg sm:text-xl text-muted-foreground font-['Poppins',_sans-serif]">Loading Innovations...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-10 md:py-12 text-destructive bg-destructive/5 p-5 rounded-lg shadow-sm"> {/* Softer bg */}
            <ServerCrash className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2.5" />
            <p className="text-lg sm:text-xl font-semibold font-['Space_Grotesk',_sans-serif]">Connection Anomaly</p>
            <p className="font-['Poppins',_sans-serif] text-sm sm:text-base">{error}</p>
          </div>
        )}

        {!loading && !error && filteredItems.length === 0 && (
           <div className="text-center py-10 md:py-12">
             <p className="text-lg sm:text-xl text-muted-foreground font-['Poppins',_sans-serif]">No projects found for "{filter}". Stay tuned for new innovations!</p>
           </div>
        )}
        
        {!loading && filteredItems.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10"> {/* Adjusted gap */}
            {filteredItems.map(item => (
              <PortfolioItemCard key={item.id} item={item} onPreview={handlePreview} />
            ))}
          </motion.div>
        )}


        {selectedItem && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[650px] md:max-w-[700px] max-h-[90vh] overflow-y-auto glassmorphism-deep p-6 md:p-8"> {/* Responsive padding */}
              <DialogHeader>
                <DialogTitle className="text-2xl sm:text-3xl text-gradient mb-2.5 font-['Space_Grotesk',_sans-serif] holographic-title" data-text={selectedItem.title}>{selectedItem.title}</DialogTitle>
                <DialogDescription className="text-foreground/70 font-['Poppins',_sans-serif] text-sm sm:text-base">{selectedItem.category}</DialogDescription>
              </DialogHeader>
              <div className="my-5 rounded-lg overflow-hidden shadow-lg"> {/* Softer shadow */}
                <img   
                  alt={selectedItem.title} 
                  className="w-full h-auto object-cover"
                 src={selectedItem.image_url || "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800"} />
              </div>
              <p className="text-foreground/80 mb-5 font-['Poppins',_sans-serif] text-sm sm:text-base leading-relaxed">{selectedItem.description}</p>
              <div className="flex flex-col sm:flex-row space-y-2.5 sm:space-y-0 sm:space-x-3.5 mt-6"> {/* Adjusted spacing */}
                <Button asChild variant="default" className="flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground button-hover-glow font-['Space_Grotesk',_sans-serif] text-base sm:text-lg py-2.5 sm:py-3"> {/* Responsive padding */}
                  <a href={selectedItem.liveLink || '#'} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" /> Live Preview
                  </a>
                </Button>
                <Button asChild variant="outline" className="flex-1 text-primary border-primary hover:bg-primary/5 button-hover-glow font-['Space_Grotesk',_sans-serif] text-base sm:text-lg py-2.5 sm:py-3"> {/* Responsive padding */}
                  <a href={selectedItem.caseStudyLink || '#'} target="_blank" rel="noopener noreferrer">
                    Case Study
                  </a>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </section>
  );
};

export default PortfolioSection;