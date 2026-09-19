# RAG_V2 Landing Page Design Handoff

## Purpose

The landing page introduces RAG_V2 as an AI-powered study assistant for students. It explains the product, demonstrates its main capabilities, presents the creator, and directs visitors to authentication.

The page is a single long-scroll experience rendered by `frontend/src/components/landing/LandingPage.jsx` when `screen === "landing"` in `frontend/src/App.jsx`.

## Component Tree

```text
LandingPage
|-- Navbar
|-- NoticePopup
|-- Hero
|-- FeatureCarousel
|-- Compact Features Grid
|-- About
|-- AboutContact
|-- Final CTA
`-- Footer
```

## Page Flow

1. The fixed navbar is visible immediately.
2. A development notice modal opens automatically about 600 ms after the page mounts.
3. After dismissing the modal, visitors see the hero and can scroll through the page.
4. The primary calls to action open the login screen.
5. Navbar links scroll to the Home, Features, About, and Contact sections.

## Visual Direction

- Warm, friendly, student-focused AI product aesthetic.
- Rose, amber, orange, emerald, cyan, blue, and occasional purple accents.
- Light page background with rose, amber, and orange gradients.
- Translucent white panels with backdrop blur.
- Thin low-opacity borders and soft shadows.
- Rounded cards and buttons, generally using large corner radii.
- Gradient text, especially rose-to-amber gradients.
- Lucide icons for most product and navigation icons.
- Plus Jakarta Sans is the main global font, loaded in `frontend/src/index.css`.
- The footer switches to a dark navy visual treatment for contrast.

Avoid making the page look like a generic SaaS dashboard. It should feel like a polished learning product with visible AI behavior and a welcoming student-oriented tone.

## Navbar

Implemented in `frontend/src/components/common/Navbar.jsx`.

### Desktop

- Fixed to the top of the viewport.
- Translucent glass background before scrolling.
- Stronger white blur, bottom border, and shadow after scrolling.
- Left side contains a gradient square logo with a Sparkles icon and the `RAG_V2` wordmark.
- Center navigation contains:
  - Home
  - Features
  - About
  - Contact
- Active section is detected through `IntersectionObserver`.
- Active navigation uses rose text and an animated rose-to-amber underline.
- Right side contains a `Get Started` button.

### Mobile

- Desktop links are replaced by a menu icon.
- Opening the menu shows a full-width glass dropdown.
- The dropdown contains the same four navigation links and a `Get Started` button.
- Selecting an item closes the menu.

### Behavior

- Navigation uses custom smooth scrolling with approximately 900 ms easing.
- `Get Started` changes the app screen to `login`; it does not directly start note upload.

## Development Notice Modal

Implemented in `frontend/src/components/landing/NoticePopup.jsx`.

### Appearance

- Full viewport overlay.
- Dark translucent backdrop with blur.
- Centered white glass-style modal.
- Rose, amber, and orange decorative glows.
- Rounded corners and animated entrance.
- Close icon in the top-right corner.

### Content

Badge: `Development Notice`

Heading: `Welcome!`

The message explains that the project is actively under development, with ongoing UI improvements, feature additions, data migration, and folder restructuring.

Secondary callout:

> Also... yes, it's still called RAG_V2.

It humorously explains that a better name is planned.

### Actions

- `Got it`
- `Us Broo!`
- Close icon

All three actions dismiss the modal. There is currently no persistence, so the modal appears again whenever the landing component mounts.

### Redesign consideration

The modal currently blocks the first view of the hero. Decide whether to preserve this as a deliberate project notice or replace it with a less intrusive banner or dismissible announcement strip.

## Hero Section

The hero is the `home` section in `LandingPage.jsx`.

### Layout

- Centered horizontally and vertically.
- Large top padding to compensate for the fixed navbar.
- Center-aligned text.
- Warm gradient background with large blurred glow shapes.
- Initial fade-up entrance animation.

### Content

Badge: `AI Powered Study Assistant`

Heading:

> Learn Smarter with RAG_V2

Supporting copy:

> Upload your notes, ask questions, generate quizzes, and track your learning - all powered by Retrieval-Augmented AI.

### Actions

Primary button: `Start Learning`

- Rose-to-amber gradient.
- Arrow-right icon.
- Opens the login screen.

Secondary button: `Explore Features`

- Transparent glass-style button.
- Smoothly scrolls to the Features section.

### Current gap

The hero does not currently contain a product screenshot, dashboard preview, or illustration. A redesign can introduce a strong product visual here, provided it remains consistent with the rest of the page.

## Feature Carousel

Implemented in `frontend/src/components/landing/FeatureCarousel.jsx`.

This is the primary interactive product demonstration section.

### Heading

Badge: `Features`

Heading:

> Powerful Features Built for Students

Supporting copy:

> Everything you need to learn faster with AI assistance

### Slide 1: AI Chat with Your Notes

Description:

> Ask questions and get grounded answers directly from your study material using RAG-based retrieval.

Animated preview:

- User avatar and typed question:
  `What is Retrieval-Augmented Generation?`
- AI thinking dots.
- Typed answer:
  `RAG combines retrieval with generation - it fetches relevant notes first, then answers.`
- Input bar:
  `Ask about your notes...`

Color direction: rose and amber.

### Slide 2: Smart Quiz Generator

Description:

> Automatically generate MCQs from your notes and test your understanding instantly.

Animated preview:

- `Question 1 of 5`
- `AI Generated`
- Question: `What does RAG stand for in AI?`
- Options:
  - Retrieval-Augmented Generation
  - Rapid API Gateway
  - Random Access Grammar
- Options appear one at a time.
- The correct answer eventually highlights in blue with a checkmark.

Color direction: blue and cyan.

### Slide 3: Performance Analytics

Description:

> Track weak topics and improve your learning efficiency with AI insights.

Animated preview:

- `Weekly Accuracy`
- Counter animates to approximately `+18.4%`.
- Status label: `Improving`.
- Seven growing bar-chart columns.
- Labels range from `Mon` to `Sun`.

Color direction: purple and pink.

### Slide 4: Upload and Index Notes

Description:

> Upload markdown notes and let AI structure and index them instantly.

Animated preview:

- Dashed upload area.
- `Drop your notes here`.
- `Markdown, PDF, or TXT`.
- Example files:
  - `dbms-notes.md`
  - `os-chapter-3.md`
- Files slide in and receive checkmarks.

Color direction: emerald and teal.

### Interactions

- Autoplay advances every 4.5 seconds.
- Autoplay pauses while the pointer is over the carousel.
- Desktop previous and next arrow buttons.
- Keyboard support with Left and Right arrow keys.
- Mobile horizontal swipe support.
- Dot navigation below the carousel.
- Slide counter, for example `1 / 4`.
- Mobile helper text: `Swipe to explore`.

### Responsive behavior

Desktop uses a two-column slide:

- Left: icon, title, description, accent line.
- Right: animated product preview.

Mobile stacks the text above the preview, hides arrow buttons, and enables swipe navigation.

## Compact Features Grid

This section provides a concise overview after the interactive carousel.

### Heading

Badge: `Features`

Heading:

> Everything You Need to Study Smarter

Supporting copy:

> AI-powered tools designed to enhance your learning experience.

### Cards

1. `Smart Notes Upload` - Upload markdown notes and turn them into AI searchable knowledge.
2. `AI Chat Assistant` - Ask anything from your notes and get instant answers.
3. `Quiz Generator` - Auto-generate MCQs from your study topics.
4. `Performance Analytics` - Identify weak areas with AI-powered insights.
5. `Smart Roadmaps` - Get personalized study roadmaps for your goals.
6. `Progress Tracking` - Track your learning with detailed analytics.

### Layout and styling

- One column on mobile.
- Two columns on small screens.
- Three columns on large screens.
- Semi-transparent white cards.
- Compact typography.
- Hover lift and soft colored glow.
- Each card has its own icon color and gradient family.

Bottom badges:

- `AI-Powered`
- `Real-time`
- `Student-Friendly`

## About Section

Implemented in `frontend/src/components/landing/About.jsx`.

### Layout

Desktop uses two columns:

- Left: study image with floating badges.
- Right: product explanation, feature grid, vision card, and CTA.

Mobile stacks these areas vertically.

### Image panel

The current implementation uses an external Unsplash image showing a student studying with books and a laptop.

Behavior:

- Large rounded image container.
- Approximately 420 px image height.
- Slight hover scale effect.
- Small scroll-based parallax translation.
- Subtle rose gradient overlay.

Floating badges:

- Bottom-right: `AI Powered` and `RAG_V2` with a rocket icon.
- Top-left: `4.9` with a sparkle icon.

### Copy

Badge: `About RAG_V2`

Heading:

> Building a Smarter Way to Learn with AI

The body explains that RAG_V2 answers questions from the user's own notes using Retrieval-Augmented Generation, making assistance more accurate and context-aware.

### Supporting feature cards

- `AI-Powered Learning`
- `Personalized Insights`
- `Performance Analytics`
- `Smart Quiz Generation`

Cards use a two-column grid and reveal with staggered animation delays.

### Vision card

Heading: `Vision`

The vision is to create an intelligent study companion that adapts to every learner and transforms static notes into an interactive learning ecosystem.

### CTA

Text: `Learn more about RAG_V2`

It is currently visual only and has no implemented action.

## Statistics

Also implemented in `About.jsx`.

Statistics:

- `100K+` - Questions Answered
- `50K+` - Students Active
- `95%` - Accuracy Rate
- `4.9` - User Rating

### Behavior

- Counters begin when the section enters the viewport.
- Values animate with `requestAnimationFrame`.
- Cards appear with staggered delays.
- Two columns on mobile.
- Four columns on desktop.

## Creator and Contact Section

Implemented in `frontend/src/components/landing/AboutContact.jsx`.

### Heading

Badge: `About the Creator`

Heading:

> Built with Passion for AI-driven Learning

Subtitle: `AI Engineer & Full Stack Developer`

### Profile card

Creator: `Prateek Saha`

Role: `AI Engineer & Full Stack Developer`

Description:

> Passionate about building intelligent systems that enhance human learning. Currently working on RAG-based AI applications and scalable web platforms.

Avatar:

- Gradient square avatar.
- Initials: `PS`.
- Small green status indicator.

Technology tags:

- AI/ML
- RAG
- Full Stack
- Python
- React

Social links:

- GitHub
- LinkedIn
- Instagram
- Email

### Contact card

Heading: `Contact Me`

Supporting copy:

> Feel free to reach out for collaborations, projects, or just a chat.

Contact details:

- Email: `prateeksaha963@gmail.com`
- Location: `Chhattisgarh, INDIA`
- Status: `Available for Freelance`

Primary button: `Send Message`

The button is currently visual only and has no click handler.

### Styling

- Two large cards on desktop.
- Stacked cards on mobile.
- White translucent surfaces.
- Large rounded corners.
- Rose, amber, orange, and emerald accent colors.
- Hover lift and shadow effects.

## Final CTA

Located near the bottom of `LandingPage.jsx`.

Badge: `Get Started Today`

Heading:

> Start Your AI Learning Journey

Supporting copy:

> Smarter learning starts here. Join thousands of students using RAG_V2.

Button: `Get Started`

Supporting trust text: `Trusted by students worldwide`

The button opens the login screen.

## Footer

Implemented in `frontend/src/components/common/Footer.jsx`.

### Visual treatment

- Dark navy background, approximately `#050816`.
- Blue and purple atmospheric glows.
- White and gray typography.
- Large outlined/background `RAG_v2` wordmark near the bottom.

