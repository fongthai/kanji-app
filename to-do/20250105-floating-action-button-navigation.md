# Floating Action Button (FAB) Navigation System

**Date**: January 5, 2026  
**Status**: Proposal / Research Phase  
**Purpose**: Zero-space-cost navigation alternative to traditional top bar

---

## 📋 Executive Summary

**Problem**: Adding traditional navigation (top bar or sidebar) sacrifices valuable vertical or horizontal space needed for A4 paper display and multi-panel layout.

**Solution**: Floating Action Button (FAB) with radial/contextual menu that appears on-demand, consuming zero permanent screen space.

**Benefits**:
- ✅ No vertical space loss (critical for A4 paper height)
- ✅ No horizontal space loss (preserves 3-panel layout)
- ✅ Modern, mobile-friendly UX pattern
- ✅ Accessible from anywhere in app
- ✅ Scalable (easy to add new modes/features)

---

## 🎯 What is FAB Navigation?

### Definition
A **Floating Action Button** is a circular button that "floats" above the UI, typically in the bottom-right or top-right corner. When clicked, it reveals a menu of actions.

### Visual Concept for Kanji App

**Closed State (Default):**
```
┌─────────────────────────────────────────────────────┐
│ [InputPanel] [MainView]           [ControlPanel]    │
│                                                      │
│                                                 [≡] │ ← FAB
│                                                  56px
└─────────────────────────────────────────────────────┘
```

**Opened State (Radial Menu):**
```
                                        [📚 Vocab]
                                   [📋 Board]  ⭕  [🎯 Quiz]
                                        [📄 Sheet]
                                        [ℹ️ About]
```

**Alternative: Linear Menu:**
```
                                    ┌─────────────┐
                                    │ 📄 Sheet    │
                                    │ 📋 Board    │
                                    │ 📚 Vocab    │
                                    │ 🎯 Quiz     │
                                    │ ℹ️ About    │
                                    │ 👤 Login    │
                                    └─────────────┘
                                          ▼
                                         [≡]
```

---

## 🏗️ Design Specifications

### FAB Button Design

**Dimensions:**
- Desktop: 56×56px (Material Design standard)
- Mobile: 56×56px (same - ensures touch-friendly)
- Tablet: 64×64px (slightly larger for easier touch)

**Position Options:**

**Option 1: Bottom-Right (Recommended)**
```
- Desktop: 24px from right, 24px from bottom
- Mobile: 16px from right, 16px from bottom (above any mobile nav)
- Advantage: Standard position, thumb-friendly on mobile
- Disadvantage: Might overlap content in rare cases
```

**Option 2: Top-Right**
```
- Desktop: 24px from right, 80px from top (below browser chrome)
- Mobile: 16px from right, 16px from top
- Advantage: Near user's eye focus (top of screen)
- Disadvantage: Less thumb-friendly on mobile
```

**Option 3: Dynamic Position**
```
- Auto-positions based on available space
- Avoids overlapping important content (A4 paper, buttons)
- More complex but better UX
```

**Visual Design:**
```css
/* Base FAB Styles */
.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.fab:active {
  transform: scale(0.95);
}
```

**Icon Options:**
- Hamburger (≡) - Traditional, recognizable
- Plus (+) - Action-oriented
- Compass (⊕) - Navigation metaphor
- Grid (⊞) - Menu metaphor
- Custom app icon - Brand-specific

**Current Mode Indicator:**
- Mini badge on FAB showing current mode
- Color coding (Sheet = blue, Board = purple, etc.)
- Subtle animation on mode change

---

## 🎨 Menu Styles

### Style 1: Radial Menu (Recommended for <= 6 items)

**Layout:**
```
         [Item 3]
   [Item 2]  ⭕  [Item 4]
         [Item 1]
         [Item 5]
```

**Specifications:**
- Radius: 80-120px from FAB center
- Items: Equally spaced around circle
- Max items: 6-8 (more = crowded)
- Animation: Expand from center with stagger

**Advantages:**
- ✅ Compact (items appear in circular pattern)
- ✅ Visually distinctive (modern, innovative)
- ✅ Fast selection (items equidistant from FAB)
- ✅ Works well with touch (large tap targets)

