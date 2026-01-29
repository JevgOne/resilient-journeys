import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import VideoPreviewCard from "./VideoPreviewCard";
import CategorySection from "./CategorySection";
import { 
  Heart, Brain, Shield, Palette, Eye, Users, 
  Zap, Compass, Target, Globe, Sun, Puzzle, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoCategory {
  id: string;
  name: string;
  description: string;
  month_number: number;
  icon: string;
}

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  is_free: boolean;
  min_membership: 'free' | 'basic' | 'premium';
  category_id: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  heart: Heart,
  brain: Brain,
  shield: Shield,
  palette: Palette,
  eye: Eye,
  users: Users,
  zap: Zap,
  compass: Compass,
  target: Target,
  globe: Globe,
  sun: Sun,
  puzzle: Puzzle
};

const ProgramOverview = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState(3);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data: categoriesData, error: catError } = await supabase
          .from('video_categories')
          .select('*')
          .order('month_number');

        if (catError) {
          setDebugInfo(prev => prev + `CAT ERROR: ${JSON.stringify(catError)} | `);
        }
        if (categoriesData) {
          setCategories(categoriesData);
          setDebugInfo(prev => prev + `CAT OK: ${categoriesData.length} | `);
        } else {
          setDebugInfo(prev => prev + `CAT DATA: null | `);
        }

        const { data: videosData, error: vidError } = await supabase
          .from('videos')
          .select('*')
          .order('sort_order');

        if (vidError) {
          setDebugInfo(prev => prev + `VID ERROR: ${JSON.stringify(vidError)} | `);
        }
        if (videosData) {
          setVideos(videosData as Video[]);
          setDebugInfo(prev => prev + `VID OK: ${videosData.length}`);
        } else {
          setDebugInfo(prev => prev + `VID DATA: null`);
        }
      } catch (err: any) {
        setDebugInfo(prev => prev + `EXCEPTION: ${err.message}`);
      }

      setLoading(false);
    };

    fetchContent();
  }, []);

  const canAccessVideo = (video: Video) => {
    if (video.is_free) return true;
    if (!profile) return false;
    
    const membershipOrder = { free: 0, basic: 1, premium: 2 };
    return membershipOrder[profile.membership_type as keyof typeof membershipOrder] >= membershipOrder[video.min_membership];
  };

  const isCategoryLocked = (categoryId: string) => {
    const categoryVideos = videos.filter(v => v.category_id === categoryId);
    return categoryVideos.length > 0 && !categoryVideos.some(v => canAccessVideo(v));
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-pulse text-gold">Loading program content...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="py-16 text-center">
        <Lock className="h-16 w-16 text-gold/30 mx-auto mb-4" />
        <h3 className="font-serif text-2xl mb-2">Content in Preparation</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're preparing video lessons and materials. Subscribe for updates!
        </p>
        {debugInfo && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded text-xs text-left max-w-xl mx-auto font-mono">
            DEBUG: {debugInfo}
          </div>
        )}
      </div>
    );
  }

  const displayedCategories = categories.slice(0, visibleCategories);
  const hasMoreCategories = visibleCategories < categories.length;

  return (
    <div className="space-y-4">
      {/* Categories with videos */}
      {displayedCategories.map((category) => {
        const IconComponent = iconMap[category.icon] || Heart;
        const categoryVideos = videos.filter(v => v.category_id === category.id);
        const locked = isCategoryLocked(category.id);

        return (
          <CategorySection
            key={category.id}
            monthNumber={category.month_number}
            title={category.name}
            description={category.description}
            icon={<IconComponent className="h-6 w-6 text-gold" />}
            isLocked={locked}
          >
            {categoryVideos.length > 0 ? (
              categoryVideos.map((video) => (
                <VideoPreviewCard
                  key={video.id}
                  title={video.title}
                  description={video.description || ""}
                  thumbnailUrl={video.thumbnail_url}
                  duration={video.duration_minutes}
                  isLocked={!canAccessVideo(video)}
                  isFree={video.is_free}
                  membership={video.min_membership}
                  onClick={() => navigate(`/video/${video.id}`)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-muted/50 rounded-xl">
                <p className="text-muted-foreground">Videos coming soon</p>
              </div>
            )}
          </CategorySection>
        );
      })}

      {/* Load more / CTA */}
      <div className="pt-8 text-center">
        {hasMoreCategories && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setVisibleCategories(prev => prev + 3)}
            className="border-gold text-gold hover:bg-gold hover:text-white mb-4"
          >
            Show More Months ({categories.length - visibleCategories} remaining)
          </Button>
        )}

        {!user && (
          <div className="mt-8 p-8 bg-gradient-warm rounded-2xl border border-gold/20">
            <h3 className="font-serif text-2xl mb-3">
              Get Full Program Access
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Sign up or log in and unlock all video lessons, 
              workbooks and exclusive content.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/auth">
                <Button className="bg-gold hover:bg-gold-dark text-white shadow-gold">
                  Start Free
                </Button>
              </Link>
              <Link to="#pricing">
                <Button variant="outline" className="border-gold text-gold">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramOverview;
