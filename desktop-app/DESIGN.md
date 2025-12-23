# LotoLink Desktop App - Design Specifications

## 🎨 Glass Morphism Design System

### Visual Philosophy
The LotoLink desktop application embraces the modern glass morphism design trend, creating a sophisticated, professional appearance that feels both futuristic and familiar. The design seamlessly blends with the user's desktop environment while maintaining a distinct, premium identity.

---

## 1. Glass Effect Implementation

### Primary Glass Effect
```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(40px) saturate(180%);
-webkit-backdrop-filter: blur(40px) saturate(180%);
```

**Properties:**
- **Opacity**: 85% (allows desktop background to show through)
- **Blur**: 40px (creates the frosted glass effect)
- **Saturation**: 180% (enhances colors seen through the glass)

### Secondary Glass Effect (Cards)
```css
background: rgba(255, 255, 255, 0.6);
backdrop-filter: blur(25px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.25);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06),
            inset 0 1px 1px rgba(255, 255, 255, 0.8);
```

**Features:**
- Lower opacity for layered depth
- Moderate blur for readability
- Subtle border highlights
- Inset shadow for realism

---

## 2. Rounded Borders System

### Platform-Specific Radii

#### macOS (Darwin)
```css
border-radius: 12px;
```
- **Inspiration**: macOS Big Sur and later
- **Rationale**: Matches system window corners
- **Feel**: Soft, organic, premium

#### Windows 11
```css
border-radius: 10px;
```
- **Inspiration**: Windows 11 Fluent Design
- **Rationale**: Modern Windows aesthetic
- **Feel**: Clean, contemporary, professional

#### Linux
```css
border-radius: 8px;
```
- **Inspiration**: GNOME and KDE defaults
- **Rationale**: Subtle but present
- **Feel**: Minimalist, functional

### Border Behavior

#### Windowed Mode
- Rounded corners active
- 8px margin from screen edges
- Shadow visible around window
- Smooth transitions (0.3s cubic-bezier)

#### Fullscreen Mode
- Border radius: 0
- No margins
- No shadows
- Perfect edge-to-edge coverage

#### Maximized Mode
- Border radius: 0
- No margins
- Fills work area completely
- Instant transition

---

## 3. Shadow System

### Window Shadows

#### macOS Style
```css
box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12),
            0 0 0 0.5px rgba(0, 0, 0, 0.03);
```
- Large, soft shadow for depth
- Subtle border for definition

#### Windows Style
```css
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(0, 0, 0, 0.08);
```
- Moderate shadow
- Defined border for clarity

#### Linux Style
```css
box-shadow: 0 15px 50px rgba(0, 0, 0, 0.18),
            0 0 0 1px rgba(0, 0, 0, 0.06);
```
- Balanced shadow depth
- Clean border

### Card Shadows
```css
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04),
            inset 0 1px 1px rgba(255, 255, 255, 0.9);
```
- Subtle drop shadow for elevation
- Inset highlight for glass effect

---

## 4. Window Controls

### macOS Traffic Lights

#### Colors
- **Close**: `#ff5f57` (red)
- **Minimize**: `#ffbd2e` (yellow)
- **Maximize**: `#28ca42` (green)

#### Behavior
- Size: 12px diameter
- Spacing: 8px between buttons
- Position: Left side of title bar
- Hover: Shows symbols (✕, −, +)

### Windows Controls

#### Style
- Width: 46px per button
- Height: 32px
- No border radius
- Symbols: ─ (minimize), ☐ (maximize), ✕ (close)

#### Colors
- Default: Transparent
- Hover: `rgba(0, 0, 0, 0.05)`
- Close hover: `#e81123` (Windows red)

### Linux Controls

#### Style
- Size: 28px × 28px
- Border radius: 4px
- Border: 1px solid `rgba(0, 0, 0, 0.1)`
- Symbols: _ (minimize), □ (maximize), × (close)

#### Colors
- Background: `rgba(0, 0, 0, 0.05)`
- Hover: `rgba(0, 0, 0, 0.1)`

---

## 5. Dark Mode

