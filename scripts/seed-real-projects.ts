import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);

async function seed() {
  console.log("Seeding real project details...");

  // 1. Get or create creator founder profile for Aman
  const founderRows = await sql`SELECT id FROM profiles WHERE email = 'hello@amanyadav.dev' LIMIT 1`;
  let founderId = founderRows[0]?.id;

  if (!founderId) {
    const newFounder = await sql`
      INSERT INTO profiles (
        id, clerk_user_id, email, full_name, username, bio, website_url, github_handle, role, karma_score
      ) VALUES (
        gen_random_uuid(),
        'clerk_aman_yadav',
        'hello@amanyadav.dev',
        'Aman Yadav',
        'amanyadav',
        'Full-stack developer & indie creator building web and Android products.',
        'https://amanyadav.dev',
        'tentorProduction',
        'founder',
        150
      )
      RETURNING id
    `;
    founderId = newFounder[0].id;
    console.log("Created founder profile for Aman Yadav:", founderId);
  }

  // 2. Update Capgen
  await sql`
    UPDATE startups SET
      founder_id = ${founderId},
      name = 'Capgen',
      tagline = 'Free AI Video Caption Generator for Reels, Shorts & TikTok',
      description = '## Transform raw footage into scroll-stopping reels with kinetic captions\n\nCapgen turns any video''s audio into perfectly timed captions, directly in your browser. With word-level timing, customizable creator styles, and multi-language support (39 languages), Capgen gives video creators everything needed to stand out on Instagram Reels, YouTube Shorts, and TikTok without watermarks.\n\n### Core Features\n- **Auto Captions:** High-accuracy speech recognition.\n- **Word-Level Timing:** Highlights words exactly as they are spoken.\n- **Creator Presets:** Dynamic animated typography (Bold, Neon, Pop).\n- **Zero Watermarks:** Free export in 9:16, 1:1, and 16:9 aspect ratios.',
      website_url = 'https://capgen.app/',
      logo_url = 'https://capgen.app/favicon.ico',
      banner_url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=675&fit=crop',
      stage = 'launched',
      target_market = 'global_export',
      status = 'approved',
      verified = true,
      upvotes_count = GREATEST(upvotes_count, 14),
      views_count = GREATEST(views_count, 128)
    WHERE slug = 'capgen'
  `;
  console.log("Updated Capgen startup record");

  // 3. Update Aman Yadav Portfolio
  await sql`
    UPDATE startups SET
      founder_id = ${founderId},
      name = 'Aman Yadav',
      tagline = 'Full-Stack Developer, Systems Builder & Indie Creator',
      description = '## Turning ideas into real digital products\n\nAman Yadav is a full-stack engineer and indie creator crafting end-to-end web applications, Android applications, and distributed backend systems. Creator of live products including CapGen (AI Video Captions), YapPDF (Offline PDF Voice Reader), and developer tools.\n\n### Stack & Expertise\n- **Frontend:** Next.js, React, TypeScript, Tailwind CSS\n- **Mobile:** Android native (Kotlin), Jetpack Compose\n- **Backend:** Node.js, PostgreSQL, Serverless Architectures, Cloudflare\n- **Philosophy:** Performance, privacy-first offline capabilities, and clean UI engineering.',
      website_url = 'https://amanyadav.dev/',
      logo_url = 'https://github.com/tentorProduction.png',
      banner_url = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=675&fit=crop',
      stage = 'launched',
      target_market = 'global_export',
      status = 'approved',
      verified = true,
      upvotes_count = GREATEST(upvotes_count, 22),
      views_count = GREATEST(views_count, 210)
    WHERE slug = 'aman-yadav'
  `;
  console.log("Updated Aman Yadav startup record");

  // 4. Update YapPDF
  await sql`
    UPDATE startups SET
      founder_id = ${founderId},
      name = 'YapPDF',
      tagline = 'Free Offline PDF Voice Reader for Android — Listen like an Audiobook',
      description = '## Listen to any PDF like an audiobook — 100% offline & private\n\nYapPDF turns textbooks, research papers, and technical reports into clear spoken audio using natural on-device US and UK voice synthesis. Zero cloud uploads, zero ads, and no account required.\n\n### Why YapPDF?\n- **100% On-Device:** Audio is synthesized directly on your hardware without internet or cloud queues.\n- **Pitch-Preserved Speed:** Speed up to 2x without chipmunk distortion.\n- **Sentence Tracking:** Visual real-time highlighting synchronizes reading with listening.\n- **Background Audio:** Keeps playing while your screen is locked with headset controls.',
      website_url = 'https://yappdf.app/',
      logo_url = 'https://yappdf.app/favicon.ico',
      banner_url = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&h=675&fit=crop',
      stage = 'launched',
      target_market = 'global_export',
      status = 'approved',
      verified = true,
      upvotes_count = GREATEST(upvotes_count, 18),
      views_count = GREATEST(views_count, 164)
    WHERE slug = 'yappdf'
  `;
  console.log("Updated YapPDF startup record");

  // 5. Connect tags
  const startups = await sql`SELECT id, slug FROM startups WHERE slug in ('capgen', 'aman-yadav', 'yappdf')`;
  const tagList = await sql`SELECT id, slug FROM tags`;
  const tagMap = new Map(tagList.map(t => [t.slug, t.id]));

  const mappings: Record<string, string[]> = {
    capgen: ['ai-ml', 'devtools', 'creator-tools'],
    'aman-yadav': ['devtools', 'next-js', 'portfolio'],
    yappdf: ['offline-first', 'accessibility', 'ai-ml']
  };

  for (const s of startups) {
    const neededTags = mappings[s.slug] || [];
    for (const tagSlug of neededTags) {
      const tagId = tagMap.get(tagSlug);
      if (tagId) {
        await sql`
          INSERT INTO startup_tags (startup_id, tag_id)
          VALUES (${s.id}, ${tagId})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  }
  console.log("Tags linked for startups");

  // 6. Add Testing Quests for CapGen and YapPDF if they don't exist
  const capgen = startups.find(s => s.slug === 'capgen');
  if (capgen) {
    const existingQuest = await sql`SELECT id FROM testing_quests WHERE startup_id = ${capgen.id} LIMIT 1`;
    if (!existingQuest[0]) {
      await sql`
        INSERT INTO testing_quests (
          startup_id, title, task_instructions, target_devices, reward_description, max_submissions, status
        ) VALUES (
          ${capgen.id},
          'Test CapGen Word-Level Caption Sync on 9:16 Vertical Video',
          'Upload a 30-60 second vertical video with speech. Verify that word-level highlighting matches audio rhythm, test exporting as 9:16 MP4, and report any sync latency or rendering glitches.',
          'Chrome / Safari / Firefox on Desktop or Mobile',
          '50 Karma + Early Creator Badge',
          25,
          'active'
        )
      `;
      console.log("Created testing quest for CapGen");
    }
  }

  const yappdf = startups.find(s => s.slug === 'yappdf');
  if (yappdf) {
    const existingQuest = await sql`SELECT id FROM testing_quests WHERE startup_id = ${yappdf.id} LIMIT 1`;
    if (!existingQuest[0]) {
      await sql`
        INSERT INTO testing_quests (
          startup_id, title, task_instructions, target_devices, reward_description, max_submissions, status
        ) VALUES (
          ${yappdf.id},
          'Verify Background Audio Playback & Headset Controls on Android',
          'Open a multi-page PDF on YapPDF for Android, start speech synthesis, lock the screen, and test audio playback continuity along with Bluetooth headset play/pause controls.',
          'Android 8.0+ Devices',
          '75 Karma + Beta Tester Recognition',
          20,
          'active'
        )
      `;
      console.log("Created testing quest for YapPDF");
    }
  }

  console.log("Real projects seed complete!");
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
