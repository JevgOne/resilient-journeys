export const EARLY_BIRD_END = new Date('2026-03-31T23:59:59Z');

export function isEarlyBird(): boolean {
  return new Date() < EARLY_BIRD_END;
}

export interface MembershipTier {
  id: string;
  name: string;
  regularPrice: number;
  earlyBirdPrice: number;
  period: '/month' | '/year';
  interval: 'month' | 'year';
  membershipType: 'basic' | 'premium';
  subtitle: string;
  description: string;
  features: string[];
  idealFor: string[];
  buttonText: string;
  highlighted: boolean;
  badge: string | null;
  hidden: boolean;
  quote?: string;
  savingsNote?: string;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'basic_monthly',
    name: 'Basic Monthly',
    regularPrice: 37,
    earlyBirdPrice: 27,
    period: '/month',
    interval: 'month',
    membershipType: 'basic',
    subtitle: 'For when you want to begin gently — without pressure or long-term commitment',
    description:
      'Access for 1 month (pay-as-you-go). Unlocks one month at a time.',
    features: [
      '4 weekly videos',
      '4 weekly workbooks & reflective exercises',
      'Guided meditations',
      'Unlocks one month at a time',
    ],
    idealFor: [
      'Want to try the program first',
      'Need flexibility month by month',
      'Not sure how much space you currently have',
    ],
    buttonText: 'Start Basic Monthly',
    highlighted: false,
    badge: null,
    hidden: false,
    quote: '"I don\'t have to decide everything right now."',
  },
  {
    id: 'basic_yearly',
    name: 'Basic Yearly',
    regularPrice: 370,
    earlyBirdPrice: 370,
    period: '/year',
    interval: 'year',
    membershipType: 'basic',
    subtitle: 'For those who want spaciousness, continuity, and fewer decisions',
    description:
      'Full 12-month program access from day one. Self-paced — move in your own rhythm. The program stays open until you finish.',
    features: [
      'Full 12-month program access from day one',
      '48 core videos',
      '48 workbooks & exercises',
      'Guided meditations',
      'Self-paced access — move in your own rhythm',
      'The program stays open until you finish',
      '14-day money-back guarantee',
    ],
    idealFor: [
      'Already know this kind of inner work matters',
      'Want a stable anchor for the year',
      'Like knowing everything is already there when you need it',
    ],
    buttonText: 'Save with Yearly',
    highlighted: false,
    badge: 'Save €74',
    hidden: true,
    quote: '"I don\'t want to keep deciding every month — I want space to actually go deeper."',
    savingsNote: 'Save €74 compared to monthly',
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    regularPrice: 47,
    earlyBirdPrice: 37,
    period: '/month',
    interval: 'month',
    membershipType: 'premium',
    subtitle: 'For when you want deeper understanding and shared space — without long-term commitment',
    description:
      'Everything from the Basic Membership plus community and additional hubs.',
    features: [
      'Everything from Basic Membership',
      'Access to the Premium Community (Skool)',
      'Additional Hub: The Transformed Self',
      'Additional Hub: Navigating Expat Life with Chronic Pain',
    ],
    idealFor: [
      'Community support helps you stay connected',
      'Want to explore deeper identity shifts',
      'Value reflection, sharing, and belonging',
    ],
    buttonText: 'Go Premium Monthly',
    highlighted: true,
    badge: 'Most Popular',
    hidden: false,
    quote: '"I don\'t want to do this completely alone."',
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    regularPrice: 470,
    earlyBirdPrice: 470,
    period: '/year',
    interval: 'year',
    membershipType: 'premium',
    subtitle: 'For those ready for full support, integration, and real transformation',
    description:
      'The most supported way to walk the journey. Self-paced access — the program stays open until you finish.',
    features: [
      'Full 12-month program access',
      'All Basic content (48 videos, workbooks & meditations)',
      'Premium Community access (Skool)',
      'Additional Hubs: The Transformed Self + Chronic Pain',
      'Live Zoom calls (group support & integration)',
      '1-hour individual session included',
      'The program stays open until you finish',
      '14-day money-back guarantee',
    ],
    idealFor: [
      'Want to be seen and supported',
      'Value live connection and real-time reflection',
      'Ready to integrate emotional, physical, and identity healing',
    ],
    buttonText: 'Get Full Access',
    highlighted: true,
    badge: 'Save €94',
    hidden: true,
    quote: '"I want guidance, not just content."',
    savingsNote: 'Save €94 compared to monthly',
  },
];

export function getVisibleTiers(): MembershipTier[] {
  return MEMBERSHIP_TIERS.filter((t) => !t.hidden);
}

export function getTierPrice(tier: MembershipTier): number {
  return isEarlyBird() ? tier.earlyBirdPrice : tier.regularPrice;
}

export function formatEarlyBirdEnd(): string {
  return '31.3.2026';
}
