# 🤝 VolunteerMy — Improvements Changelog

A hardening & polish pass over the original build.

## Security (backend)
1. Security-headers middleware (nosniff, frame-deny, referrer, XSS, permissions-policy)
2. Rate limiter on auth routes (10/min)
3. JSON body size limit (100kb)
4. `trust proxy` for correct client IPs
5. Server-side email format validation
6. Server-side password length validation
7. Input sanitisation/trimming + max-length clamping (name, org, skills)
8. Email lowercased on register & login
9. Login tolerant of missing password
10. Centralised error handler
11. JSON 404 handler
12. Health endpoint returns a timestamp

## Accessibility
13. **prefers-reduced-motion** respected across all animations + global CSS override
14. **Skip-to-content** link
15. Semantic `<main id="main">` landmark with focus management
16. `:focus-visible` outlines
17. `aria-label`/`aria-expanded` on mobile menu toggle
18. Decorative emoji `aria-hidden`
19. `aria-live` toast region
20. `.sr-only` utility

## UX
21. Global **toast notifications** wired into sign-ups and load errors
22. Replaced inline flash banners with toasts
23. **Loading skeletons** on the opportunities grid (replaces "Loading…")
24. Friendly **empty state** with illustration + guidance
25. Concise success copy on sign-up ("You're in for …")

## Mobile / responsive
26. **Hamburger menu** with animated dropdown under 720px
27. Reduced section padding on small screens
28. Toast region clamps to viewport width

## SEO
29. Per-page `<title>` + meta description via `useDocumentTitle`
30. Open Graph + Twitter Card tags
31. `theme-color` + `color-scheme` meta

## Resilience / code quality
32. **Error boundary** with recovery screen
33. API client **request timeout** (12s) via AbortController
34. Friendly offline / timeout messages
35. Auto-logout + token clear on 401
36. **Scroll-to-top** on route change
37. Branded **404 page**

> Many items are cross-cutting, so the real surface improved is larger than the count.
