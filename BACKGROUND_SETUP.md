# Basketball Court Background Setup

## Steps to Add the Basketball Court Image:

1. **Save the basketball court image:**

   - Save your basketball court image to: `src/assets/basketball-court.jpg`
   - (or `basketball-court.png` depending on the format)

2. **Update the CSS reference:**
   - Open `src/global_styles.css`
   - Find the line with `background-image: url('data:image/svg+xml;base64,...')`
   - Replace it with: `background-image: url('/assets/basketball-court.jpg');`

## What's Been Updated:

✅ **Main Panel Elevation:**

- The main content area now has enhanced box shadows
- Subtle hover effects with lift animation
- Rounded corners (16px radius)
- Semi-transparent white background with backdrop blur

✅ **Sidebar Elevation:**

- Similar depth effects applied to sidebar
- Coordinated shadow and hover effects

✅ **Card Depth:**

- All cards have enhanced shadows
- Smooth hover animations
- Better visual hierarchy

✅ **Background Preparation:**

- Body has layered background system ready
- Semi-transparent overlay for better contrast
- Fixed positioning for smooth scrolling

✅ **Additional Polish:**

- Buttons have subtle shadows and lift effects
- Tables have refined borders and shadows
- Header has semi-transparent background with blur

## Visual Effect:

The application now has a modern, layered design with:

- Basketball court visible in the background (once image is added)
- Main content "floating" above the background
- Depth created through shadows and transparency
- Smooth, professional animations on hover