**Disadvantages:**
- ❌ Limited items (max ~8 before cramped)
- ❌ Unusual pattern (might confuse first-time users)
- ❌ Requires space around FAB

**Implementation Notes:**
```typescript
// Calculate positions for N items around circle
const angleStep = (2 * Math.PI) / itemCount;
const radius = 100; // px from center

items.forEach((item, index) => {
  const angle = angleStep * index - Math.PI / 2; // Start from top
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  // Position item at (x, y) relative to FAB
});
```

---

### Style 2: Linear Menu (Recommended for 7+ items)

**Layout:**
```
┌──────────────────┐
│ 📄 Sheet mode    │ ← Current mode (checkmark)
│ 📋 Board mode    │
│ ────────────     │
│ 📚 Vocabulary    │
│ 🎯 Quiz          │
│ ────────────     │
│ ℹ️ About         │
│ 👤 Login         │
└──────────────────┘
       ▼
      [≡]
```

**Specifications:**
- Width: 200-240px
- Item height: 48px (touch-friendly)
- Max height: Viewport - 100px (scrollable if needed)
- Position: Above or beside FAB (auto-adjust based on space)
- Dividers: Group related items
- Icons: Left-aligned, 24×24px
- Text: Left-aligned, 14-16px

**Advantages:**
- ✅ Scalable (can show many items with scroll)
- ✅ Familiar pattern (standard dropdown menu)
- ✅ Easy to scan (vertical list)
- ✅ Supports dividers, headers, submenus

**Disadvantages:**
- ❌ Takes more vertical space
- ❌ Less visually interesting than radial
- ❌ Might extend off-screen on small devices

**Implementation Notes:**
```typescript
// Auto-position menu to avoid screen edges
const fabRect = fabElement.getBoundingClientRect();
const menuHeight = itemCount * 48 + padding;
const menuWidth = 220;

// Check if menu fits above FAB
const fitsAbove = fabRect.top > menuHeight;
// Check if menu fits to left
const fitsLeft = fabRect.left > menuWidth;

// Position accordingly
const position = {
  bottom: fitsAbove ? undefined : fabRect.bottom + 8,
  top: fitsAbove ? fabRect.top - menuHeight - 8 : undefined,
  right: fitsLeft ? window.innerWidth - fabRect.left + 8 : 24,
};
```

---

### Style 3: Speed Dial (Material Design Pattern)

**Layout:**
```
      [📚] ← Mini FABs
      [🎯]
      [📋]
      [📄]
       ↑
      [≡] ← Main FAB
```

**Specifications:**
- Mini FABs: 40×40px each
- Spacing: 16px between buttons
- Animation: Slide up from main FAB with stagger
- Labels: Show on hover (tooltip)
- Max items: 5-6 (vertical stack)

**Advantages:**
- ✅ Compact (items stack vertically)
- ✅ Material Design standard (familiar to Android users)
- ✅ Clear visual hierarchy (main action + secondary actions)
- ✅ Fast access (items always in same position)

