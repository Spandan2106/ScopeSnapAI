import { SampleBrief } from '../types.ts';

export const SAMPLE_BRIEFS: SampleBrief[] = [
  {
    id: 'sample-ecommerce-jaipur',
    title: 'Ethnic Apparel D2C Store (Jaipur)',
    clientName: 'Sunita Sharma (Virasat Handlooms)',
    category: 'E-commerce & D2C',
    brief: `Hey! Sunita here from Virasat Handlooms in Jaipur. We make hand-block printed cotton kurtis and sarees. Right now we are getting almost 40-50 orders a week purely through WhatsApp messages and Instagram DMs, but managing payments and shipping manually is becoming chaotic.

We need a clean, premium website where customers can browse our catalog (we have about 80 SKUs right now), pick sizes, and pay via UPI / Razorpay or Cash on Delivery. 

Key things we think we need:
- Mobile-first design because 90% of our buyers are on phone
- Razorpay payment gateway + COD option
- Automatic shipping rate calculation (we use Shiprocket)
- WhatsApp floating chat icon so people can still talk to our support
- Discount coupon code system for our upcoming festive launch
- Customer reviews with photos if possible
- We also get B2B wholesale inquiries from boutique owners in Mumbai, so maybe a separate form or page for bulk pricing?

We have high-res photos and product descriptions in an Excel sheet. We want to launch in about 3 to 4 weeks. Can you tell us how much this will cost and what your timeline looks like?`,
    freelancerName: 'Aarav Mehta',
    businessName: 'StudioCraft Web Solutions',
    currency: 'INR',
    tone: 'Consultative & Warm',
    estimatedBudget: '75,000',
    targetTimeline: '3-4 weeks',
  },
  {
    id: 'sample-clinic-bengaluru',
    title: 'Dental & Orthodontics Clinic (Bengaluru)',
    clientName: 'Dr. Radhika Rao (SmileCare Dental)',
    category: 'Local Healthcare & Service',
    brief: `Hello, Dr. Radhika here. We operate a dental and cosmetic implant clinic in Indiranagar, Bengaluru. Our existing WordPress website was built 5 years ago by a college student; it is extremely slow, not mobile responsive, and looks outdated.

We want a total redesign:
1. Modern, trustworthy medical aesthetic (light blue and warm beige tones).
2. Online appointment booking form where patients select treatment (e.g. Root Canal, Teeth Whitening, Braces) and pick a time slot. It should sync with our reception Google Calendar.
3. Profile pages for our 4 doctors with credentials and patient reviews.
4. Clear treatment explanations with before/after photos and tentative price ranges.
5. Local SEO optimization so patients in Indiranagar, Koramangala, and Domlur find us on Google search.
6. WhatsApp integration for urgent toothache queries.

We don't know the exact budget yet, we want to see your proposal and milestone payment options. When could you deliver?`,
    freelancerName: 'Priya Sundaram',
    businessName: 'NextWave Digital Studio',
    currency: 'INR',
    tone: 'Professional & Direct',
    estimatedBudget: '',
    targetTimeline: '4-5 weeks',
  },
  {
    id: 'sample-saas-mvp',
    title: 'Fleet Logistics Dispatcher Dashboard MVP',
    clientName: 'Vikram Joshi (InterRoute Logistics)',
    category: 'B2B SaaS / Web App',
    brief: `Hi team, we are building an inter-city truck freight startup based in Pune. We have verified product-market fit with 12 fleet operators and now need a functional web dashboard for their dispatchers.

Core features required for MVP:
- Secure login with role permissions (Admin, Dispatcher, Read-only auditor)
- Live active fleet list table: truck ID, driver contact, origin, destination, current status (Dispatched, En Route, Breakdown, Delivered)
- Filter by status and export monthly trip logs to CSV/Excel
- Driver assignment modal with truck capacity check
- Simple metrics bar at the top: Total active trucks, on-time delivery %, delayed trips today
- We have rough Figma wireframes ready for 5 main screens.
- Tech preference: React + Node or Next.js, clean Tailwind UI.

Our seed grant budget is around ₹1,10,000. Looking for an experienced developer who can deliver a reliable MVP in 5 weeks without unnecessary over-engineering.`,
    freelancerName: 'Rohan Gupta',
    businessName: 'Apex Stack Engineering',
    currency: 'INR',
    tone: 'Technical & Structured',
    estimatedBudget: '1,10,000',
    targetTimeline: '5 weeks',
  },
  {
    id: 'sample-restaurant-mumbai',
    title: 'Boutique Cafe & Bakery (Bandra, Mumbai)',
    clientName: 'Chef Kabir Sen (Artisan & Flour)',
    category: 'Hospitality & F&B',
    brief: `Hey there! We are launching a sourdough artisanal bakery and European cafe in Bandra West next month. 
We need a mouth-watering visual website:
- High aesthetic showcase of daily bake schedule (croissants, sourdough loaves, cruffins)
- Table reservation request form with SMS/WhatsApp confirmation
- Downloadable PDF menu and responsive digital food menu with dietary tags (vegan, gluten-free, keto)
- Instagram photo feed sync
- Google Maps directions and Zomato/Swiggy order redirects
- Fast loading speed on 4G/5G mobile phones.

No online ordering/payment engine needed for now, just table booking and menu browsing. Budget around ₹40,000. Need it done within 2 weeks!`,
    freelancerName: 'Devansh Verma',
    businessName: 'Minimal Webworks',
    currency: 'INR',
    tone: 'Consultative & Warm',
    estimatedBudget: '40,000',
    targetTimeline: '2 weeks',
  },
];
