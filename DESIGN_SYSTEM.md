# 🎨 Cstyle Design System - Visual Reference

## 🎨 Color Palette

### **Primary Colors**
```
Brand Black:     #0D0D0D    ████████  - Main dark color
Brand Gold:      #D4AF37    ████████  - Luxury accent
Brand Beige:     #F5E6CC    ████████  - Soft accent
White:           #FFFFFF    ████████  - Light background

Gold Dark:       #B8941F    ████████  - Hover states
Gold Light:      #E8C35A    ████████  - Highlights
```

### **Usage**
- **Headers**: Black (dark mode) / White (light mode)
- **CTAs**: Gold buttons
- **Accents**: Gold lines, badges, highlights
- **Backgrounds**: Beige for sections

---

## 🔤 Typography

### **Font Families**
```css
Headings:   font-poppins  (Bold, Modern, Eye-catching)
Body:       font-inter    (Clean, Professional, Readable)
```

### **Scale**
```
Hero Title:       text-7xl (72px) - Main hero text
Page Title:       text-6xl (60px) - Section headers
Card Title:       text-xl (20px) - Product names
Body Large:       text-lg (18px) - Descriptions
Body:             text-base (16px) - Regular text
Small:            text-sm (14px) - Labels
Extra Small:      text-xs (12px) - Meta info
```

---

## 🎭 Component Styles

### **Buttons**

#### Primary (Gold)
```tsx
<button className="btn-primary">
  Shop Now
</button>
```
**Style**: Gold background, black text, hover lift effect

#### Secondary (Black/White)
```tsx
<button className="btn-secondary">
  Learn More
</button>
```
**Style**: Theme-aware, opposite of background

#### Outline (Gold Border)
```tsx
<button className="btn-outline">
  View Details
</button>
```
**Style**: Transparent with gold border, fills on hover

---

### **Cards**

#### Premium Product Card
```tsx
<div className="card-premium">
  {/* Content */}
</div>
```
**Features**:
- White/Dark gray background
- Shadow on hover
- Gold accent line appears
- Smooth transitions

#### Hover Effect
```tsx
<div className="card-hover">
  {/* Content */}
</div>
```
**Effect**: Lifts up 8-12px on hover with enhanced shadow

---

### **Sections**

#### Light Section
```tsx
<section className="py-32 bg-white dark:bg-brand-black">
  <div className="luxury-container">
    {/* Content */}
  </div>
</section>
```

#### Dark Section
```tsx
<section className="py-32 bg-brand-black text-white">
  <div className="luxury-container">
    {/* Content */}
  </div>
</section>
```

#### Gold Section
```tsx
<section className="py-24 bg-gradient-gold">
  <div className="luxury-container">
    {/* Content */}
  </div>
</section>
```

---

## 🎬 Animations

### **Fade In**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### **Slide Up**
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
>
  Content