**Disadvantages:**
- ❌ Limited space (can't show many items)
- ❌ Labels hidden until hover (less discoverable)
- ❌ Vertical stack might extend off-screen

---

## 🎯 User Experience Flow

### First-Time User (Onboarding)

**Challenge**: FAB is not immediately discoverable like a top bar.

**Solution: Pulse Animation on First Load**
```typescript
// Show pulse animation for 3 seconds on first visit
useEffect(() => {
  const hasSeenFAB = localStorage.getItem('kanji-fab-seen');
  if (!hasSeenFAB) {
    setShowPulse(true);
    setTimeout(() => {
      setShowPulse(false);
      localStorage.setItem('kanji-fab-seen', 'true');
    }, 3000);
  }
}, []);
```

**Visual:**
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.fab.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

**Alternative: Tooltip on First Load**
```
                         ┌──────────────────┐
                         │ Click here for   │
                         │ navigation menu  │
                         └────────▼──────────┘
                              [≡]
```

---

### Power User (Fast Navigation)

**Keyboard Shortcut:**
- `Cmd/Ctrl + K` → Opens FAB menu
- Arrow keys → Navigate items
- Enter → Select
- Esc → Close

**Quick Mode Switching:**
- `Cmd + 1` → Sheet mode
- `Cmd + 2` → Board mode
- `Cmd + 3` → Vocab mode
- `Cmd + 4` → Quiz mode

**Recent Modes:**
- FAB menu shows 2 most recent modes at top
- Quick switch without opening full menu

---

### Mobile Touch Gestures

**Gestures:**
- Tap FAB → Open menu
- Tap outside → Close menu
- Tap item → Navigate + close menu
- Long-press FAB → Show quick actions (Export, Settings)
- Swipe up on FAB → Expand to full menu
- Swipe down → Close menu

**Touch Considerations:**
- Minimum touch target: 48×48px (not 44×44px iOS standard)
- FAB should not overlap critical touch areas
- Avoid placing FAB where thumb rests naturally (prevents accidental opens)

---

## 📱 Responsive Behavior

### Desktop (>= 1024px)

**FAB Position**: Bottom-right or top-right  
**Menu Style**: Radial (if <= 6 items) or Linear  
**Hover Behavior**: Show labels on hover  
**Click Behavior**: Open menu  
**Keyboard**: Full keyboard navigation support

```typescript
const DesktopFAB = () => (
  <div 
    className="fixed bottom-6 right-6 z-50"
    onMouseEnter={() => setShowLabels(true)}
    onMouseLeave={() => setShowLabels(false)}
  >
    <RadialMenu items={navigationItems} />
  </div>
);
```

---

### Tablet (768px - 1023px)

**FAB Position**: Bottom-right (thumb-friendly)  
**Menu Style**: Linear (easier to tap)  
**Size**: Slightly larger (64×64px)  
**Touch Optimization**: Larger tap targets (56×56px min)

**Landscape Mode:**
- FAB in bottom-right (same as desktop)
- Menu opens upward

**Portrait Mode:**
- FAB in bottom-right
- Menu opens upward or to left (depends on space)

```typescript
const TabletFAB = () => {
  const isLandscape = window.innerWidth > window.innerHeight;
  
  return (
    <div className={`fixed ${
      isLandscape ? 'bottom-4 right-4' : 'bottom-6 right-6'
    } z-50`}>
      <LinearMenu 
        items={navigationItems} 
        position={isLandscape ? 'top-right' : 'top-center'}
      />
    </div>
  );
};
```

---

### Mobile (< 768px)

**FAB Position**: Bottom-right, above any bottom navigation  
**Menu Style**: Full-screen overlay or bottom sheet  
**Behavior**: Tap to open, tap outside or swipe down to close

**Option A: Bottom Sheet (Recommended)**
```
┌─────────────────────┐
│ Content             │
│                     │ ← Backdrop (semi-transparent)
│                     │
├─────────────────────┤
│ 📄 Sheet mode      │ ← Sheet slides up
│ 📋 Board mode      │
│ 📚 Vocabulary      │
│ 🎯 Quiz            │
│ ℹ️ About           │
│ 👤 Login           │
└─────────────────────┘
```

**Option B: Full-Screen Overlay**
```
┌─────────────────────┐
│      [×]            │ ← Close button
│                     │
│   📄 Sheet mode     │ ← Large touch targets
│                     │
│   📋 Board mode     │
│                     │
│   📚 Vocabulary     │
│                     │
│   🎯 Quiz           │
│                     │
│   ℹ️ About          │
│                     │
│   👤 Login          │
└─────────────────────┘
```

**Implementation:**
```typescript
const MobileFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* FAB Button */}
      <button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full z-50"
        onClick={() => setIsOpen(true)}
      >
        ≡
      </button>
      
      {/* Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-4">
            {navigationItems.map(item => (
              <button
                key={item.id}
                className="w-full h-14 flex items-center gap-3 px-4"
                onClick={() => {
                  handleNavigate(item.path);
                  setIsOpen(false);
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-lg">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
```

---

## ⚙️ Technical Implementation

### Technology Stack

**React Component:**
```typescript
// FABNavigation.tsx
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  shortcut?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'sheet', label: 'Sheet Mode', icon: '📄', path: '/sheet', shortcut: 'Cmd+1' },
  { id: 'board', label: 'Board Mode', icon: '📋', path: '/board', shortcut: 'Cmd+2' },
  { id: 'vocab', label: 'Vocabulary', icon: '📚', path: '/vocab', shortcut: 'Cmd+3' },
  { id: 'quiz', label: 'Quiz', icon: '🎯', path: '/quiz', shortcut: 'Cmd+4' },
  { id: 'about', label: 'About', icon: 'ℹ️', path: '/about' },
];

export const FABNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const fabRef = useRef<HTMLDivElement>(null);
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Quick mode shortcuts
      if ((e.metaKey || e.ctrlKey) && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        navigate(navigationItems[index].path);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);
  
  const currentItem = navigationItems.find(item => 
    location.pathname.includes(item.path)
  );
  
  return (
    <div ref={fabRef} className="fixed bottom-6 right-6 z-50">
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 
                   shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300
                   flex items-center justify-center text-white text-2xl"
        aria-label="Navigation menu"
      >
        {isOpen ? '×' : '≡'}
      </button>
      
      {/* Current mode indicator badge */}
      {currentItem && !isOpen && (
        <div className="absolute -top-2 -left-2 bg-white rounded-full px-2 py-1 
                        text-xs font-semibold shadow-md">
          {currentItem.icon}
        </div>
      )}
      
      {/* Menu (implement radial or linear based on preference) */}
      {isOpen && <RadialMenu items={navigationItems} onSelect={(path) => {
        navigate(path);
        setIsOpen(false);
      }} />}
    </div>
  );
};
```

---

### Animation Library Options

**Option 1: Framer Motion (Recommended)**
```bash
npm install framer-motion
```

```typescript
import { motion, AnimatePresence } from 'framer-motion';

const RadialMenu = ({ items, onSelect }) => {
  return (
    <AnimatePresence>
      {items.map((item, index) => {
        const angle = (2 * Math.PI / items.length) * index - Math.PI / 2;
        const radius = 100;
        
        return (
          <motion.button
            key={item.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: radius * Math.cos(angle),
              y: radius * Math.sin(angle),
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: index * 0.05,
            }}
            onClick={() => onSelect(item.path)}
            className="absolute w-12 h-12 rounded-full bg-white shadow-lg"
          >
            <span className="text-2xl">{item.icon}</span>
          </motion.button>
        );
      })}
    </AnimatePresence>
  );
};
```

**Option 2: React Spring**
```bash
npm install @react-spring/web
```

**Option 3: CSS Transitions (Lightweight)**
```css
.menu-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(0);
  opacity: 0;
}

.menu-item.open {
  transform: scale(1);
  opacity: 1;
}

.menu-item:nth-child(1) { transition-delay: 0.05s; }
.menu-item:nth-child(2) { transition-delay: 0.10s; }
.menu-item:nth-child(3) { transition-delay: 0.15s; }
/* ... */
```

---

## ♿ Accessibility Considerations

### Keyboard Navigation

**Requirements:**
- Tab to focus FAB
- Enter/Space to open menu
- Arrow keys to navigate menu items
- Enter to select item
- Esc to close menu
- Shift+Tab to navigate backwards

**Implementation:**
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  switch(e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      setIsOpen(!isOpen);
      break;
    case 'Escape':
      setIsOpen(false);
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      // Navigate menu items
      break;
  }
};
```

### Screen Readers

**ARIA Attributes:**
```typescript
<button
  aria-label="Navigation menu"
  aria-expanded={isOpen}
  aria-haspopup="true"
  aria-controls="fab-menu"
