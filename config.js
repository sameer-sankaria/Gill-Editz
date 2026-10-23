/* ==========================================================================
   VEER — SITE CONFIG
   Everything you need to personalise lives in this one file.
   Replace the placeholder values (anything containing YOUR_, XXXX or
   "yourdomain") with the real ones. Save, refresh the page — done.
   See README.md for a full walkthrough.
   ========================================================================== */

window.VEER_CONFIG = {

  /* ── Social profiles ─────────────────────────────────────────────────── */
  links: {
    youtube: "https://www.youtube.com/@YOUR_CHANNEL",      // your YouTube channel URL
    instagram: "https://www.instagram.com/YOUR_HANDLE"       // your Instagram profile URL
  },

  /* ── Contact ─────────────────────────────────────────────────────────── */
  contact: {
    // WhatsApp number: country code + number, digits only (no +, spaces or dashes).
    // Example for India: "919876543210"
    whatsapp: "+917986346652",

    // Pre-filled text when someone taps a WhatsApp button
    whatsappMessage: "Hi Veer! I found your portfolio and I'd like to work with you on a video editing project.",

    // Number shown on the page (and used for tap-to-call)
    phone: "+91 7986346652",

    // Optional. Leave as "" to hide email everywhere on the site.
    email: "hello@yourdomain.com"
  },

  /* ── Hero ────────────────────────────────────────────────────────────── */

  // Plays when someone taps the big play button in the hero
  showreel: "https://www.youtube.com/watch?v=YOUR_SHOWREEL_ID",

  // The two floating video cards in the hero.
  //   url   : YouTube / Instagram Reel / Vimeo link, or a direct .mp4 file
  //   thumb : optional image. Leave "" to use the built-in artwork
  //           (for YouTube links the thumbnail is fetched automatically).
  //   label / title : optional, overrides the card text
  featured: [
    {
      label: "Featured Edit",
      title: "Story in motion.",
      url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID_1",
      thumb: ""
    },
    {
      label: "Reel Spotlight",
      title: "Reels that hit.",
      url: "https://www.instagram.com/reel/YOUR_REEL_ID/",
      thumb: ""
    }
  ],

  /* ── Numbers (hero shows the first two, About shows all three) ───────── */
  stats: [
    { value: "100+", label: "Projects delivered" },
    { value: "3+", label: "Years editing" },
    { value: "48h", label: "Typical first draft" }
  ],

  /* ── About ───────────────────────────────────────────────────────────── */
  // Optional portrait for the About section, e.g. "assets/veer.jpg". "" = monogram.
  photo: "",

  /* ── Video portfolio ─────────────────────────────────────────────────────
     category: "youtube" | "reels" | "cinematic" | "other"
     url     : YouTube / Instagram Reel / Vimeo link, or a direct .mp4 file
     thumb   : optional image path or URL. For YouTube links it's automatic.
               For Instagram / cinematic / other, add a thumb or a stylish
               placeholder is shown.
     Add, remove or reorder as many items as you like.
  ───────────────────────────────────────────────────────────────────────── */
  videos: [
    { category: "youtube", title: "Documentary-style Vlog Edit", meta: "YouTube · Long-form", url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID_A", thumb: "" },
    { category: "reels", title: "Beat-synced Travel Reel", meta: "Instagram Reel", url: "https://www.instagram.com/reel/YOUR_REEL_ID_A/", thumb: "" },
    { category: "cinematic", title: "Cinematic Short Film Cut", meta: "Cinematic · Colour graded", url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID_B", thumb: "" },
    { category: "youtube", title: "Fast-paced Tech Review", meta: "YouTube · Long-form", url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID_C", thumb: "" },
    { category: "reels", title: "Product Launch Reel", meta: "Instagram Reel", url: "https://www.instagram.com/reel/YOUR_REEL_ID_B/", thumb: "" },
    { category: "other", title: "Motion Titles & Logo Sting", meta: "Motion graphics", url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID_D", thumb: "" },
    { category: "cinematic", title: "Event Highlight Film", meta: "Cinematic · Highlights", url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID_E", thumb: "" },
    { category: "youtube", title: "Podcast Clip Package", meta: "YouTube · Shorts", url: "https://www.youtube.com/shorts/YOUR_SHORT_ID", thumb: "" }
  ]
};
