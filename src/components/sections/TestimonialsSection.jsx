import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Quote, ServerCrash, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient.js';

const titleAnimation = {
  initial: { opacity: 0, y: 25, filter: 'blur(3px)' }, // Softer entry
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.25 }, // Trigger sooner
  transition: { duration: 0.65, ease: [0.35, 0, 0.65, 1] } // Smoother ease
};

const initialTestimonialsData = [
  {
    id: 'local-1',
    client_name: 'Alice Wonderland (Fallback)',
    client_title: 'CEO, Tech Innovators Inc.',
    picture_url: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/ba80c63a-8193-468a-aeee-9f39353b4e99/female-avatar-placeholder.png',
    review_text: "Local Fallback: Outwit Agency transformed our online presence. Their team is professional, creative, and delivered beyond our expectations. Highly recommended!",
    rating: 5,
    approved: true,
  },
  {
    id: 'local-2',
    client_name: 'Bob The Builder (Fallback)',
    client_title: 'Founder, Creative Solutions Co.',
    picture_url: 'https://storage.googleapis.com/hostinger-horizons-assets-prod/ba80c63a-8193-468a-aeee-9f39353b4e99/male-avatar-placeholder.png',
    review_text: "Local Fallback: Working with Outwit was a game-changer. Their AI automation saved us countless hours and improved our efficiency dramatically.",
    rating: 5,
    approved: true,
  },
];

const TestimonialCard = ({ testimonial }) => {
  return (
    <motion.div
      key={testimonial.id}
      initial={{ opacity: 0, filter: 'blur(6px)', scale: 0.95 }} // Softer initial state
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(6px)', scale: 0.95 }}
      transition={{ duration: 0.45, ease: [0.35, 0, 0.65, 1] }} // Smoother, slightly faster transition
      className="w-full"
    >
      <Card className="p-6 md:p-8 glassmorphism-deep h-full flex flex-col min-h-[280px] sm:min-h-[300px]"> {/* Adjusted min-height for responsiveness */}
        <Quote className="h-8 w-8 md:h-10 md:w-10 text-primary/40 mb-3 md:mb-4 transform -scale-x-100" /> {/* Softer color, responsive size */}
        <blockquote className="text-foreground/75 italic text-base sm:text-lg md:text-xl leading-relaxed flex-grow mb-5 md:mb-6 font-['Poppins',_sans-serif]"> {/* Responsive text size */}
          {testimonial.review_text}
        </blockquote>
        <div className="flex items-center mt-auto pt-3 md:pt-4 border-t border-border/25"> {/* Softer border */}
          <img   
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-full mr-3 sm:mr-4 border-2 border-primary/80 object-cover" // Responsive size, softer border
           src={testimonial.picture_url || "https://images.unsplash.com/photo-1630862338617-5b47c0ea7a7c"} />
          <div>
            <p className="font-semibold text-base sm:text-lg text-foreground font-['Space_Grotesk',_sans-serif]">{testimonial.client_name}</p> {/* Responsive text size */}
            <p className="text-xs sm:text-sm text-muted-foreground font-['Poppins',_sans-serif]">{testimonial.client_title}</p> {/* Responsive text size */}
             <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/25'}`} /> // Responsive size, softer unselected color
                ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [approvedTestimonials, setApprovedTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from('reviews')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        
        setApprovedTestimonials(data || []);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setError("Failed to load testimonials. Displaying fallback content.");
        setApprovedTestimonials(initialTestimonialsData.filter(t => t.approved));
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);


  const nextTestimonial = () => {
    if (approvedTestimonials.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % approvedTestimonials.length);
  };

  const prevTestimonial = () => {
     if (approvedTestimonials.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + approvedTestimonials.length) % approvedTestimonials.length);
  };

  useEffect(() => {
    if (approvedTestimonials.length > 1) {
        const timer = setTimeout(nextTestimonial, 7500); // Slightly longer auto-play interval
        return () => clearTimeout(timer);
    }
  }, [currentIndex, approvedTestimonials]);

  if (loading) {
    return (
      <section id="testimonials" className="section-padding bg-background/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-primary animate-spin mx-auto" /> {/* Responsive loader */}
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground font-['Poppins',_sans-serif]">Loading Testimonials...</p>
        </div>
      </section>
    );
  }

  if (error && !loading) {
    return (
      <section id="testimonials" className="section-padding bg-background/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-destructive bg-destructive/5 p-3 sm:p-4 rounded-md"> {/* Softer bg */}
          <ServerCrash className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-1.5 sm:mb-2" />
          <p className="text-base sm:text-lg font-semibold font-['Space_Grotesk',_sans-serif]">Data Transmission Error</p>
          <p className="font-['Poppins',_sans-serif] text-xs sm:text-sm">{error}</p>
        </div>
      </section>
    );
  }
  
  if (!loading && !error && approvedTestimonials.length === 0) {
    return (
        <section id="testimonials" className="section-padding bg-background/95">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <p className="text-base sm:text-lg text-muted-foreground font-['Poppins',_sans-serif]">No client testimonials available at the moment. Check back soon!</p>
            </div>
        </section>
    );
  }

  return (
    <section id="testimonials" className="section-padding bg-background/95 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          {...titleAnimation}
          className="text-center mb-10 md:mb-12" // Adjusted margin
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3 md:mb-4 font-['Space_Grotesk',_sans-serif]"> {/* Responsive font size */}
            Echoes from the <span className="text-gradient">Digital Frontier</span>
          </h2>
          <p className="text-lg md:text-xl text-foreground/65 max-w-xl md:max-w-2xl mx-auto font-['Poppins',_sans-serif]"> {/* Softer text, responsive max-width */}
            Authentic endorsements from partners who have journeyed with Outwit Agency.
          </p>
        </motion.div>

        <div className="relative max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto"> {/* Responsive max-width */}
          <AnimatePresence mode="wait">
            <TestimonialCard testimonial={approvedTestimonials[currentIndex]} />
          </AnimatePresence>
          
          {approvedTestimonials.length > 1 && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={prevTestimonial} 
                className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-4 md:-left-16 transform rounded-full bg-background/40 hover:bg-primary/15 border-primary/70 text-primary button-hover-glow w-10 h-10 sm:w-12 sm:w-12" // Responsive positioning and size
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextTestimonial} 
                className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-4 md:-right-16 transform rounded-full bg-background/40 hover:bg-primary/15 border-primary/70 text-primary button-hover-glow w-10 h-10 sm:w-12 sm:w-12" // Responsive positioning and size
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </Button>
            </>
          )}
        </div>
        {approvedTestimonials.length > 1 && (
            <div className="flex justify-center mt-8 md:mt-10 space-x-2.5 sm:space-x-3"> {/* Adjusted spacing */}
                {approvedTestimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-250 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background
                                    ${currentIndex === index ? 'bg-primary scale-110 ring-1 ring-primary/40' : 'bg-muted-foreground/40 hover:bg-muted-foreground/70'}`} // Adjusted styles for dots
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;