>
  ≡
</button>

<div
  id="fab-menu"
  role="menu"
  aria-orientation="vertical"
  hidden={!isOpen}
>
  {items.map(item => (
    <button
      key={item.id}
      role="menuitem"
      aria-label={item.label}
    >
      {item.icon} {item.label}
    </button>
  ))}
</div>
```

### Focus Management

**Requirements:**
- Focus first menu item when opening
- Trap focus within menu when open
- Return focus to FAB when closing

```typescript
useEffect(() => {
  if (isOpen && menuRef.current) {
    const firstItem = menuRef.current.querySelector('[role="menuitem"]');
    (firstItem as HTMLElement)?.focus();
  }
}, [isOpen]);
```

### Color Contrast

**WCAG AA Standards:**
- FAB background vs icon: 4.5:1 minimum
- Menu items vs background: 4.5:1 minimum
- Hover/focus states: Clear visual indicator

**High Contrast Mode:**
```css
@media (prefers-contrast: high) {
  .fab {
    border: 2px solid currentColor;
  }
  
  .menu-item {
    border: 1px solid currentColor;
  }
}
```

---

## 🎨 Design Variations for Kanji App

### Variation 1: Mode-Specific FAB Colors

**Visual Feedback:**
- Sheet mode: Blue FAB (`#3b82f6`)
- Board mode: Purple FAB (`#8b5cf6`)
- Vocab mode: Green FAB (`#10b981`)
- Quiz mode: Orange FAB (`#f59e0b`)

