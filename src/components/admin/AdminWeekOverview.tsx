import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, XCircle, AlertCircle, Video as VideoIcon, FileText } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  category_id: string;
  week_number: number | null;
  video_type: 'eft' | 'art_therapy' | 'meditation' | 'other';
  is_intro: boolean;
}

interface Resource {
  id: string;
  title: string;
  category_id: string | null;
  week_number: number | null;
  resource_subtype: string | null;
}

interface Category {
  id: string;
  name: string;
  month_number: number;
}

interface WeekStatus {
  weekNumber: number;
  hasEFT: boolean;
  hasArtTherapy: boolean;
  hasMeditation: boolean;
  hasWorkbook: boolean;
}

const MONTHS = 12;
const WEEKS_PER_MONTH = 4;

const AdminWeekOverview = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [categoriesRes, videosRes, resourcesRes] = await Promise.all([
        supabase.from('video_categories').select('id, name, month_number').order('month_number'),
        supabase.from('videos').select('id, title, category_id, week_number, video_type, is_intro'),
        supabase.from('resources').select('id, title, category_id, week_number, resource_subtype'),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (videosRes.data) setVideos(videosRes.data as Video[]);
      if (resourcesRes.data) setResources(resourcesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStatus = (categoryId: string, weekNumber: number): WeekStatus => {
    const weekVideos = videos.filter(
      (v) => v.category_id === categoryId && v.week_number === weekNumber && !v.is_intro
    );
    const weekResources = resources.filter(
      (r) => r.category_id === categoryId && r.week_number === weekNumber
    );

    return {
      weekNumber,
      hasEFT: weekVideos.some((v) => v.video_type === 'eft'),
      hasArtTherapy: weekVideos.some((v) => v.video_type === 'art_therapy'),
      hasMeditation: weekVideos.some((v) => v.video_type === 'meditation'),
      hasWorkbook: weekResources.some((r) => r.resource_subtype === 'workbook'),
    };
  };

  const getMonthProgress = (categoryId: string): number => {
    const totalItems = WEEKS_PER_MONTH * 4; // 4 items per week (EFT, Art, Meditation, Workbook)
    let completedItems = 0;

    for (let week = 1; week <= WEEKS_PER_MONTH; week++) {
      const status = getWeekStatus(categoryId, week);
      if (status.hasEFT) completedItems++;
      if (status.hasArtTherapy) completedItems++;
      if (status.hasMeditation) completedItems++;
      if (status.hasWorkbook) completedItems++;
    }

    return Math.round((completedItems / totalItems) * 100);
  };

  const getIntroVideos = (categoryId: string) => {
    return videos.filter((v) => v.category_id === categoryId && v.is_intro);
  };

  const StatusIcon = ({ hasItem }: { hasItem: boolean }) => {
    if (hasItem) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-gray-300" />;
  };

  const WeekCard = ({ categoryId, weekNumber }: { categoryId: string; weekNumber: number }) => {
    const status = getWeekStatus(categoryId, weekNumber);
    const allComplete = status.hasEFT && status.hasArtTherapy && status.hasMeditation && status.hasWorkbook;
    const someComplete = status.hasEFT || status.hasArtTherapy || status.hasMeditation || status.hasWorkbook;

    return (
      <Card className={`border ${allComplete ? 'border-green-500/50 bg-green-50/5' : someComplete ? 'border-yellow-500/30' : 'border-gray-200'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Week {weekNumber}</span>
            {allComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
            {!allComplete && someComplete && <AlertCircle className="h-4 w-4 text-yellow-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <VideoIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">EFT</span>
            </div>
            <StatusIcon hasItem={status.hasEFT} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <VideoIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Art Therapy</span>
            </div>
            <StatusIcon hasItem={status.hasArtTherapy} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <VideoIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Meditation</span>
            </div>
            <StatusIcon hasItem={status.hasMeditation} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Workbook</span>
            </div>
            <StatusIcon hasItem={status.hasWorkbook} />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading week overview...
      </div>
    );
  }

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="font-serif">12-Month Week Overview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual overview of content completion for all 12 months (4 weeks each)
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {Array.from({ length: MONTHS }, (_, i) => i + 1).map((monthNumber) => {
            const category = categories.find((c) => c.month_number === monthNumber);
            const progress = category ? getMonthProgress(category.id) : 0;
            const introVideos = category ? getIntroVideos(category.id) : [];

            return (
              <AccordionItem key={monthNumber} value={`month-${monthNumber}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        Month {monthNumber}
                        {category && `: ${category.name}`}
                      </span>
                      <Badge variant={progress === 100 ? 'default' : progress > 0 ? 'secondary' : 'outline'}>
                        {progress}% Complete
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {introVideos.length > 0 && (
                        <Badge variant="outline" className="bg-purple-50">
                          {introVideos.length} Intro
                        </Badge>
                      )}
                      <Progress value={progress} className="w-24 h-2" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-4">
                    {/* Intro Videos Section */}
                    {introVideos.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <VideoIcon className="h-4 w-4 text-purple-500" />
                          Intro Videos
                        </h4>
                        <div className="pl-6 space-y-1">
                          {introVideos.map((video) => (
                            <div key={video.id} className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-500" />
                              {video.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Week Cards Grid */}
                    {category ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: WEEKS_PER_MONTH }, (_, i) => i + 1).map((weekNumber) => (
                          <WeekCard key={weekNumber} categoryId={category.id} weekNumber={weekNumber} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Category not created yet
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default AdminWeekOverview;
