import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Loader2, AlertTriangle, Settings, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { INITIAL_DROP_INTERVAL, POINTS_PER_LINE, WIN_SCORE_DEFAULT } from '@/components/tetris/tetrisConstants.js';

const GameSettingsManagementPage = () => {
  const [settings, setSettings] = useState({
    id: null,
    drop_speed: INITIAL_DROP_INTERVAL,
    points_per_row: POINTS_PER_LINE[1], 
    win_score: WIN_SCORE_DEFAULT,
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.from('game_settings').select('*').limit(1);
      if (supabaseError) throw supabaseError;
      
      if (data && data.length > 0) {
        setSettings(prev => ({
          ...prev,
          ...data[0],
          // Ensure numeric values are numbers, not strings from DB
          drop_speed: parseInt(data[0].drop_speed, 10) || INITIAL_DROP_INTERVAL,
          points_per_row: parseInt(data[0].points_per_row, 10) || POINTS_PER_LINE[1],
          win_score: parseInt(data[0].win_score, 10) || WIN_SCORE_DEFAULT,
        }));
      } else {
        setSettings({ 
          id: null, 
          drop_speed: INITIAL_DROP_INTERVAL,
          points_per_row: POINTS_PER_LINE[1],
          win_score: WIN_SCORE_DEFAULT
        }); 
        toast({ 
          title: 'Default Settings Loaded', 
          description: 'No game settings found in the database. Default values are shown. Save to create a new settings record.',
          variant: 'default',
          duration: 7000,
          action: <Button variant="outline" size="sm" onClick={() => { /* can add action */ }}>OK</Button>
        });
      }
    } catch (err) {
      console.error("Error fetching game settings:", err);
      setError("Failed to load game settings. Default values are shown. " + err.message);
      setSettings({
        id: null,
        drop_speed: INITIAL_DROP_INTERVAL,
        points_per_row: POINTS_PER_LINE[1],
        win_score: WIN_SCORE_DEFAULT,
      });
      toast({ title: 'Error Loading Settings', description: 'Failed to load game settings from the database. Using defaults.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Ensure values are parsed as integers, provide fallback for empty input
    const parsedValue = parseInt(value, 10);
    setSettings(prev => ({ 
      ...prev, 
      [name]: isNaN(parsedValue) ? '' : parsedValue // Allow empty string for typing, handle NaN
    }));
  };

  const validateSettings = () => {
    if (settings.drop_speed < 100) return "Drop speed must be at least 100ms.";
    if (settings.points_per_row < 10) return "Points per row must be at least 10.";
    if (settings.win_score < 100) return "Win score must be at least 100."; // Adjusted minimum win score
    if (isNaN(settings.drop_speed) || isNaN(settings.points_per_row) || isNaN(settings.win_score)) {
        return "All fields must be valid numbers.";
    }
    return null;
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const validationError = validateSettings();
    if (validationError) {
        setError(validationError);
        toast({ title: 'Validation Error', description: validationError, variant: 'destructive'});
        return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const settingsDataToSave = {
        drop_speed: parseInt(settings.drop_speed, 10),
        points_per_row: parseInt(settings.points_per_row, 10),
        win_score: parseInt(settings.win_score, 10),
      };

      let response;
      if (settings.id) {
        response = await supabase.from('game_settings').update(settingsDataToSave).eq('id', settings.id).select();
      } else {
        response = await supabase.from('game_settings').insert(settingsDataToSave).select();
      }
      
      const { data, error: submitError } = response;
      if (submitError) throw submitError;

      if (data && data.length > 0) {
        setSettings(prev => ({...prev, ...data[0]}));
      }
      toast({ title: 'Success!', description: 'Game settings have been saved successfully. Changes will apply to new game sessions.' });
    } catch (err) {
      console.error("Error saving game settings:", err);
      const errorMessage = err.message || "An unknown error occurred while saving settings.";
      setError(errorMessage);
      toast({ title: 'Save Error', description: `Failed to save settings: ${errorMessage}`, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !error) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Game Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gradient">Tetris Game Settings</h1>
      <p className="text-muted-foreground">Adjust the core mechanics of the Tetris challenge. These settings will apply globally to new game sessions.</p>

      {error && !isSubmitting && ( // Show general error if not related to submission validation
        <div className="flex items-center text-sm text-destructive bg-destructive/10 p-4 rounded-md border border-destructive/30">
          <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0" />
          <div>
            <p className="font-semibold">Error Encountered</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <Card className="max-w-2xl mx-auto glassmorphism-deep">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><Settings className="mr-3 h-6 w-6 text-primary"/>Configure Gameplay</CardTitle>
          <CardDescription>Fine-tune difficulty and rewards. Changes will apply to new game sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <Label htmlFor="drop_speed" className="block text-sm font-medium text-foreground/80">
                Block Drop Speed (milliseconds)
              </Label>
              <Input
                id="drop_speed"
                name="drop_speed"
                type="number"
                value={settings.drop_speed}
                onChange={handleChange}
                min="100" 
                step="50"
                required
                className="mt-1 bg-input border-border/50 focus:border-primary"
                placeholder={INITIAL_DROP_INTERVAL}
              />
              <p className="mt-1 text-xs text-muted-foreground">Lower value means faster blocks. Default: {INITIAL_DROP_INTERVAL}ms. Min: 100ms.</p>
            </div>

            <div>
              <Label htmlFor="points_per_row" className="block text-sm font-medium text-foreground/80">
                Base Points Per Row Cleared
              </Label>
              <Input
                id="points_per_row"
                name="points_per_row"
                type="number"
                value={settings.points_per_row}
                onChange={handleChange}
                min="10"
                step="10"
                required
                className="mt-1 bg-input border-border/50 focus:border-primary"
                placeholder={POINTS_PER_LINE[1]}
              />
              <p className="mt-1 text-xs text-muted-foreground">Points for a single line. Multi-line clears get multipliers. Default: {POINTS_PER_LINE[1]}. Min: 10.</p>
            </div>

            <div>
              <Label htmlFor="win_score" className="block text-sm font-medium text-foreground/80">
                Score Needed to Win
              </Label>
              <Input
                id="win_score"
                name="win_score"
                type="number"
                value={settings.win_score}
                onChange={handleChange}
                min="100" 
                step="100"
                required
                className="mt-1 bg-input border-border/50 focus:border-primary"
                placeholder={WIN_SCORE_DEFAULT}
              />
              <p className="mt-1 text-xs text-muted-foreground">Target score for players to achieve to win a coupon. Default: {WIN_SCORE_DEFAULT}. Min: 100.</p>
            </div>
            
            <Button type="submit" disabled={isSubmitting || loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-11 button-hover-glow">
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isSubmitting ? 'Saving Settings...' : 'Save Game Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameSettingsManagementPage;