</motion.div>
```

### **Hover Lift**
```tsx
<motion.div
  whileHover={{ y: -8 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### **Scale In**
```tsx
<motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

---

## 🏗️ Layout Structure

### **Container Widths**
```
luxury-container:  max-w-7xl mx-auto px-6 lg:px-8
Full-width:        w-full
Narrow:            max-w-4xl mx-auto
Extra Narrow:      max-w-2xl mx-auto
```

### **Spacing Scale**
```
Section Padding:   py-24 md:py-32
Card Padding:      p-6 md:p-8
Button Padding:    px-8 py-4
Small Gap:         gap-4
Medium Gap:        gap-8
Large Gap:         gap-12
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 640px    (sm:)
Tablet:     640px+     (md: 768px+)
Desktop:    1024px+    (lg:)
Large:      1280px+    (xl:)
Extra:      1536px+    (2xl:)
```

### **Common Patterns**
```tsx
// Stack on mobile, 2 cols on tablet, 4 on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Full width on mobile, max-width on desktop
<div className="w-full lg:max-w-2xl">
```

---

## 🎨 Visual Effects

### **Glass Morphism**
```tsx
<div className="glass-morphism">
  {/* Semi-transparent with blur */}
</div>
```
**Usage**: Overlays, floating elements, search bars

### **Gold Accent Line**
```tsx
<div className="h-1 w-16 bg-brand-gold mb-8" />
```
**Usage**: Above section titles for luxury feel

### **Gradient Overlay**
```tsx
<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
```
**Usage**: Over images for text readability

---

## 🖼️ Image Guidelines

### **Hero Images**
- **Size**: 1920x1080px minimum
- **Format**: JPG or WebP
- **Aspect**: 16:9
- **Quality**: High (80-90%)

### **Product Images**
- **Size**: 800x1200px (3:4 aspect ratio)
- **Format**: JPG or WebP
- **Background**: White or transparent
- **Alt Images**: Provide 2-3 per product

### **Category Images**
- **Size**: 800x1000px (4:5 aspect ratio)
- **Format**: JPG
- **Treatment**: With gradient overlay

---

## 💫 Special Elements

### **Badge (New/Sale)**
```tsx
<span className="bg-brand-gold text-brand-black text-xs px-3 py-1 font-bold uppercase tracking-wider">
  New
</span>
```

### **Rating Stars**
```tsx
<div className="flex">
  {[...Array(5)].map((_, i) => (
    <Star key={i} className="w-4 h-4 text-brand-gold fill-current" />
  ))}
</div>
```

### **Price Display**
```tsx
import { useTheme } from '../context/ThemeContext';

function PriceDisplay({ price }) {
  const { formatPrice } = useTheme();
  return (
    <span className="text-2xl font-bold text-brand-gold">
      {formatPrice(price)}
    </span>
  );
}
```

---

## 🌙 Dark Mode

### **Color Mapping**
```
Light Mode          →  Dark Mode
-----------------     ------------------
bg-white           →  bg-brand-black
bg-gray-50         →  bg-gray-900
text-gray-900      →  text-white
text-gray-600      →  text-gray-400
border-gray-200    →  border-gray-800
```

### **Usage**
```tsx
<div className="bg-white dark:bg-brand-black text-gray-900 dark:text-white">
  Content adapts to theme
</div>
```

---

## 🔘 Interactive States

### **Hover States**
```css
hover:scale-105        - Slight enlarge
hover:bg-brand-gold-light - Color change
hover:shadow-xl        - Enhanced shadow
hover:translate-y-[-8px] - Lift up
```

### **Active States**
```css
active:scale-95        - Pressed effect
active:brightness-90   - Slight darken
```

### **Focus States**
```css
focus:ring-2           - Outline ring
focus:ring-brand-gold  - Gold ring color
focus:outline-none     - Remove default
```

---

## 📊 Grid Patterns

### **Product Grid**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

### **Feature Grid**
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-12">
  {features.map((feature, i) => (
    <FeatureCard key={i} {...feature} />
  ))}
</div>
```

### **Two Column Layout**
```tsx
<div className="grid md:grid-cols-2 gap-16 items-center">
  <div>Text Content</div>
  <div>Image</div>
</div>
```

---

## 🎯 Icon Usage

### **Sizes**
```tsx
w-4 h-4   - Small (16px)   - Inline with text
w-5 h-5   - Medium (20px)  - Buttons
w-6 h-6   - Large (24px)   - Featured icons
w-8 h-8   - XL (32px)      - Feature cards
w-10 h-10 - XXL (40px)     - Hero icons
```

### **Colors**
```tsx
text-brand-gold       - Primary actions
text-gray-600         - Secondary/disabled
text-white            - On dark backgrounds
text-brand-black      - On gold backgrounds
```

---

## 📐 Aspect Ratios

### **Product Cards**
```tsx
<div className="aspect-[3/4]">  {/* 3:4 portrait */}
  <img className="w-full h-full object-cover" />
</div>
```

### **Category Cards**
```tsx
<div className="aspect-square">  {/* 1:1 square */}
  <img className="w-full h-full object-cover" />
</div>
```

### **Hero Section**
```tsx
<div className="h-screen">  {/* Full viewport height */}
  Content
</div>
```

---

## 🎨 Example Component

### **Premium Section Header**
```tsx
<div className="text-center mb-20">
  {/* Gold accent line */}
  <motion.div
    initial={{ width: 0 }}
    whileInView={{ width: "60px" }}
    viewport={{ once: true }}
    className="h-1 bg-brand-gold mx-auto mb-8"
  />
  
  {/* Title */}
  <h2 className="text-4xl md:text-6xl font-bold font-poppins text-gray-900 dark:text-white mb-6">
    Section Title
  </h2>
  
  {/* Description */}
  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
    Your description text here
  </p>
</div>
```

---

## 🚀 Performance Tips

### **Image Optimization**
```tsx
<img
  src="image.jpg"
  alt="Description"
  loading="lazy"           // Lazy load
  className="w-full h-full object-cover"
/>
```

### **Animation Optimization**
```tsx
<motion.div
  whileHover={{ y: -8 }}
  transition={{ duration: 0.3 }}
  style={{ willChange: 'transform' }}  // GPU acceleration
>
  Content
</motion.div>
```

---

## 📋 Checklist for New Pages

- [ ] Use `luxury-container` for proper spacing
- [ ] Add gold accent line above main headings
- [ ] Use Poppins font for headings
- [ ] Support dark mode with `dark:` classes
- [ ] Add Framer Motion animations
- [ ] Use `formatPrice()` for all prices
- [ ] Make fully responsive (mobile-first)
- [ ] Add hover effects on interactive elements
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify keyboard navigation works
- [ ] Check color contrast for accessibility

---

## 🎓 Learning Pattern

When creating a new page:

1. **Start with structure** (sections, containers)
2. **Add content** (text, images)
3. **Apply styles** (colors, spacing, typography)
4. **Add animations** (motion components)
5. **Test responsive** (resize browser)
6. **Test dark mode** (toggle theme)
7. **Polish details** (hover states, transitions)

---

## 🎯 Brand Consistency

Every page should have:
- ✅ Gold accent elements
- ✅ Poppins headings
- ✅ Smooth animations
- ✅ Premium spacing
- ✅ Dark mode support
- ✅ Mobile responsive
- ✅ Consistent button styles
- ✅ "Made in Sri Lanka" messaging

---

**This is your complete design system reference. Use it as a guide when updating remaining pages!**

*Design System Version: 1.0*
*Last Updated: November 6, 2025*