### Left column

- Logo linked to the GitHub repository.
- Product description:
  `Thanks for stopping by! Explore this AI-powered RAG system designed to transform studying into a personalized, intelligent experience.`
- Social links for X, GitHub, and LinkedIn.

### Link columns

Projects:

- Data Engineering
- Machine Learning
- Computer Vision

Resources:

- Help Center
- Blogs
- Store

Company:

- About
- Vision
- Careers
- Contact
- `HIRING` badge beside Careers

Most of these links currently use placeholder `#` destinations.

### Bottom bar

- `© 2026 RAG_v2`
- `All rights reserved.`

## Motion System

- Hero fade-up entrance.
- Carousel autoplay.
- Chat typing and AI thinking animation.
- Quiz option reveal and correct-answer highlight.
- Analytics chart growth and counter animation.
- Upload file entrance animation.
- About content reveal using `IntersectionObserver`.
- Statistics counter animation on visibility.
- Floating image badges.
- Slow decorative glow movement.
- Hover lift and scale effects on cards and buttons.
- Partial `prefers-reduced-motion` support exists in `frontend/src/index.css`.

## Functional Constraints and Gaps

- `Start Learning`, navbar `Get Started`, and final CTA open login.
- `Explore Features` scrolls to the carousel.
- Navbar navigation uses section scrolling rather than route changes.
- The notice popup blocks the first view until dismissed.
- Carousel previews are animated mockups, not live product data.
- `Learn more about RAG_V2` has no current action.
- `Send Message` has no current action.
- Footer links are mostly placeholders.
- The hero currently has no product screenshot or dashboard preview.
- The page repeats the word `Features` for both the carousel and compact grid. The redesign should make their purposes visually distinct:
  - Carousel: interactive demonstrations.
  - Grid: concise capability summary.

## Recommended Redesign Priorities

1. Preserve the clear path from hero to authentication.
2. Keep the carousel previews because they communicate product behavior better than static feature cards.
3. Make the hero communicate the actual product interface more strongly.
4. Decide whether the development notice should remain modal or become a non-blocking announcement.
5. Keep the creator section separate from the product story so the personal identity does not compete with the primary product CTA.
6. Replace placeholder actions with real destinations when the corresponding pages are available.
7. Maintain usable mobile behavior for navigation, carousel swiping, card stacking, and CTA buttons.