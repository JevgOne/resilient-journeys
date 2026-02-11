import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";

const IntroVideo = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const { data } = await supabase
        .from("cms_content")
        .select("value")
        .eq("key", "homepage_intro_video")
        .maybeSingle();
      if (data?.value) setVideoUrl(data.value);
    };
    fetchVideo();
  }, []);

  if (!videoUrl) return null;

  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(
      /(?:vimeo\.com\/)(\d+)/
    );
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Play size={14} className="text-primary" />
              <span className="text-sm font-sans font-medium text-primary">
                Watch Introduction
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold">
              See What Resilient Mind Is About
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-elevated aspect-video">
            <iframe
              src={getEmbedUrl(videoUrl)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Resilient Mind Introduction"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroVideo;
