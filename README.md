# Veer — Video Editor Portfolio

A cinematic, single-page portfolio for **Veer** in forest green, black and off-white.
Built on the Sylva hero (growing moss-root 3D scene, liquid-metal buttons, magnifying dock nav),
with a full portfolio site underneath. No build step, no framework: just open `index.html`.

> "Heyy im Veer. Here to change your perspective."

---

## 1. What's in the folder

```
veer-portfolio/
├── index.html        ← the page (hero + all sections)
├── config.js         ← ★ ALL your links, numbers and videos live here
├── css/site.css      ← styles for everything below the hero
├── js/site.js        ← gallery, video pop-up, filters, form, link wiring
├── js/services.js    ← the pinned scroll-driven Services section
├── assets/
│   ├── hero-edit.svg ← placeholder art for the "Featured Edit" card
│   └── hero-reel.svg ← placeholder art for the "Reel Spotlight" card
└── README.md
```

## 2. Quick start

1. Open `config.js` in any text editor (Notepad, VS Code…).
2. Replace every placeholder (anything with `YOUR_`, `XXXX` or `yourdomain`).
3. Save, then open `index.html` in your browser (double-click is fine) and refresh.

You never need to touch `index.html` for links or videos. The page fills them in automatically.

> **Internet needed:** the 3D moss-root in the hero loads three.js from a CDN, and the
> Lexend font and YouTube thumbnails also come from the web. If you're offline, everything still
> works, but the 3D root won't grow. To make it fully offline, download
> `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` and save it as
> `assets/three.min.js` (the page already looks for it there as a backup).

## 3. What to replace in `config.js`

| Setting | What to put | Example |
|---|---|---|
| `links.youtube` | Your YouTube channel URL | `https://www.youtube.com/@veeredits` |
| `links.instagram` | Your Instagram profile URL | `https://www.instagram.com/veer.edits` |
| `contact.whatsapp` | Country code + number, **digits only** (no `+`, spaces, dashes) | `919876543210` |
| `contact.whatsappMessage` | Text pre-filled when someone taps a WhatsApp button | `"Hi Veer! …"` |
| `contact.phone` | Number shown on the page; also used for tap-to-call | `+91 98765 43210` |
| `contact.email` | Optional. Set to `""` to hide email everywhere | `veer@gmail.com` |
| `showreel` | Video that plays from the big hero play button | a YouTube link |
| `featured` | The 2 floating hero video cards (see below) | |
| `stats` | The numbers in the hero and About section | `{ value: "150+", label: "Projects" }` |
| `photo` | Optional portrait for About, e.g. `assets/veer.jpg`. `""` shows a "V" monogram | |
| `videos` | The portfolio gallery (see below) | |

Where each one shows up:

- **YouTube / Instagram buttons:** hero, "Selected work", Contact cards, footer.
- **WhatsApp / Hire me:** hero, floating "Hire me" button, Hire CTA, Contact, footer.
- **Phone and email:** Contact cards and footer. Leaving `email` empty hides it everywhere.

## 4. Adding videos

Each video is one line in `config.js`:

```js
{ category: "youtube", title: "My Vlog Edit", meta: "YouTube · Long-form",
  url: "https://www.youtube.com/watch?v=abc123", thumb: "" },
```

- **`category`**: `"youtube"`, `"reels"`, `"cinematic"` or `"other"` (these drive the filter chips).
- **`url`**: YouTube (`watch`, `youtu.be`, `shorts`), Instagram Reel/post, Vimeo, or a direct `.mp4`.
  - YouTube, Instagram Reels/posts, Vimeo and `.mp4` files **play inside the site** in a pop-up,
    with an "Open original" button underneath.
  - Instagram's embed can occasionally be blocked for private accounts or certain posts. Use the
    "Open original" button as the fallback.
- **`thumb`** (optional): image path or URL. YouTube thumbnails are fetched **automatically**, so
  leave `""` for those. For Instagram or `.mp4` videos, add a screenshot, e.g.
  `thumb: "assets/reel-1.jpg"`. With no thumb, a stylish green placeholder is shown.
- Add, delete or reorder lines freely. The gallery rebuilds itself.

### The floating hero cards

`featured` holds exactly two items that become the floating cards in the hero. Each has
`label`, `title`, `url` and an optional `thumb`. Tapping a card (or its play button) opens the video.
Until you add a real YouTube link or a `thumb`, the cards show the built-in artwork from `assets/`.

## 5. Editing the text

- **About text, Services, headings and footer copy** are plain HTML in `index.html`. For a service, edit its `<article class="svcx__panel">` (title, text, tags) and its name in the list beside it.
  Search for the words you want to change (for example "Video Editing") and edit them in place.
- **Colours** are CSS variables at the top of `css/site.css` (forest green, black, off-white).

## 6. Putting it online (free options)

Upload the whole folder (keep the structure) to any static host:

- **Netlify Drop**: go to app.netlify.com/drop and drag the folder in.
- **Vercel**, **Cloudflare Pages** or **GitHub Pages**: all free for static sites.

Open the live link on your phone to check it before sharing.

## 7. Features

- Cinematic hero with 3D root, liquid-metal buttons, pointer parallax and an animated dock nav
- Two floating video cards with hover motion and a pixel "transmission" reveal; click to play
- Filterable video gallery (All / YouTube / Reels / Cinematic / Motion)
- In-page video pop-up (Esc or click outside to close, focus is trapped for keyboard users)
- About, Hire-me banner, Contact with WhatsApp form, footer
- Floating WhatsApp "Hire me" button after you scroll past the hero
- Services as a pinned scroll story: scroll and each of the 6 services takes the stage with blur, slide and rotate motion, plus a clickable list, counter and progress bar (plain cards if "reduce motion" is on)
- Smooth scrolling, scroll reveals, active-section highlight in the dock
- Responsive from small phones to large desktops; honours "reduce motion" settings

## 8. Performance (phones and low-power devices)

The hero has live 3D, so the page automatically switches to a **lite mode** on phones, tablets and
low-power devices: the liquid-metal shaders become static glass buttons, the 3D root is smaller and
runs at about 30fps, and all hero rendering pauses once you scroll past it. Desktop keeps the full effect.

To force a mode for testing, add this to the address: `index.html?lite=1` (lite) or `?lite=0` (full).

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| Tapping a button shows a "add your link" message | That value in `config.js` still has a placeholder. This is intentional so visitors never hit a dead page. |
| Nothing is filled in at all | There's a typo in `config.js` (missing quote or comma). Check the browser console (F12). |
| WhatsApp opens a blank chat | Number must be digits only with country code, e.g. `919876543210`. |
| No thumbnail on a gallery card | Only YouTube is automatic. Add a `thumb` image for other platforms. |
| Instagram Reel doesn't play in the pop-up | Instagram sometimes blocks embeds. Tap "Open original" under the video. |
| Hero has no 3D root | three.js couldn't load (offline or blocked). See the note in section 2. |
| Page looks unstyled | Keep `css/`, `js/`, `assets/` and `config.js` next to `index.html`. |

Made with care for Veer.
