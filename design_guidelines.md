# Design Guidelines: Food Catering Company Website

## Design Approach

**Reference-Based**: Drawing inspiration from premium food delivery and hospitality platforms (Uber Eats, DoorDash, high-end restaurant websites) combined with clean admin interfaces (Shopify, Square for Business).

### Customer-Facing Design Principles
- Visual-first food presentation with appetite appeal
- Easy browsing and quick item discovery
- Professional catering credibility

### Admin Interface Principles
- Efficiency-focused data management
- Clear information hierarchy
- Streamlined workflow patterns

---

## Typography System

**Customer Pages:**
- Headlines: Bold sans-serif, 3xl to 5xl (food categories, hero)
- Food Item Names: Semi-bold, xl to 2xl
- Descriptions: Regular weight, base to lg, readable line height (1.6)
- Prices: Bold, lg to xl for prominence

**Admin Dashboard:**
- Page Titles: Bold, 2xl to 3xl
- Section Headers: Semi-bold, xl
- Labels/Data: Regular, sm to base
- Use tabular numbers for prices and quantities

**Font Recommendation:** Google Fonts - Poppins (headings) + Inter (body)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20

**Customer Pages:**
- Hero: 60-80vh with full-width food imagery
- Content sections: py-16 to py-20 desktop, py-12 mobile
- Food grid: 2 columns tablet, 3-4 columns desktop
- Container: max-w-7xl with px-4 to px-8

**Admin Dashboard:**
- Sidebar: Fixed 64 width
- Content area: Fluid with max-w-7xl
- Cards: Consistent p-6 padding
- Form spacing: space-y-4 for form groups

---

## Component Library

### Customer Interface Components

**Hero Section:**
- Full-width background image showing beautifully plated catering spread
- Centered headline + tagline overlay with blurred background button
- Primary CTA button: "View Our Menu" or "Book Your Event"
- Include trust indicator: "Catering 500+ Events Annually"

**Food Item Cards:**
- Card layout with 3:2 aspect ratio food image
- Food name (bold, prominent)
- Brief description (2-3 lines)
- Price display (large, clear)
- Category badge (appetizer, main, dessert, beverage)
- Rounded corners (rounded-lg)
- Subtle shadow on hover

**Category Navigation:**
- Sticky horizontal scroll on mobile
- Tab-style navigation for desktop
- Active state with underline accent

**Page Structure:**
1. Hero with compelling food imagery
2. Category tabs/filters
3. Food items grid (masonry or standard grid)
4. Call-to-action section: "Ready to Book Your Event?"
5. Footer with contact info and social links

### Admin Dashboard Components

**Sidebar Navigation:**
- Dashboard overview
- Manage Food Items
- Event Bookings
- Orders
- Company Settings
- Icon + label format
- Active state indicator

**Data Tables:**
- Striped rows for readability
- Action buttons (Edit, Delete) aligned right
- Search and filter controls above table
- Pagination below table
- Responsive: cards on mobile, table on desktop

**Food Item Management:**
- Form with image upload preview
- Fields: Name, Description, Price, Category
- Image dropzone with preview thumbnail
- Save/Cancel action buttons

**Dashboard Cards:**
- Key metrics: Total Orders, Active Events, Revenue
- Icon + number + label format
- Grid layout: 3-4 columns desktop, 1-2 mobile

**Form Controls:**
- Input fields: Full border, rounded-md, p-3
- Labels above inputs, font-medium
- Textarea for descriptions with adequate height
- Select dropdowns with custom styling
- File upload with drag-and-drop zone

---

## Images

**Hero Image:** 
Large, professional photograph of elegantly arranged catering buffet or beautifully plated dishes. Should convey abundance, quality, and professionalism. Full-width, 60-80vh height.

**Food Item Images:**
Individual high-quality photos of each menu item on clean backgrounds or styled table settings. 3:2 aspect ratio, optimize for web. These are critical for customer decision-making.

**Admin Placeholder:**
Use generic image placeholders until actual photos are uploaded.

---

## Accessibility Standards

- All images include descriptive alt text
- Form inputs have associated labels
- Keyboard navigation support throughout
- Focus states visible on all interactive elements
- ARIA labels for icon-only buttons
- Minimum touch target: 44px × 44px for mobile

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column food grid
- Stacked hero content
- Hamburger navigation
- Admin tables convert to cards

**Tablet (768px - 1024px):**
- 2-column food grid
- Simplified admin sidebar (icons only with tooltips)

**Desktop (> 1024px):**
- 3-4 column food grid
- Full admin sidebar with labels
- Expanded forms side-by-side

---

## Interaction Patterns

**Customer:**
- Smooth scroll to categories when clicked
- Lazy loading for food images
- Hover effect on food cards (subtle lift + shadow)

**Admin:**
- Inline editing where practical
- Confirmation modals for delete actions
- Toast notifications for success/error states
- Loading states for async operations

---

**Critical Note:** Customer interface prioritizes visual appeal and food presentation. Admin interface prioritizes efficiency and data clarity. Both maintain professional catering industry credibility.