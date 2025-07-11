export type MeditationCue = {
  time: number; // Time in seconds when the cue should be read
  text: string;
};

export type TimedMeditationScript = {
  title: string;
  duration: number; // Total duration in seconds
  cues: MeditationCue[];
};

export const scripts: TimedMeditationScript[] = [
  {
    title: 'Mindful Breathing',
    duration: 300, // 5 minutes
    cues: [
      {
        time: 0,
        text: `Find a comfortable position, either sitting on a chair with your feet flat on the floor, or on a cushion on the floor. Allow your back to be straight but not stiff. Gently close your eyes. Bring your attention to your breath. Notice the sensation of the air entering your nostrils, filling your lungs, and then leaving your body. Don't try to change your breathing in any way. Simply observe it.`,
      },
      {
        time: 120,
        text: `As you breathe, you may notice your mind wandering. This is completely normal. When you realize your mind has wandered, gently and without judgment, guide your attention back to your breath. Feel the gentle rise and fall of your chest or abdomen with each inhale and exhale.`,
      },
      {
        time: 270,
        text: `You are in the final moments of this session. Continue to rest your awareness on the simple, natural rhythm of your breath. When you're ready, slowly begin to bring your awareness back to the room. Wiggle your fingers and toes. And when you feel ready, gently open your eyes.`,
      },
    ],
  },
  {
    title: '15-Minute Body Scan',
    duration: 900, // 15 minutes
    cues: [
      {
        time: 0,
        text: `Let's begin the Body Scan. Find a comfortable position, lying on your back if possible, with your arms by your sides and your legs uncrossed. Close your eyes gently and take a few deep breaths to settle in.`,
      },
      {
        time: 60,
        text: `Bring your awareness to the toes of your left foot. Notice any sensations you feel there - perhaps warmth, coolness, or tingling. Slowly, expand your awareness to include your entire left foot, ankle, and calf.`,
      },
      {
        time: 180, // 3 minute mark
        text: `Now, move your attention up to your left knee and thigh. Be aware of any and all sensations without judgment. Now, shift your focus to your right foot, and begin scanning upwards through the right leg, just as you did with the left.`,
      },
      {
        time: 300, // 5 minute mark
        text: `Bring your awareness now to your pelvis and abdomen. Notice the gentle rise and fall with each breath. Let go of any tension you might be holding here.`,
      },
      {
        time: 480, // 8 minute mark
        text: `Move your focus up into your chest and shoulders. Feel the weight of your body sinking into the surface beneath you. Scan your awareness down your arms to your fingertips, noticing any sensations along the way.`,
      },
      {
        time: 660, // 11 minute mark
        text: `Gently bring your attention to your neck and face. Soften your jaw, your cheeks, and the small muscles around your eyes. Let your forehead be smooth and relaxed.`,
      },
      {
        time: 840, // 14 minute mark
        text: `Now, for the final minute, expand your awareness to encompass your entire body, from the top of your head to the tips of your toes. Feel the breath moving through you, a gentle wave of energy. Rest in this state of wholeness.`,
      },
      {
        time: 890,
        text: `Our session is coming to an end. Slowly begin to bring your awareness back to the room. Wiggle your fingers and toes. When you feel ready, gently open your eyes.`,
      },
    ],
  },
  {
    title: 'Loving-Kindness',
    duration: 600, // 10 minutes
    cues: [
      {
        time: 0,
        text: `Sit in a comfortable and relaxed position. Close your eyes and take a few deep breaths. Bring to mind a feeling of warmth and kindness. We'll start by offering this kindness to yourself. Silently repeat: May I be happy. May I be healthy. May I be safe.`,
      },
      {
        time: 180,
        text: `Now, bring to mind a loved one. Picture them clearly. Direct your feelings of loving-kindness towards them, repeating: May you be happy. May you be healthy. May you be safe.`,
      },
      {
        time: 360,
        text: `Next, think of a neutral person. Someone you see but don't know well. Offer the same phrases of loving-kindness to them.`,
      },
      {
        time: 540,
        text: `Finally, expand your awareness to include all living beings everywhere. Extend your loving-kindness to everyone: May all beings be happy. May all beings be healthy. May all beings be safe. When you're ready, slowly open your eyes.`,
      },
    ],
  },
  {
    title: 'Timer Only (5 min)',
    duration: 300,
    cues: [],
  },
  {
    title: 'Timer Only (10 min)',
    duration: 600,
    cues: [],
  },
  {
    title: 'Timer Only (15 min)',
    duration: 900,
    cues: [],
  },
];
