# Phase 3D: Mobile Testing Quick Reference

## Quick Start: Test on Mobile

### Step 1: Run Dev Server

```bash
npm run dev
# Opens http://localhost:3000
```

### Step 2: Open Chrome DevTools

```
F12 or Ctrl+Shift+I (Windows/Linux)
Cmd+Option+I (Mac)
```

### Step 3: Toggle Device Toolbar

```
Ctrl+Shift+M (Windows/Linux)
Cmd+Shift+M (Mac)
```

### Step 4: Select Device

From dropdown, test these:

- iPhone SE (375px)
- iPhone 12 Pro (390px)
- Galaxy S20 (360px)
- iPad (768px)

---

## What to Test

### ✅ Layout (No Scroll, No Overflow)

Navigate to each page and check:

- [ ] Dashboard - no horizontal scroll
- [ ] Contacts - cards fit on screen
- [ ] Conversations - sidebar visible
- [ ] Deals/Pipeline - columns fit
- [ ] Tasks - list fits width
- [ ] Reports - content readable
- [ ] Analytics - charts responsive

### ✅ Modals/Dialogs

Open each modal and verify:

- [ ] Modal fits in viewport height
- [ ] Modal fits in viewport width
- [ ] Close button is tappable (44px+)
- [ ] Form inputs have 44px min height
- [ ] Buttons don't overlap
- [ ] Text is readable

**How to test modals:**

1. Dashboard → Click "Novo Negócio" button
2. Contacts → Click "Novo Contato" button
3. Tasks → Click "Deletar" on any task
4. Check each modal closes properly

### ✅ Button Interactions

Test ripple effect on:

- [ ] Primary buttons (default)
- [ ] Outline buttons
- [ ] Ghost buttons
- [ ] Destructive buttons
- [ ] Icon buttons

**Note:** On touch devices, you'll see the ripple on `:active` state

### ✅ Page Transitions

Check fade-in animation when navigating:

- [ ] Dashboard loads with fade
- [ ] Contacts page fades in
- [ ] Conversations smooth transition
- [ ] Pipeline smooth transition

**Duration:** Should feel snappy (200-300ms)

### ✅ Network Throttling

**Setup:**

1. DevTools → Network tab
2. Throttle: "Slow 3G"
3. Hard refresh: Ctrl+Shift+R

**Check:**

- [ ] Page loads in < 5 seconds
- [ ] Skeleton screens appear first
- [ ] Content loads progressively
- [ ] No layout shift (CLS)
- [ ] Animations smooth (60fps)

---

## Common Issues & Fixes

### Issue: Modal too wide on small phone

**Fix:** Already applied in CSS

- Modal width: `calc(100% - 2rem)` on mobile
- Max-height: respects viewport

### Issue: Button too small for touch

**Fix:** Already applied

- Min 44px × 44px on mobile
- 48px × 48px for icon buttons

### Issue: Ripple effect invisible

**Fix:** Already applied

- Light buttons: `rgba(0, 0, 0, 0.12)` ripple
- Dark buttons: `rgba(255, 255, 255, 0.5)` ripple

### Issue: Hover effects don't work on touch

**Fix:** Already applied

- Active state for touch: `scale(0.98)`
- Hover disabled on touch devices via `@media (hover: none)`

### Issue: Animations too slow

**Fix:** Already applied

- 200ms animations on mobile
- 300ms on desktop
- Respects `prefers-reduced-motion`

---

## Performance Metrics

### Target Metrics

- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.8s

### How to Measure

1. DevTools → Lighthouse tab
2. Click "Analyze page load"
3. Wait for report
4. Check metrics section

---

## Responsive Breakpoints

### Current Setup

```
Mobile: < 640px
Tablet: 641px - 1024px
Desktop: > 1024px

Touch devices: max-width 768px
Hover devices: min-width 769px
```

### What Changes on Mobile

- Modal: full width minus margins
- Buttons: 44px minimum height
- Animation: 200ms instead of 300ms
- Ripple: darker color on light bg
- Forms: font-size 16px (prevent zoom)

---

## Testing Devices

### Recommended Phones

- iPhone SE (375 × 667)
- iPhone 12 Pro (390 × 844)
- Galaxy S20 (360 × 800)
- Pixel 6 (412 × 915)

### Recommended Tablets

- iPad (768 × 1024)
- iPad Air (820 × 1180)
- Galaxy Tab S6 (800 × 1280)

### Recommended Desktop

- 1366 × 768 (most common)
- 1920 × 1080 (Full HD)
- 2560 × 1440 (4K)

---

## Keyboard Testing

### Mobile Keyboard Issues

- [ ] Form inputs have 16px font (no iOS zoom)
- [ ] Min-height 44px for inputs
- [ ] Labels above inputs for clarity
- [ ] Submit button visible after keyboard opens

### Test These Forms

- Create Contact form
- Create Deal form
- Create Task form
- Search/Filter inputs

---

## Network Simulation

### Slow 3G

- Download: 400 kbps
- Upload: 400 kbps
- Latency: 400ms
- **Realistic mobile experience**

### Slow 4G

- Download: 4 Mbps
- Upload: 3 Mbps
- Latency: 20ms
- **Better mobile experience**

### Test At:

1. Page load time
2. Skeleton appearance
3. Animation smoothness
4. Error handling

---

## Accessibility on Mobile

### Check These

- [ ] Touch targets ≥ 44×44px
- [ ] Tap target spacing ≥ 8px
- [ ] Text size ≥ 16px
- [ ] Contrast ratio ≥ 4.5:1
- [ ] No small buttons

### Tools

- Chrome DevTools → Accessibility panel
- WAVE browser extension
- axe DevTools

---

## Browser Testing

### Mobile Browsers

- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] Firefox Mobile
- [ ] Samsung Browser

### How to Test

1. Use actual device if possible
2. Or use cloud testing (BrowserStack, etc)
3. Or test in Chrome DevTools device emulation

---

## Next Steps After Testing

If all tests pass:

1. ✅ Run: `npm run build`
2. ✅ Commit: "feat: phase 3D - mobile responsiveness"
3. ✅ Move to next phase

If issues found:

1. Document issues
2. Create fixes
3. Re-test
4. Commit

---

## Checklist Summary

**Before You Start**

- [ ] npm run dev is running
- [ ] DevTools is open
- [ ] Device toolbar is enabled
- [ ] iPhone SE is selected

**Layout Testing**

- [ ] All pages fit viewport
- [ ] No horizontal scroll
- [ ] Text is readable
- [ ] Images are visible

**Animation Testing**

- [ ] Page transitions smooth
- [ ] Modal animations work
- [ ] Button ripple visible
- [ ] No jank (60fps)

**Touch Testing**

- [ ] Buttons are tappable
- [ ] Modals can be closed
- [ ] Forms are usable
- [ ] Scrolling is smooth

**Performance Testing**

- [ ] Slow 3G load < 5s
- [ ] FCP < 1.8s
- [ ] LCP < 2.5s
- [ ] Animations smooth

**Result**

- [ ] All tests passed
- [ ] Ready to commit
- [ ] Ready for next phase

---

Generated: 17 de dezembro de 2025
