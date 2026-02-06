export const EARLY_BIRD_END = new Date('2026-04-25T23:59:59Z');

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
  description: string;
  features: string[];
  buttonText: string;
  highlighted: boolean;
  badge: string | null;
  hidden: boolean;
  quote?: string;
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
    description:
      'Access to foundational Module A of current program theme each month. Perfect for starting your resilience journey at your own pace.',
    features: [
      'Monthly foundational module (Module A)',
      'Downloadable worksheets for Module A',
      'Access to meditation library',
      'Monthly content updates',
    ],
    buttonText: 'Start Basic Monthly',
    highlighted: false,
    badge: null,
    hidden: false,
    quote: '"This program helped me find my footing in a new country."',
  },
  {
    id: 'basic_yearly',
    name: 'Basic Yearly',
    regularPrice: 370,
    earlyBirdPrice: 370,
    period: '/year',
    interval: 'year',
    membershipType: 'basic',
    description:
      'Complete access to all 4 programs (12 months) with all modules.',
    features: [
      'All 4 transformational programs (12 months)',
      'Complete access to all modules (A, B, C)',
      'All downloadable worksheets & exercises',
      'Full meditation & visualization library',
    ],
    buttonText: 'Save with Yearly',
    highlighted: false,
    badge: 'Best Value',
    hidden: true,
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    regularPrice: 47,
    earlyBirdPrice: 37,
    period: '/month',
    interval: 'month',
    membershipType: 'premium',
    description:
      'Enhanced access to foundational and advanced modules (A & B) plus priority support and additional Resilient Hub content.',
    features: [
      'Modules A & B of current month',
      'All Basic Monthly benefits',
      'Access to additional Resilient Hub (Module A)',
      'Priority support',
    ],
    buttonText: 'Go Premium Monthly',
    highlighted: true,
    badge: 'Most Popular',
    hidden: false,
    quote:
      '"The premium content gave me tools I use every single day."',
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    regularPrice: 470,
    earlyBirdPrice: 470,
    period: '/year',
    interval: 'year',
    membershipType: 'premium',
    description:
      'Complete program access with personal consultations and materials kit.',
    features: [
      'All 4 programs with all modules (A, B, C)',
      '4 hours personal consultations (€348 value)',
      'Art expressive therapy materials kit',
      'Additional Resilient Hubs access',
      'All worksheets, meditations & exercises',
    ],
    buttonText: 'Save with Yearly',
    highlighted: true,
    badge: 'Most Popular',
    hidden: true,
  },
];

export function getVisibleTiers(): MembershipTier[] {
  return MEMBERSHIP_TIERS.filter((t) => !t.hidden);
}

export function getTierPrice(tier: MembershipTier): number {
  return isEarlyBird() ? tier.earlyBirdPrice : tier.regularPrice;
}

export function formatEarlyBirdEnd(): string {
  return '25.4.2026';
}
