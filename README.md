<div align="center">
  <img src="https://i.ibb.co/qMyT5c8B/img1.png" alt="dropoff.lol – two people sharing a file directly between their browsers" width="55%" />
  <h1>dropoff.lol</h1>
  <h3>Send files peer to peer, right from your browser</h3>
  <p><em>Nothing is permanently uploaded. No account required. No sign-ups.</em></p>

  <p>
    <a href="https://github.com/ketanofc/dropoff/blob/main/README.md"><img src="https://img.shields.io/badge/depends-0%20accounts-0ea5e9" alt="No accounts" /></a>
    <a href="https://github.com/ketanofc/dropoff/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-BSD--3--Clause-84cc16" alt="License: BSD 3-Clause" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-blue" alt="TypeScript" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-087ea4" alt="React 19" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8" alt="Tailwind CSS 4" /></a>
    <a href="https://peerjs.com/"><img src="https://img.shields.io/badge/PeerJS-WebRTC-ef4444" alt="PeerJS / WebRTC" /></a>
  </p>
</div>

---

**dropoff.lol** is a browser-based, peer-to-peer file sharing service. Built on
[WebRTC](https://www.webrtc.org/), it sends files **directly between two
browsers** – there is no upload step, no intermediary storage, and nothing is
ever permanently uploaded to a server. Because the data moves straight from one
device to the other, transfers stay fast, private, and cheap to run.

Try it at **[dropofflol.vercel.app](https://dropofflol.vercel.app)**.

## Features

- **Direct peer-to-peer transfers.** Files stream over an encrypted WebRTC data
  channel between the sender and receiver – your file never touches an
  application server.
- **No account, no install, no sign-up.** Open the page, pick a file, share a link.
- **Multi-file transfers.** Send several files at once; the receiver gets them
  all with live per-transfer progress.
- **Preview before you accept.** Image thumbnails and text snippets are sent in
  a lightweight manifest first, so the receiver can see exactly what is coming
  before deciding to accept or decline.
- **Chunked streaming with flow control.** Files are read in 64&nbsp;KB chunks,
  with backpressure applied on the data channel to avoid buffer bloat on large
  transfers.
- **Share links that just work.** Copy the link or use the native share sheet
  on mobile with one tap.
- **Thoughtful UI everywhere.** Fully responsive from small phones to large
  desktops, with an animated light/dark theme.
- **Respects your privacy.** No permanent uploads, no user accounts, and a
  plain-terms [Terms of use](/terms).

## How it works

1. **Pick your files.** The sender selects one or more files – nothing leaves
   the browser yet.
2. **Share the generated link.** The app spins up a temporary session and hands
   you a `dropoff.lol/receive/<id>` link.
3. **The receiver opens the link.** They see a preview of the files and choose
   **Accept & download** or **Decline**.
4. **The files stream directly.** WebRTC moves the data straight from the
   sender's browser to the receiver's. The sender keeps their tab open until the
   transfer finishes.

## Browser support

All features rely on WebRTC data channels, which are supported in every
evergreen browser.

|                     | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png" width="32" alt="Chrome" /><br />Chrome | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png" width="32" alt="Firefox" /><br />Firefox | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png" width="32" alt="Edge" /><br />Edge | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/safari/safari_48x48.png" width="32" alt="Safari" /><br />Safari | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png" width="32" alt="Opera" /><br />Opera | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/vivaldi/vivaldi_48x48.png" width="32" alt="Vivaldi" /><br />Vivaldi | <img src="https://raw.githubusercontent.com/alrra/browser-logos/main/src/brave/brave_48x48.png" width="32" alt="Brave" /><br />Brave |
| ------------------- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Desktop**         |       |       |       |       |       |       |       |
| File transfer (WebRTC)           | ✅ | ✅ | ✅ | \* | ✅ | ✅ | ✅ |
| OPFS storage (large files)       | ✅ | ✅ | ✅ | \* | ✅ | ✅ | ⚠️ limited |
| Resumable downloads              | ✅ | ✅ | ✅ | \* | ✅ | ✅ | ⚠️ limited |
| SHA-256 integrity check          | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Password protection              | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multi-file zip download          | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mobile**           |       |       |       |       |       |       |       |
| File transfer (WebRTC)           | ✅ | ✅ | ✅ | \* | ✅ | ✅ | ✅ |
| OPFS storage (large files)       | ✅ | ⚠️ limited | ✅ | \* | ✅ | ✅ | ⚠️ limited |
| Resumable downloads              | ✅ | ⚠️ IDB fallback | ✅ | \* | ✅ | ✅ | ⚠️ limited |
| SHA-256 integrity check          | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Streaming save (no memory cap)   | ✅ | ⚠️ partial | ✅ | \* | ✅ | ✅ | ✅ |
| Password protection              | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Auto-reconnect on network switch | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> ⚠️ = supported with limitations. OPFS write access varies by browser version
> and storage quota policies.
>
> \* = Not yet tested. Safari works for basic transfers; reachability between
> two peers depends on network conditions, firewalls, and NAT behavior, which
> WebRTC tries to traverse automatically.

## Tech stack

- [TanStack Start](https://tanstack.com/start/latest) + [TanStack Router](https://tanstack.com/router/latest) – SSR-first React framework
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/), Vite, and [Nitro](https://nitro.unjs.io/)
- [Tailwind CSS](https://tailwindcss.com/) 4, shadcn/ui-style components, [Lucide](https://lucide.dev/) icons
- [PeerJS](https://peerjs.com/) – WebRTC peer connections and data channels
- [TanStack Query](https://tanstack.com/query/latest) – server-state for routing/shell

## Getting started

```bash
# Clone the repository
git clone https://github.com/ketanofc/dropoff.git
cd dropoff

# Install dependencies (bun works too)
npm install

# Start the development server
npm run dev

# Production build
npm run build

# Preview the production build
npm run preview
```

### Useful commands

```bash
npm run lint    # ESLint
npm run format  # Prettier (auto-fix)
```

### Project structure

```
src/
├── assets/             # Asset manifests (illustrations, etc.)
├── components/
│   ├── ui/             # shadcn/ui-style primitives
│   └── ...             # Shell, file icons, theme toggler, text animations
├── content/            # Static markdown (terms)
├── hooks/              # Shared React hooks
├── lib/                # Transfer logic, utilities, error handling
└── routes/             # TanStack Router file routes
    ├── receive.$id.tsx # Receive page (/receive/:id)
    ├── index.tsx       # Send page (/)
    └── terms.tsx       # Terms of use
```

## Deployment

The app is a standard TanStack Start (Vite + Nitro) project and can be
deployed to any platform that supports the Nitro output:

```bash
npm run build
npx nitro deploy --prebuilt
```

The live site is hosted on **Vercel** at
[dropofflol.vercel.app](https://dropofflol.vercel.app).

## FAQ

**How are my files sent?** Directly from your browser to the recipient's
browser over a WebRTC data channel. Files never pass through or get stored on
an application server.

**Do I need to create an account?** No. dropoff.lol has no accounts and no
sign-up flow.

**Show do I send a file?** Pick a file (or several), share the link with the
recipient, and keep your tab open until the transfer completes. The link is only
valid while the sender's session is active.

**How large can my files be?** There is no app-level size limit – files stream
directly between browsers in 64&nbsp;KB chunks with flow control, so memory stays
low even for large files. The practical ceiling is set by the browser, device,
and network rather than the app:

| Browser / device        | Reliable transfer size |
| ----------------------- | ---------------------- |
| Chrome (desktop)        | ~1–2&nbsp;GB           |
| Firefox                 | ~1&nbsp;GB             |
| iPhone / Safari (mobile)| a few hundred MB       |

> Multi-gigabyte transfers are theoretically possible but less reliable, and
> total time scales with upload bandwidth (1&nbsp;GB ≈ several minutes on a
> typical home connection). Keep the sender's tab open and in the foreground for
> the whole transfer.

**Are my transfers encrypted?** Yes. All WebRTC communications are encrypted in
transit with DTLS. Note that peer signaling metadata travels through PeerJS's
public servers to help two browsers find each other.

**Do I need to keep a tab open?** The sender must keep their tab open until the
transfer finishes, otherwise the link breaks – that's the trade-off for no
server-side storage.

## License

dropoff.lol is released under the [BSD 3-Clause
License](https://github.com/ketanofc/dropoff/blob/main/LICENSE). Copyright
(c) 2026, Ketanofc.