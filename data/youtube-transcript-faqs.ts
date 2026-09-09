import type { FAQ } from './faqs'

/**
 * FAQ for /tools/youtube-transcript-generator.
 *
 * Unlike the other two tools, this page is indexed and built to rank, so these
 * answers do double duty: they are rendered as an accordion *and* emitted as
 * `FAQPage` JSON-LD on the page. The JSON-LD is also what carries them into the
 * markdown representation — an unopened accordion server-renders nothing, so
 * without it an agent reading the page would see no answers at all. See
 * CLAUDE.md → Markdown for Agents.
 *
 * Every answer here has to stay true to what the tool actually does. A claim
 * about limits or storage that drifts from `lib/tools/youtube/` is worse than
 * no answer.
 */
export const youtubeTranscriptFaqs: FAQ[] = [
  {
    question: 'Is this free?',
    answer:
      'Yes — completely. No signup, no account, no credit card, and no watermark on anything you download. There is a fair-use limit of ten transcripts per person per day so the tool stays available for everyone.',
  },
  {
    question: 'Which YouTube links work?',
    answer:
      'All of them: standard watch pages, youtu.be short links, Shorts, live replays and embed URLs. You can also paste just the video ID. Timestamps and playlist parameters on the end are ignored rather than rejected.',
  },
  {
    question: 'What if the video has no captions?',
    answer:
      'Then there is nothing to transcribe and we will tell you so. This tool reads the caption track YouTube already holds; it does not transcribe audio itself. YouTube generates captions automatically for most videos, but not for every one — very short, very new, or music-only videos often have none.',
  },
  {
    question: 'Can I get the transcript with timestamps?',
    answer:
      'Yes. Switch between plain text, timestamped lines, SRT and VTT once the transcript loads. Switching is instant and does not re-read the video, because all four are generated in your browser from the same data.',
  },
  {
    question: 'What is the difference between SRT and VTT?',
    answer:
      'Both are subtitle files. SRT is the older, near-universal format that video editors and desktop players expect. VTT is the web standard, used by the HTML <track> element for captions on your own site. The timings are identical; only the formatting differs.',
  },
  {
    question: 'Which language do I get?',
    answer:
      'Whichever languages the video has captions in. We default to a creator-written track over an auto-generated one, since the written version is more accurate, and if the video has several you can switch between them from a dropdown.',
  },
  {
    question: 'How accurate is it?',
    answer:
      'Exactly as accurate as the captions on the video. A track the creator wrote or corrected is usually near-perfect. An auto-generated one mishears names, jargon and crosstalk — we label which kind you are looking at so you know how much to trust it.',
  },
  {
    question: 'Do you store the transcript or my video links?',
    answer:
      'No. Transcripts are not written to our database at all — we fetch, hand it to you, and keep nothing. Fetched transcripts sit in a temporary edge cache for a day so a repeated link is instant, and that is the extent of it.',
  },
  {
    question: 'Can I use the transcript commercially?',
    answer:
      'That is between you and the video owner. The transcript is the video’s own caption track, and the words in it belong to whoever made it — the same rules apply as quoting any published work. We do not add any licence of our own.',
  },
  {
    question: 'Why is a design studio giving this away?',
    answer:
      'Because the people who need a transcript are usually about to publish something, and that is our work. There is no upsell in the tool and nothing is gated — if it is useful, you will know where to find us.',
  },
]