**Implementation:**
```typescript
const getModeColor = (mode: string) => {
  const colors = {
    sheet: 'from-blue-500 to-blue-600',
    board: 'from-purple-500 to-purple-600',
    vocab: 'from-green-500 to-green-600',
    quiz: 'from-orange-500 to-orange-600',
  };
  return colors[mode] || colors.sheet;
};
```

---

### Variation 2: Contextual Quick Actions

**Based on Current Mode:**
```typescript
// In Sheet mode, FAB shows Sheet-specific actions on long-press:
- 📤 Export PDF
- ⚙️ Sheet Settings
- 📋 Switch to Board

// In Board mode:
- 📤 Export PDF
- ⚙️ Board Settings
- 📄 Switch to Sheet
```

**Implementation:**
```typescript
const getQuickActions = (currentMode: string) => {
  const actions = {
    sheet: [
      { icon: '📤', label: 'Export PDF', action: exportSheetPDF },
      { icon: '⚙️', label: 'Settings', action: openSheetSettings },
      { icon: '📋', label: 'Board Mode', action: () => navigate('/board') },
    ],
    // ... other modes
  };
  return actions[currentMode] || [];
};
```

---

### Variation 3: Mini FAB Cluster

**Concept**: Multiple FABs for different purposes
```
                    [⚙️] ← Settings FAB (smaller)
                    [📤] ← Export FAB (smaller)
                     ▲
                    [≡] ← Main Navigation FAB
```

**When to use:**
- If you have frequent actions (Export, Settings) separate from navigation
- Prevents menu overload

**Disadvantage:**
- More screen clutter
- Multiple floating elements might be distracting

---

## 📊 Comparison with Other Navigation Patterns

| Feature | FAB | Top Bar | Sidebar | Tabs |
|---------|-----|---------|---------|------|
| **Vertical Space Cost** | 0px | 60-90px | 0px | 40-60px |
| **Horizontal Space Cost** | 0px | 0px | 240-280px | 0px |
| **Discoverability** | ⚠️ Low (needs onboarding) | ✅ High | ✅ High | ✅ High |
| **Scalability** | ✅ Good (menu can scroll) | ⚠️ Limited (width constraint) | ✅ Excellent | ❌ Poor (too many tabs) |
| **Mobile-Friendly** | ✅ Excellent | ✅ Good | ⚠️ Becomes hamburger | ⚠️ Hard to scale |
| **Modern/Innovative** | ✅ Very modern | ⚠️ Traditional | ✅ Modern | ⚠️ Traditional |
| **Implementation Complexity** | ⚠️ Medium (animations) | ✅ Simple | ⚠️ Medium (collapse logic) | ✅ Simple |
| **Keyboard Accessibility** | ✅ Can add shortcuts | ✅ Natural Tab order | ✅ Natural Tab order | ✅ Arrow keys |
| **Best For** | Space-constrained apps | Multi-section apps | Content-heavy apps | Few sections (2-4) |