### Background Colors
```css
/* Light mode */
background: rgba(255, 255, 255, 0.85);

/* Dark mode */
background: rgba(28, 28, 30, 0.9);
```

### Glass Effects (Dark)
```css
backdrop-filter: blur(40px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.06);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Text Colors
- **Light mode**: `#1d1d1f` (near black)
- **Dark mode**: `#f5f5f7` (near white)
- **Secondary light**: `#6e6e73` (gray)
- **Secondary dark**: `#a1a1a6` (light gray)

---

## 6. Transitions and Animations

### Window State Changes
```css
transition: margin 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Hover Effects
```css
transition: all 0.2s ease;
```

### Click/Active States
```css
transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
transform: scale(0.95);
```

---

## 7. Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 
             'SF Pro Display', 'SF Pro Text', 
             'Helvetica Neue', Arial, sans-serif;
```

### Font Smoothing
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
letter-spacing: -0.01em;
```

### Title Bar Text
- Font size: 13px
- Font weight: 600
- Letter spacing: -0.02em

---

## 8. Scrollbars

### Custom Scrollbar Design
```css
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: content-box;
}
```

### Dark Mode Scrollbar
```css
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}
```

---

## 9. Sidebar

### Dimensions
- Width: 250px (expanded)
- Width: 70px (collapsed)
- Transition: 0.3s cubic-bezier

### Glass Effect
```css
background: rgba(255, 255, 255, 0.75);
backdrop-filter: blur(30px) saturate(180%);
border-right: 1px solid rgba(0, 0, 0, 0.06);
```

### Navigation Items
- Padding: 12px 16px
- Border radius: 10px
- Gap: 12px between icon and text
- Hover: `rgba(0, 113, 227, 0.08)`
- Active: `rgba(0, 113, 227, 0.12)`

---

## 10. Status Bar

### Design
- Height: 28px
- Font size: 11px
- Position: Bottom of window

### Glass Effect
```css
background: rgba(245, 245, 247, 0.85);
backdrop-filter: blur(20px) saturate(180%);
border-top: 1px solid rgba(0, 0, 0, 0.06);
```

### Status Indicator
- Dot size: 6px
- Online color: `#34c759` (green)
- Offline color: `#86868b` (gray)
- Animation: Pulse (2s ease-in-out)

---

## 11. Performance Considerations

### GPU Acceleration
All backdrop-filter and transform properties trigger GPU acceleration for smooth performance.

### Layer Management
- Title bar: z-index: 100
- Sidebar: z-index: 50
- Main content: z-index: auto

### Repaints
Transitions use `transform` and `opacity` to avoid expensive repaints.

---

## 12. Accessibility

### Contrast Ratios
- Light mode text: 16:1 (AAA)
- Dark mode text: 15:1 (AAA)
- Interactive elements: Minimum 3:1

### Focus Indicators
```css
:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Keyboard Navigation
Full keyboard support for all controls and navigation.

---

## 13. Cross-Platform Consistency

While each platform has unique characteristics, core elements remain consistent:

### Always Consistent
- Color scheme
- Typography
- Glass blur intensity
- Animation timing
- Content layout

### Platform-Specific
- Window controls position/style
- Border radius values
- Shadow intensity
- Native integrations

---

## 14. Technical Implementation

### CSS Variables
```css
:root {
  --primary: #0071e3;
  --glass-bg: rgba(255, 255, 255, 0.72);
  --glass-border: rgba(255, 255, 255, 0.18);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12);
  --radius-xl: 20px;
}
```

### Browser Support
- Chrome/Electron: Full support
- Safari: Full support
- Firefox: Partial (no backdrop-filter)

### Fallbacks
```css
@supports not (backdrop-filter: blur(40px)) {
  background: rgba(255, 255, 255, 0.95);
}
```

---

## 15. Future Enhancements

### Potential Additions
1. **Mica effect** for Windows 11
2. **Dynamic wallpaper colors** based on desktop background
3. **Adaptive blur** based on GPU capabilities
4. **Custom themes** with user-defined glass tint
5. **HDR support** for compatible displays

---

*Design specifications v1.0 - LotoLink Desktop Application*
