import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Lightbulb, Rocket, Settings, Users, Globe, Code, BrainCircuit } from 'lucide-react';

const initialDraggables = [
  { id: 'service-website', content: 'Website Creation', icon: <Globe className="h-6 w-6 mr-2" />, type: 'service' },
  { id: 'service-webapp', content: 'Web App Dev', icon: <Code className="h-6 w-6 mr-2" />, type: 'service' },
  { id: 'service-ai', content: 'AI Automation', icon: <BrainCircuit className="h-6 w-6 mr-2" />, type: 'service' },
  { id: 'action-contact', content: 'Contact Us', icon: <Users className="h-6 w-6 mr-2" />, type: 'action' },
];

const InteractiveDndZone = () => {
  const [draggables, setDraggables] = useState(initialDraggables);
  const { toast } = useToast();

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === 'launchpad-zone') {
      const item = draggables.find(d => d.id === draggableId);
      toast({
        title: `🚀 ${item.content} Selected!`,
        description: `Exploring options for ${item.content.toLowerCase()}. Let's go!`,
      });
      // Placeholder for action, e.g., scroll to service or open form
      if (item.type === 'service') {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      } else if (item.id === 'action-contact') {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }
      // Reset item to original position (optional, or handle state differently)
    }
  };
  
  const DraggableItem = ({ item, index }) => (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 mb-3 rounded-lg shadow-md flex items-center justify-center text-sm font-medium cursor-grab
            ${snapshot.isDragging ? 'bg-primary/80 text-primary-foreground ring-2 ring-primary' : 'bg-card hover:bg-card/80 border border-border'}`}
          style={{ ...provided.draggableProps.style }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {item.icon}
          {item.content}
        </motion.div>
      )}
    </Draggable>
  );

  return (
    <section id="interactive-zone" className="section-padding bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Chart Your <span className="text-gradient">Digital Journey</span>
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
            Drag an item to the Launchpad to begin exploring or take action. What will you build today?
          </p>
        </motion.div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <Droppable droppableId="items-source-zone">
              {(provided) => (
                <Card ref={provided.innerRef} {...provided.droppableProps} className="md:col-span-1 p-6 glassmorphism min-h-[300px]">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="text-2xl text-gradient flex items-center">
                      <Lightbulb className="h-7 w-7 mr-2 text-primary" /> Your Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {draggables.map((item, index) => (
                      <DraggableItem key={item.id} item={item} index={index} />
                    ))}
                    {provided.placeholder}
                  </CardContent>
                </Card>
              )}
            </Droppable>

            <Droppable droppableId="launchpad-zone">
              {(provided, snapshot) => (
                <motion.div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`md:col-span-2 p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] transition-all duration-300
                    ${snapshot.isDraggingOver ? 'border-primary bg-primary/10 scale-105 shadow-primary/30 shadow-lg' : 'border-border/50 bg-background/20'}`}
                >
                  <Rocket className={`h-16 w-16 mb-6 transition-all duration-300 ease-out ${snapshot.isDraggingOver ? 'text-primary scale-110 rotate-[360deg]' : 'text-muted-foreground'}`} />
                  <h3 className={`text-2xl font-semibold mb-2 ${snapshot.isDraggingOver ? 'text-primary' : 'text-foreground'}`}>
                    The Launchpad
                  </h3>
                  <p className={`text-center ${snapshot.isDraggingOver ? 'text-primary/90' : 'text-muted-foreground'}`}>
                    {snapshot.isDraggingOver ? "Drop here to blast off!" : "Drag your chosen service or action here!"}
                  </p>
                  {provided.placeholder}
                  {snapshot.isDraggingOver && (
                     <motion.div 
                        className="absolute inset-0 rounded-xl opacity-20"
                        style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
                        initial={{scale:0}} animate={{scale:1.5}} transition={{duration:0.5, repeat: Infinity, repeatType: "mirror"}}/>
                  )}
                </motion.div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </section>
  );
};

export default InteractiveDndZone;