---

## 🚀 Implementation Roadmap

### Phase 1: Basic FAB (1-2 days)
- [ ] Create FAB component with open/close toggle
- [ ] Linear menu with navigation items
- [ ] Position in bottom-right corner
- [ ] Basic click-outside-to-close behavior
- [ ] Integrate with React Router navigation

### Phase 2: Animations (1 day)
- [ ] Add Framer Motion
- [ ] Implement staggered menu item entrance
- [ ] FAB hover/active states
- [ ] Smooth open/close transitions

### Phase 3: Radial Menu (2-3 days)
- [ ] Calculate radial positions for menu items
- [ ] Implement radial layout
- [ ] Add rotation animation
- [ ] Handle collision with screen edges

### Phase 4: Keyboard Support (1 day)
- [ ] Cmd+K to toggle menu
- [ ] Arrow key navigation
- [ ] Cmd+Number shortcuts
- [ ] Esc to close
- [ ] Focus management

### Phase 5: Mobile Optimization (1-2 days)
- [ ] Bottom sheet for mobile
- [ ] Touch gestures (swipe to close)
- [ ] Larger touch targets
- [ ] Prevent body scroll when menu open

### Phase 6: Accessibility (1 day)
- [ ] ARIA attributes
- [ ] Screen reader testing
- [ ] Keyboard-only navigation testing
- [ ] High contrast mode support

### Phase 7: Polish (1 day)
- [ ] Current mode indicator badge
- [ ] Onboarding pulse animation
- [ ] Mode-specific colors
- [ ] Sound effects (optional)

**Total Estimated Time: 8-12 days**

---

## 🎯 Success Metrics

### User Behavior Metrics

**Track after implementation:**
1. **FAB Discovery Rate**: % of users who click FAB within first 5 minutes
2. **Navigation Method**: FAB vs keyboard shortcuts vs direct URL
3. **Time to Navigation**: Seconds from intent to action
4. **Menu Open Rate**: How often users open menu vs use shortcuts
5. **Abandonment**: Users who can't find navigation (bounce rate)

**Target Goals:**
- 80%+ discovery rate in first session
- <3 seconds to navigate to desired mode
- 30%+ keyboard shortcut adoption (power users)

### UX Testing Questions

**Ask 5-10 users during beta:**
1. "How would you switch from Sheet to Board mode?"
2. "On a scale 1-10, how easy was it to find the navigation menu?"
3. "Did you notice the FAB immediately? If not, how long did it take?"
4. "Would you prefer a traditional top menu bar instead? Why?"
5. "Did the FAB get in the way of your work?"

---

## ⚠️ Risks & Mitigation

### Risk 1: Low Discoverability

**Problem**: Users don't notice or understand FAB.

**Mitigation:**
- Pulse animation on first load (3 seconds)
- Tooltip: "Click for navigation"
- Keyboard shortcut hint in footer: "Press Cmd+K for menu"
- Optional: Show traditional top bar for first 3 sessions, then switch to FAB

### Risk 2: Accidental Opens

**Problem**: Users accidentally click FAB when trying to interact with nearby content.

**Mitigation:**
- Position FAB away from interactive elements (24px margin)
- Implement small delay before menu appears (100ms)
- Make FAB slightly transparent when inactive (opacity: 0.9)
- Provide "Collapse FAB" option in settings

### Risk 3: Menu Items Overflow Screen

**Problem**: On small screens, radial menu extends beyond viewport.

**Mitigation:**
- Auto-detect screen size and switch to linear menu
- Dynamically adjust radius based on available space
- Implement scrollable linear menu as fallback

### Risk 4: Keyboard Users Frustrated

**Problem**: FAB requires mouse/touch, not keyboard-first.

**Mitigation:**
- Implement comprehensive keyboard shortcuts (Cmd+1, 2, 3...)
- Make FAB tabbable and Enter-activatable
- Provide visible keyboard shortcut hints
- Add command palette (Cmd+K) as alternative

### Risk 5: Mobile Thumb Zone Conflict

**Problem**: FAB positioned where users naturally hold phone.

**Mitigation:**
- Research optimal position for right-handed vs left-handed users
- Provide option to switch FAB to left side
- Use bottom sheet that doesn't require reaching FAB location
- Test with real users holding device

---

## 📚 References & Inspiration

### Material Design Guidelines
- [Floating Action Button](https://material.io/components/buttons-floating-action-button)
- [Speed Dial](https://material.io/components/buttons-floating-action-button#types-of-transitions)
- Official Google implementation examples

### Real-World Examples

**Apps Using FAB Well:**
1. **Google Keep** - Note-taking app with new note FAB
2. **Telegram** - New message FAB with quick actions
3. **Todoist** - Task creation FAB with project selection
4. **Notion Mobile** - New page FAB with template selection

**Apps Using FAB Poorly:**
1. **Some banking apps** - FAB covers important content
2. **Overcrowded FABs** - Too many actions, confusing UX

### Code Examples & Libraries

**React Libraries:**
- [react-floating-action-button](https://www.npmjs.com/package/react-floating-action-button)
- [react-fab](https://www.npmjs.com/package/react-fab)
- [material-ui FAB](https://mui.com/material-ui/react-floating-action-button/)

**Animation Examples:**
- [CodePen: Radial FAB Menu](https://codepen.io/search/pens?q=radial+fab)
- [CSS Tricks: Speed Dial](https://css-tricks.com/examples/SpeedDialMenu/)

---

## 🔮 Future Enhancements

### AI-Powered Menu

**Concept**: FAB learns user behavior and prioritizes frequently used modes.

**Implementation:**
```typescript
// Track navigation frequency
const trackNavigation = (path: string) => {
  const history = JSON.parse(localStorage.getItem('nav-history') || '{}');
  history[path] = (history[path] || 0) + 1;
  localStorage.setItem('nav-history', JSON.stringify(history));
};

// Sort menu items by frequency
const sortedItems = navigationItems.sort((a, b) => {
  const aCount = navHistory[a.path] || 0;
  const bCount = navHistory[b.path] || 0;
  return bCount - aCount;
});
```

### Context-Aware Actions

**Concept**: FAB menu changes based on what user is doing.

**Examples:**
- User has 0 kanjis selected → Show "Browse Kanjis" in menu
- User has 50 kanjis selected → Show "Export PDF" prominently
- User has unsaved changes → Show "Save" in menu
- User is in Board mode → Show Board-specific actions

### Voice Commands

**Concept**: "Hey Kanji, switch to Board mode"

**Implementation** (future):
```typescript
// Web Speech API
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  if (command.includes('board mode')) {
    navigate('/board');
  }
};
```

### Gesture Navigation

**Concept**: Draw shapes to navigate (e.g., draw 'S' for Sheet mode)

**Libraries:**
- [hammer.js](https://hammerjs.github.io/) - Touch gestures
- [interact.js](https://interactjs.io/) - Drag and gesture library

---

## ✅ Decision Checklist

Before implementing FAB navigation, confirm:

- [ ] **Space is critical**: Vertical or horizontal space is at premium
- [ ] **Users are tech-savvy**: Can discover non-traditional navigation
- [ ] **Mobile support important**: FAB works better than top bar on mobile
- [ ] **Willing to add onboarding**: New users need guidance
- [ ] **Navigation is secondary**: Primary task is working with content, not switching modes
- [ ] **Scalability needed**: Expecting to add 5+ more sections/modes
- [ ] **Modern brand**: App aims for modern, innovative UX

If you answered YES to 5+ items, FAB is a good fit.  
If NO to most items, consider traditional top bar instead.

---

## 📞 Next Steps

1. **Review this document** and note questions/concerns
2. **Test existing FAB apps** (Google Keep, Telegram) on your target devices
3. **Decide on menu style**: Radial vs Linear vs Bottom Sheet
4. **Create mockups/wireframes** for your specific navigation items
5. **Prototype** simple FAB in CodePen/CodeSandbox
6. **User test** prototype with 3-5 people
7. **Decide**: Implement FAB or go with alternative (top bar, sidebar)

---

## 📝 Open Questions for Discussion

When you return to this topic, let's discuss:

1. Which menu style do you prefer? (Radial, Linear, Speed Dial, Bottom Sheet)
2. What position for FAB? (Bottom-right, top-right, dynamic)
3. Should FAB show current mode indicator badge?
4. Do you want contextual quick actions (long-press)?
5. What keyboard shortcuts make sense for your users?
6. Should FAB be themeable (match current mode color)?
7. Do you want to A/B test FAB vs top bar with real users?
8. Any specific animation style you prefer?
9. Should FAB be collapsible (hide when scrolling)?
10. What's your implementation timeline?

---

**Document Version**: 1.0  
**Last Updated**: January 5, 2026  
**Author**: AI Assistant  
**Status**: Proposal - Awaiting User Review

---

## Appendix A: Code Snippets

### Complete FAB Component Example

```typescript
// components/FABNavigation.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  shortcut?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'sheet', label: 'Sheet Mode', icon: '📄', path: '/sheet', shortcut: '⌘1' },
  { id: 'board', label: 'Board Mode', icon: '📋', path: '/board', shortcut: '⌘2' },
  { id: 'vocab', label: 'Vocabulary', icon: '📚', path: '/vocab', shortcut: '⌘3' },
  { id: 'quiz', label: 'Quiz', icon: '🎯', path: '/quiz', shortcut: '⌘4' },
  { id: 'about', label: 'About', icon: 'ℹ️', path: '/about' },
];

export const FABNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // First-time pulse animation
  useEffect(() => {
    const hasSeenFAB = localStorage.getItem('kanji-fab-seen');
    if (!hasSeenFAB) {
      setShowPulse(true);
      setTimeout(() => {
        setShowPulse(false);
        localStorage.setItem('kanji-fab-seen', 'true');
      }, 3000);
    }
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle menu
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }

      // Cmd/Ctrl + Number for quick navigation
      if ((e.metaKey || e.ctrlKey) && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        navigate(NAV_ITEMS[index].path);
      }

      // Esc to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate, isOpen]);

  const currentItem = NAV_ITEMS.find(item =>
    location.pathname.includes(item.path)
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div ref={fabRef} className="fixed bottom-6 right-6 z-50">
      {/* Main FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600
          shadow-lg flex items-center justify-center text-white text-2xl
          hover:shadow-xl transition-shadow duration-300
          ${showPulse ? 'animate-pulse' : ''}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Navigation menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isOpen ? '×' : '≡'}
      </motion.button>

      {/* Current mode badge */}
      {currentItem && !isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -left-2 bg-white rounded-full px-2 py-1
                     text-xs font-semibold shadow-md"
        >
          {currentItem.icon}
        </motion.div>
      )}

      {/* Radial Menu */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-0 right-0">
            {NAV_ITEMS.map((item, index) => {
              const angle = (2 * Math.PI / NAV_ITEMS.length) * index - Math.PI / 2;
              const radius = 100;
              const x = radius * Math.cos(angle);
              const y = radius * Math.sin(angle);

              return (
                <motion.button
                  key={item.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x,
                    y,
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.05,
                  }}
                  onClick={() => handleNavigate(item.path)}
                  className="absolute w-12 h-12 rounded-full bg-white shadow-lg
                             flex items-center justify-center text-2xl
                             hover:bg-gray-50 active:bg-gray-100
                             transition-colors duration-200"
                  style={{
                    left: '28px', // Center relative to FAB
                    top: '28px',
                  }}
                  title={`${item.label} ${item.shortcut || ''}`}
                >
                  {item.icon}
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcut hint */}
      {!isOpen && (
        <div className="absolute -top-8 right-0 text-xs text-gray-500 whitespace-nowrap">
          Press ⌘K
        </div>
      )}
    </div>
  );
};
```

---

## Appendix B: CSS Animations

### Pulse Animation

```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
}

.fab-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

### Ripple Effect

```css
.fab-ripple {
  position: relative;
  overflow: hidden;
}

.fab-ripple::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.fab-ripple:active::after {
  width: 200px;
  height: 200px;
}
```

---

**End of Document**
